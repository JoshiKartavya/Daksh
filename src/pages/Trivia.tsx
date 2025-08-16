// Imports
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

type Question = {
  id: string
  text: string
  options: string[]
  answerIndex: number
}

// Large pool of dental questions for dynamic generation
const dentalQuestionPool: Question[] = [
  {
    id: 'dq1',
    text: 'Which of the following is the primary cause of dental caries?',
    options: ['Fluoride deficiency', 'Bacterial metabolism of sugars', 'Vitamin C deficiency', 'Bruxism'],
    answerIndex: 1,
  },
  {
    id: 'dq2',
    text: 'Which tooth surface refers to the side facing the tongue?',
    options: ['Buccal', 'Lingual', 'Mesial', 'Distal'],
    answerIndex: 1,
  },
  {
    id: 'dq3',
    text: 'Which radiographic view is best to detect interproximal caries?',
    options: ['Periapical', 'Occlusal', 'Panoramic', 'Bitewing'],
    answerIndex: 3,
  },
  {
    id: 'dq4',
    text: 'Which of the following is a common sign of gingivitis?',
    options: ['Tooth mobility', 'Gingival bleeding on probing', 'Pulpal necrosis', 'Alveolar bone loss'],
    answerIndex: 1,
  },
  {
    id: 'dq5',
    text: 'Which instrument is primarily used to remove supragingival calculus?',
    options: ['Curette', 'Explorer', 'Scaler', 'Condenser'],
    answerIndex: 2,
  },
  {
    id: 'dq6',
    text: 'What is the most common cause of tooth sensitivity?',
    options: ['Cavities', 'Exposed dentin', 'Gum disease', 'Tooth grinding'],
    answerIndex: 1,
  },
  {
    id: 'dq7',
    text: 'Which type of tooth is most commonly missing congenitally?',
    options: ['Central incisors', 'Lateral incisors', 'Third molars', 'Canines'],
    answerIndex: 2,
  },
  {
    id: 'dq8',
    text: 'What is the primary function of fluoride in dental health?',
    options: ['Whitening teeth', 'Strengthening enamel', 'Killing bacteria', 'Reducing sensitivity'],
    answerIndex: 1,
  },
  {
    id: 'dq9',
    text: 'Which dental procedure is used to treat deep cavities?',
    options: ['Root canal', 'Crown placement', 'Filling', 'Extraction'],
    answerIndex: 0,
  },
  {
    id: 'dq10',
    text: 'What is the recommended frequency for dental check-ups?',
    options: ['Every 3 months', 'Every 6 months', 'Every year', 'Every 2 years'],
    answerIndex: 1,
  },
  {
    id: 'dq11',
    text: 'Which condition is characterized by grinding or clenching of teeth?',
    options: ['Bruxism', 'Malocclusion', 'Periodontitis', 'Gingivitis'],
    answerIndex: 0,
  },
  {
    id: 'dq12',
    text: 'What is the main purpose of dental sealants?',
    options: ['Whitening teeth', 'Preventing cavities', 'Fixing crooked teeth', 'Reducing sensitivity'],
    answerIndex: 1,
  },
  {
    id: 'dq13',
    text: 'Which tooth is also known as the "wisdom tooth"?',
    options: ['First molar', 'Second molar', 'Third molar', 'Canine'],
    answerIndex: 2,
  },
  {
    id: 'dq14',
    text: 'What is the primary cause of bad breath?',
    options: ['Bacteria on tongue', 'Stomach problems', 'Lung disease', 'Heart disease'],
    answerIndex: 0,
  },
  {
    id: 'dq15',
    text: 'Which dental material is most commonly used for fillings?',
    options: ['Gold', 'Silver amalgam', 'Composite resin', 'Porcelain'],
    answerIndex: 2,
  },
  {
    id: 'dq16',
    text: 'What is the function of saliva in oral health?',
    options: ['Whitening teeth', 'Neutralizing acids', 'Killing all bacteria', 'Strengthening enamel'],
    answerIndex: 1,
  },
  {
    id: 'dq17',
    text: 'Which condition causes inflammation of the gums?',
    options: ['Cavities', 'Gingivitis', 'Tooth decay', 'Sensitivity'],
    answerIndex: 1,
  },
  {
    id: 'dq18',
    text: 'What is the recommended brushing time?',
    options: ['30 seconds', '1 minute', '2 minutes', '3 minutes'],
    answerIndex: 2,
  },
  {
    id: 'dq19',
    text: 'Which tooth surface faces the cheek?',
    options: ['Lingual', 'Buccal', 'Mesial', 'Distal'],
    answerIndex: 1,
  },
  {
    id: 'dq20',
    text: 'What is the primary purpose of dental floss?',
    options: ['Whitening teeth', 'Removing plaque between teeth', 'Strengthening gums', 'Freshening breath'],
    answerIndex: 1,
  },
  {
    id: 'dq21',
    text: 'Which condition is characterized by receding gums?',
    options: ['Gingivitis', 'Periodontitis', 'Gingival recession', 'Tooth decay'],
    answerIndex: 2,
  },
  {
    id: 'dq22',
    text: 'What is the most common cause of tooth loss in adults?',
    options: ['Cavities', 'Gum disease', 'Accidents', 'Genetics'],
    answerIndex: 1,
  },
  {
    id: 'dq23',
    text: 'Which dental procedure straightens crooked teeth?',
    options: ['Root canal', 'Orthodontics', 'Crown placement', 'Filling'],
    answerIndex: 1,
  },
  {
    id: 'dq24',
    text: 'What is the function of dental pulp?',
    options: ['Protecting the tooth', 'Providing nutrients', 'Strengthening enamel', 'All of the above'],
    answerIndex: 3,
  },
  {
    id: 'dq25',
    text: 'Which condition causes white spots on teeth?',
    options: ['Fluorosis', 'Cavities', 'Enamel hypoplasia', 'All of the above'],
    answerIndex: 3,
  }
]

const Trivia = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResultModal, setShowResultModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [score, setScore] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Generate random questions when component mounts
  useEffect(() => {
    const generateQuestions = () => {
      const shuffled = [...dentalQuestionPool].sort(() => Math.random() - 0.5)
      const selectedQuestions = shuffled.slice(0, 10) // Select 10 random questions
      setQuestions(selectedQuestions)
    }
    generateQuestions()
  }, [])

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const hasSelected = answers[currentQuestion?.id] !== undefined

  const selectAnswer = (idx: number) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }))
  }

  const next = () => {
    if (!hasSelected) return
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
  }

  const openSubmit = () => {
    if (!hasSelected) return
    setShowResultModal(true)
  }

  const calculateScore = () => {
    let totalScore = 0
    for (const q of questions) {
      if (answers[q.id] === q.answerIndex) {
        totalScore += 100 // +100 for correct answer
      } else if (answers[q.id] !== undefined) {
        totalScore -= 10 // -10 for wrong answer
      }
    }
    return totalScore
  }

  const continueAndSave = async () => {
    if (!user) return
    setSaving(true)
    const finalScore = calculateScore()
    setScore(finalScore)
    
    // Calculate correct and wrong answers
    const correctAnswers = questions.filter(q => answers[q.id] === q.answerIndex).length
    const wrongAnswers = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.answerIndex).length
    
    const payload = {
      user_id: user.id,
      question_ids: questions.map((q) => q.id),
      selected_answers: questions.map((q) => answers[q.id] ?? -1),
      score: finalScore,
      total_questions: questions.length,
      played_at: new Date().toISOString(),
    }
    
    try {
      const { error } = await supabase.from('trivia_results').insert([payload])
      if (error) {
        // eslint-disable-next-line no-alert
        alert(`Failed to save results: ${error.message}`)
      } else {
        navigate('/leaderboard')
      }
    } catch (_e) {
      // eslint-disable-next-line no-alert
      alert('Unexpected error saving your results. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#808000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-700">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <p className="text-black font-medium mb-3">{currentQuestion.text}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentQuestion.options.map((opt, idx) => {
            const selected = answers[currentQuestion.id] === idx
            return (
              <button
                key={opt}
                onClick={() => selectAnswer(idx)}
                className={`text-left px-3 py-2 rounded border transition ${selected ? 'border-[#FFC0CB] bg-[#FFC0CB]/20' : 'border-gray-300 hover:border-[#6B4C3B]'}`}
              >
                <span className="text-[#4B4B4B]">{opt}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex justify-end">
          {!isLast ? (
            <button
              onClick={next}
              disabled={!hasSelected}
              className="px-4 py-2 rounded bg-[#808000] text-white hover:opacity-90 disabled:opacity-60"
            >
              Next
            </button>
          ) : (
            <button
              onClick={openSubmit}
              disabled={!hasSelected}
              className="px-4 py-2 rounded bg-[#808000] text-white hover:opacity-90 disabled:opacity-60"
            >
              Submit
            </button>
          )}
        </div>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-black mb-2">Quiz Complete!</h3>
            <div className="mb-4">
              <p className="text-gray-800 mb-2">Your Score: <span className="font-bold text-lg">{calculateScore()}</span></p>
              <p className="text-sm text-gray-600">
                Correct Answers: {questions.filter(q => answers[q.id] === q.answerIndex).length} (+{questions.filter(q => answers[q.id] === q.answerIndex).length * 100})
              </p>
              <p className="text-sm text-gray-600">
                Wrong Answers: {questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.answerIndex).length} (-{questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.answerIndex).length * 10})
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={continueAndSave}
                disabled={saving}
                className="px-4 py-2 rounded bg-[#808000] text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'View Leaderboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trivia
