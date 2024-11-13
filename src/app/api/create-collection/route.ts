import { NextResponse } from 'next/server';
import { createCollection } from '../weaviateClient';

export const GET = async () => {
  try {
    await createCollection();
    return NextResponse.json({ message: 'Collection created successfully' });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ message: 'Error creating collection', error: error.message });
  }
};
