// Imports
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808000]'
const labelClass = 'block text-sm text-gray-800 mb-1'
const btnClass = 'px-4 py-2 rounded bg-[#808000] text-white hover:opacity-90 disabled:opacity-60'

const Account = () => {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const AVATARS_BUCKET = (import.meta as any).env?.VITE_AVATARS_BUCKET ?? 'avatars'

  const subjectOptions = useMemo(
    () => ['Dentist', 'Neurosurgeon', 'Physiotherapist', 'Cardiologist', 'Dermatologist', 'Orthopedist', 'General Medicine'],
    []
  )

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (!error && data) {
        setDisplayName(data.display_name ?? '')
        setSubject(data.subject ?? '')
        setAvatarUrl(data.avatar_url ?? '')
      }
      setLoading(false)
    }
    void loadProfile()
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatarFile(file)
  }

  const uploadAvatarIfNeeded = async (): Promise<string | undefined> => {
    if (!avatarFile || !user) return undefined
    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(AVATARS_BUCKET).upload(path, avatarFile, {
      cacheControl: '3600', upsert: true, contentType: avatarFile.type || 'image/jpeg'
    })
    if (upErr) {
      // eslint-disable-next-line no-alert
      alert(`Failed to upload image: ${upErr.message}. Make sure the '${AVATARS_BUCKET}' bucket exists.`)
      return undefined
    }
    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    let newAvatarUrl = avatarUrl
    const maybeUrl = await uploadAvatarIfNeeded()
    if (maybeUrl) newAvatarUrl = maybeUrl
    const payload = {
      id: user.id,
      display_name: displayName || null,
      subject: subject || null,
      avatar_url: newAvatarUrl || null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
    if (error) {
      // eslint-disable-next-line no-alert
      alert(`Failed to save profile: ${error.message}`)
    } else {
      setAvatarUrl(newAvatarUrl)
      // eslint-disable-next-line no-alert
      alert('Profile saved!')
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded border border-gray-200">
        <p className="text-gray-800">You must be logged in to view your account.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded border border-gray-200 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-black mb-2">Account</h1>
        <p className="text-gray-800"><span className="font-medium">User ID:</span> {user.id}</p>
        <p className="text-gray-800"><span className="font-medium">Email:</span> {user.email}</p>
        {user.created_at && (
          <p className="text-gray-800"><span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleString()}</p>
        )}
      </div>

      <form onSubmit={saveProfile} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
            )}
          </div>
          <div>
            <label className={labelClass}>Profile photo</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} placeholder="Your display name" />
        </div>
        <div>
          <label className={labelClass}>Study subject / specialty</label>
          <input list="subjects" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="e.g., Dentist" />
          <datalist id="subjects">
            {subjectOptions.map((opt) => (
              <option value={opt} key={opt} />
            ))}
          </datalist>
        </div>
        <button type="submit" disabled={saving || loading} className={btnClass}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  )
}

export default Account
