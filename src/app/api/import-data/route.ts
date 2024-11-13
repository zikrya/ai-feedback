import { NextResponse } from 'next/server';
import { importData } from '../weaviateClient';

export const GET = async () => {
  try {
    await importData();
    return NextResponse.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json({ message: 'Error importing data', error: error.message });
  }
};
