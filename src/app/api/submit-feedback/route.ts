import { NextResponse } from 'next/server';
import { updateFeedback } from '../weaviateClient';

export const POST = async (req: Request) => {
  try {
    const { answerId, type } = await req.json();
    await updateFeedback(answerId, type);
    return NextResponse.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ message: 'Error submitting feedback', error: error.message });
  }
};
