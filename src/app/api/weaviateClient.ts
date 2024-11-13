import axios from 'axios';
import weaviate, { WeaviateClient, vectorizer } from 'weaviate-client';

const wcdUrl = process.env.WEAVIATE_URL as string;
const wcdApiKey = process.env.WEAVIATE_API_KEY as string;
const openAIKey = process.env.OPENAI_API_KEY as string;

let client: WeaviateClient | null = null;

export const initializeClient = async () => {
  if (!client) {
    client = await weaviate.connectToWeaviateCloud(
      wcdUrl,
      {
        authCredentials: new weaviate.ApiKey(wcdApiKey),
        headers: {
          'X-OpenAI-Api-Key': openAIKey,
        },
      }
    );
  }
  return client;
};

// Create the 'Question' collection
export const createCollection = async () => {
  if (!client) await initializeClient();

  await client!.collections.create({
    name: 'Question',
    properties: [
      {
        name: 'title',
        dataType: 'text' as const,
      },
      {
        name: 'description',
        dataType: 'text' as const,
      },
      {
        name: 'upvotes',
        dataType: 'int' as const,
      },
      {
        name: 'downvotes',
        dataType: 'int' as const,
      },
    ],
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: 'title_vector',
        sourceProperties: ['title'],
        model: 'text-embedding-3-large',
        dimensions: 1024,
      }),
    ],
  });
};

// Import sample data
export const importData = async () => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const data = [
    { title: "What is the capital of France?", description: "The capital of France is Paris." },
    { title: "Who wrote 'To Kill a Mockingbird'?", description: "Harper Lee wrote 'To Kill a Mockingbird'." },
  ];

  const result = await questions.data.insertMany(data);
  console.log('Insertion response: ', result);
};

// Semantic search function
export const semanticSearch = async (query: string, limit: number = 5) => {
  if (!client) await initializeClient();

  try {
    const response = await axios.post(
      `${wcdUrl}/v1/graphql`,
      {
        query: `
          {
            Get {
              Question(
                nearText: {
                  concepts: ["${query}"]
                }
                limit: ${limit}
              ) {
                title
                description
              }
            }
          }
        `,
      },
      {
        headers: {
          'Authorization': `Bearer ${wcdApiKey}`,
          'X-OpenAI-Api-Key': openAIKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Semantic search result:', response.data);
    return response.data.data.Get.Question || [];
  } catch (error) {
    console.error("Error in semanticSearch:", error);
    throw error;
  }
};
