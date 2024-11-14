'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface ChatMessage {
  question: string
  response: string
  answerId: string | null
  feedback: 'upvote' | 'downvote' | null
}

export default function QuestionForm() {
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setExpanded(true)
    try {
      const res = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()

      const newMessage: ChatMessage = {
        question: question.trim(),
        response: data.answer || 'No response found.',
        answerId: data.answerId || null,
        feedback: null,
      }

      setChatHistory(prev => [...prev, newMessage])
      setQuestion('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (index: number, type: 'upvote' | 'downvote') => {
    const answerId = chatHistory[index].answerId
    if (!answerId) return

    try {
      await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type }),
      })

      setChatHistory(prev =>
        prev.map((chat, i) =>
          i === index ? { ...chat, feedback: type } : chat
        )
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <AnimatePresence>
        {!expanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl md:max-w-3xl bg-white dark:bg-gray-800 shadow-lg p-8 rounded-lg text-center"
          >
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lord Ruler of JS</h1>
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                className="h-10 w-10 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        ) : (
          <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg min-h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200">
                  AI Assistant
                </h1>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((chat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-end">
                      <div className="bg-purple-100 dark:bg-purple-900/30 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                        <p className="text-gray-800 dark:text-gray-200">{chat.question}</p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                        <p className="text-gray-800 dark:text-gray-200">{chat.response}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleFeedback(index, 'upvote')}
                          variant="outline"
                          size="sm"
                          className={`flex items-center ${
                            chat.feedback === 'upvote'
                              ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                        </Button>
                        <Button
                          onClick={() => handleFeedback(index, 'downvote')}
                          variant="outline"
                          size="sm"
                          className={`flex items-center ${
                            chat.feedback === 'downvote'
                              ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Thinking...
                  </motion.div>
                )}
              </div>

              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="relative">
                  <Input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="pr-12 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading}
                    className="absolute right-1 top-1 h-8 w-8 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </main>
  )
}
