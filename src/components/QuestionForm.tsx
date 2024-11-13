// src/components/QuestionForm.tsx
'use client'
import { useState } from 'react';

const QuestionForm = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [answerId, setAnswerId] = useState<string | null>(null);

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
      setAnswerId(data.answerId); // Store the answer ID for feedback
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('An error occurred while fetching the response.');
    }
  };

  const handleFeedback = async (type: 'upvote' | 'downvote') => {
    if (!answerId) {
      console.error("No answer ID available for feedback submission.");
      return;
    }

    console.log(`Submitting feedback: ${type} for answerId: ${answerId}`); // Log feedback action
    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type }),
      });

      const data = await res.json();
      console.log("Feedback submission response:", data); // Log API response
    } catch (error) {
      console.error(`Error submitting feedback: ${type}`, error);
    }
  };

  return (
    <div className="p-4 bg-background text-foreground">
      <form onSubmit={handleSubmit} className="flex flex-col items-start">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="p-2 mb-2 border rounded w-full"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Ask
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-white text-black rounded shadow animate-fade-in">
          <p>{response}</p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleFeedback('upvote')}
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              👍 Upvote
            </button>
            <button
              onClick={() => handleFeedback('downvote')}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              👎 Downvote
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;

