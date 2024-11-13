import { NextResponse } from 'next/server';
import { semanticSearch } from '../weaviateClient';

export const POST = async (req: Request) => {
  try {
    const { question } = await req.json();
    const results = await semanticSearch(question);
    console.log("Search results:", results);

    const answer = results[0]?.description || 'No relevant answer found.';
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json({ message: "Error fetching answer", error: error.message });
  }
};