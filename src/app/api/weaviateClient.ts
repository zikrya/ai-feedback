import axios from 'axios';
import weaviate, { WeaviateClient, vectorizer } from 'weaviate-client';

const wcdUrl = process.env.WEAVIATE_URL as string;
const wcdApiKey = process.env.WEAVIATE_API_KEY as string;
const openAIKey = process.env.OPENAI_API_KEY as string;

let client: WeaviateClient | null = null;


export const initializeClient = async () => {
  if (!client) {
    try {
      client = await weaviate.connectToWeaviateCloud(
        wcdUrl,
        {
          authCredentials: new weaviate.ApiKey(wcdApiKey),
          headers: {
            'X-OpenAI-Api-Key': openAIKey,
          },
          timeout: 10000, // Increase timeout to 10 seconds
        }
      );
      console.log("Weaviate client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Weaviate client:", error);
      throw new Error("Could not connect to Weaviate. Please check your configuration.");
    }
  }
  return client;
};

// Create the 'Question' collection
export const createCollection = async () => {
  if (!client) await initializeClient();

  try {
    await client!.collections.create({
      name: 'Question',
      properties: [
        { name: 'title', dataType: 'text' as const },
        { name: 'description', dataType: 'text' as const },
        { name: 'upvotes', dataType: 'int' as const },
        { name: 'downvotes', dataType: 'int' as const },
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
    console.log("Collection 'Question' created successfully");
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

// Import sample data for testing
export const importData = async () => {
  if (!client) await initializeClient();
  const questions = client!.collections.get('Question');
  const data = [
    { title: "What is the capital of France?", description: "The capital of France is Paris." },
    { title: "Who wrote 'To Kill a Mockingbird'?", description: "Harper Lee wrote 'To Kill a Mockingbird'." },
  ];

  try {
    const result = await questions.data.insertMany(data);
    console.log('Insertion response:', result);
  } catch (error) {
    console.error("Error importing data:", error);
  }
};

// Semantic search with error handling
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
                _additional {
                  id
                }
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
    return response.data.data?.Get?.Question || [];
  } catch (error) {
    console.error("Error in semanticSearch:", error);
    throw error;
  }
};

// Update feedback in Weaviate with retry logic
export const updateFeedback = async (answerId: string, type: 'upvote' | 'downvote') => {
  if (!client) await initializeClient();

  const field = type === 'upvote' ? 'upvotes' : 'downvotes';
  const retryLimit = 3;

  for (let attempt = 1; attempt <= retryLimit; attempt++) {
    try {
      console.log(`Updating feedback in Weaviate for ${type} on answerId: ${answerId} (Attempt ${attempt})`);

      const { data } = await axios.get(
        `${wcdUrl}/v1/objects/${answerId}`,
        {
          headers: {
            'Authorization': `Bearer ${wcdApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const currentCount = data.properties[field] || 0;

      // Increment the count
      const newCount = currentCount + 1;

      // Send update request with the incremented value
      const response = await axios.patch(
        `${wcdUrl}/v1/objects/${answerId}`,
        {
          class: 'Question',
          properties: {
            [field]: newCount,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${wcdApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Weaviate feedback update response:", response.data);
      return;

    } catch (error) {
      console.error(`Error updating feedback in Weaviate (Attempt ${attempt}):`, error);

      if (attempt === retryLimit) {
        throw new Error("Failed to update feedback after multiple attempts.");
      }

      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};
