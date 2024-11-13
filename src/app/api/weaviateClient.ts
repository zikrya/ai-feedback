import weaviate, { WeaviateClient, vectorizer } from 'weaviate-client';

// Replace these values with your actual credentials
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

// Create the 'Question' collection with explicit vectorizer setup
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

export const semanticSearch = async (query: string, limit: number = 2) => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const result = await questions.query.nearText(query, { limit });
  return result.objects.map((item) => item.properties);
};
