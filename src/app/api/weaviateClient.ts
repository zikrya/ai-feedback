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
    {
      title: "What is JavaScript?",
      description: "JavaScript is a versatile programming language primarily used for web development to create interactive elements on websites."
    },
    {
      title: "What is the difference between '==' and '===' in JavaScript?",
      description: "'==' checks for equality after type conversion, while '===' checks for equality without type conversion, making it a stricter comparison."
    },
    {
      title: "What is a closure in JavaScript?",
      description: "A closure is a feature where an inner function has access to variables from an outer function's scope, even after the outer function has returned."
    },
    {
      title: "How do you create a promise in JavaScript?",
      description: "A promise is created using the 'new Promise' constructor, which takes a function with 'resolve' and 'reject' parameters to handle asynchronous operations."
    },
    {
      title: "What are arrow functions in JavaScript?",
      description: "Arrow functions provide a shorter syntax for functions and do not have their own 'this' context, making them useful for concise function expressions."
    },
    {
      title: "What is the 'this' keyword in JavaScript?",
      description: "'this' refers to the context in which a function is invoked and can change based on how the function is called."
    },
    {
      title: "How can you prevent default behavior in JavaScript?",
      description: "You can use the 'event.preventDefault()' method in an event handler to prevent the default behavior associated with the event."
    },
    {
      title: "What is the DOM in JavaScript?",
      description: "The DOM (Document Object Model) is an interface that represents the structure of an HTML document and allows JavaScript to interact with and manipulate HTML elements."
    },
    {
      title: "What is the difference between 'let', 'const', and 'var' in JavaScript?",
      description: "'var' is function-scoped, 'let' and 'const' are block-scoped, and 'const' variables cannot be reassigned after initialization."
    },
    {
      title: "How do you handle errors in JavaScript?",
      description: "Errors are handled using try-catch blocks, where 'try' contains the code that may throw an error, and 'catch' contains the code to handle the error."
    },
    {
      title: "What is the purpose of async/await in JavaScript?",
      description: "async/await is a syntax for writing asynchronous code in a synchronous manner, making it easier to read and handle promises without nested 'then' calls."
    },
    {
      title: "What is JSON and how is it used in JavaScript?",
      description: "JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write. In JavaScript, it's used to parse and stringify data for storage or API communication."
    },
    {
      title: "What is event delegation in JavaScript?",
      description: "Event delegation is a technique where a single event listener is added to a parent element to handle events for multiple child elements, improving performance."
    },
    {
      title: "How can you debounce a function in JavaScript?",
      description: "Debouncing limits the rate at which a function executes. It's typically implemented with setTimeout and clearTimeout to delay function calls."
    },
    {
      title: "What is local storage in JavaScript?",
      description: "Local storage is a web storage API that allows developers to store data in the browser persistently with no expiration, accessible via 'localStorage'."
    },
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
