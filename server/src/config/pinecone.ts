import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export const initPinecone = async (): Promise<Pinecone> => {
  if (pineconeClient) {
    return pineconeClient;
  }

  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not defined');
  }

  pineconeClient = new Pinecone({
    apiKey,
  });

  console.log('✅ Pinecone initialized');
  return pineconeClient;
};

export const getPineconeIndex = async () => {
  const client = await initPinecone();
  const indexName = process.env.PINECONE_INDEX || 'form-embeddings';
  const namespace = process.env.PINECONE_NAMESPACE;
  const baseIndex = client.index(indexName);
  return namespace ? baseIndex.namespace(namespace) : baseIndex;
};

export { pineconeClient };
