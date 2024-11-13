import { NextResponse } from 'next/server';
import { checkClusterStatus } from '../weaviateClient';

export const GET = async () => {
  try {
    const isReady = await checkClusterStatus();
    return NextResponse.json({ status: isReady ? 'Connected' : 'Not Connected' });
  } catch (error) {
    console.error('Error checking cluster status:', error);
    return NextResponse.json({ status: 'Error', error: error.message });
  }
};
