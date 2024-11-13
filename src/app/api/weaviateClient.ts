import weaviate, { WeaviateClient } from 'weaviate-client';

const wcdUrl = process.env.WCD_URL as string;
const wcdApiKey = process.env.WCD_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  wcdUrl,
  {
    authCredentials: new weaviate.ApiKey(wcdApiKey),
  }
);

export const checkClusterStatus = async (): Promise<boolean> => {
  const clientReadiness = await client.isReady();
  console.log(clientReadiness);
  return clientReadiness;
};

export const closeClientConnection = () => {
  client.close();
};
