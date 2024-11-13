'use client'
import { useState } from 'react';

const QuestionForm = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    try {
      const res = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data.answer || 'No response found.');
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('An error occurred while fetching the response.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Ask
        </button>
      </form>

      {response && (
        <div className="flex flex-col space-y-2 w-full">
          <div className="self-end bg-gray-200 p-3 rounded-lg shadow-md">
            <p className="text-gray-800 font-semibold">You:</p>
            <p>{question}</p>
          </div>
          <div className="self-start bg-blue-100 p-3 rounded-lg shadow-md animate-fade-in">
            <p className="text-gray-800 font-semibold">Answer:</p>
            <p>{response}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
