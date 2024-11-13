import { NextResponse } from 'next/server';
import { semanticSearch } from '../weaviateClient';

export const POST = async (req: Request) => {
  try {
    const { query } = await req.json();
    const results = await semanticSearch(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ message: 'Error performing search', error: error.message });
  }
};
