import weaviate, { WeaviateClient, vectorizer, generative } from 'weaviate-client';

const wcdUrl = process.env.WCD_URL as string;
const wcdApiKey = process.env.WCD_API_KEY as string;
const openAIKey = process.env.OPENAI_APIKEY as string;

let client: WeaviateClient | null = null;

export const initializeClient = async () => {
  if (!client) {
    client = await weaviate.connectToWeaviateCloud(
      wcdUrl,
      {
        authCredentials: new weaviate.ApiKey(wcdApiKey),
        // Include OpenAI API key in additional headers
        additionalHeaders: {
          'X-OpenAI-Api-Key': openAIKey,
        },
      }
    );
  }
  return client;
};

export const checkClusterStatus = async (): Promise<boolean> => {
  if (!client) await initializeClient();
  const clientReadiness = await client!.isReady();
  console.log(clientReadiness);
  return clientReadiness;
};

export const closeClientConnection = () => {
  client?.close();
};

export const createCollection = async () => {
  if (!client) await initializeClient();
  await client!.collections.create({
    name: 'Question',
    vectorizers: vectorizer.text2VecOpenAI(),
    generative: generative.openAI(),
  });
};

async function getSampleData() {
  const file = await fetch(
    'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
  );
  return file.json();
}

export const importData = async () => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const data = await getSampleData();

  const result = await questions.data.insertMany(data);
  console.log('Insertion response: ', result);
};

export const semanticSearch = async (query: string, limit: number = 2) => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const result = await questions.query.nearText(query, { limit });
  return result.objects.map((item) => item.properties);
};

export const generativeSearch = async (query: string, prompt: string, limit: number = 2) => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const result = await questions.generate.nearText(
    query,
    { groupedTask: prompt },
    { limit }
  );
  return result.generated;
};
