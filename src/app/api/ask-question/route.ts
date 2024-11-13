import { NextResponse } from 'next/server';
import { semanticSearch } from '../weaviateClient';

export const POST = async (req: Request) => {
  try {
    const { question } = await req.json();
    const results = await semanticSearch(question);

    if (results.length > 0) {
      const answer = results[0].description || 'No relevant answer found.';
      const answerId = results[0]._additional?.id;
      return NextResponse.json({ answer, answerId });
    }

    return NextResponse.json({ answer: 'No relevant answer found.' });
  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json({ message: 'Error fetching answer', error: error.message });
  }
};
