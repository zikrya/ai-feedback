'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, MessageCircle, ThumbsUp } from 'lucide-react'

const LandingPage = () => {
  const router = useRouter()

  const handleDemoClick = () => {
    router.push('/chat-box')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-700 via-blue-800 to-teal-500 text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Welcome to the
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500 ml-2">
            Master Of JavaScript
          </span>
        </h1>
        <p className="text-lg mb-6 max-w-xl mx-auto leading-relaxed">
          Engage with the AI that is the self proclaimed master in JavaScript, you can take a novice into an expert with ease, and rules the JavaScript ecosystem
        </p>
        <motion.button
          onClick={handleDemoClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-white text-purple-700 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
        >
          <Sparkles className="mr-2" />
          Try it Out
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center z-10 max-w-3xl mt-10">
        {[
          { icon: MessageCircle, title: "Ask Questions", description: "Interact with the master for some good responses" },
          { icon: ThumbsUp, title: "Provide Feedback", description: "The master will let you rate his skills" },
          { icon: Sparkles, title: "Shape the Future", description: "Be part of the new Javascript kingdom" }
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm"
          >
            <feature.icon className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
            <h2 className="text-lg font-semibold mb-1">{feature.title}</h2>
            <p className="text-sm opacity-80">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-20 blur-3xl z-0"
      />
    </div>
  )
}

export default LandingPage
