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

  console.log('🔄 Initializing Pinecone...');
  console.log('📋 Index Name:', process.env.PINECONE_INDEX || 'form-embeddings');
  console.log('📋 Namespace:', process.env.PINECONE_NAMESPACE || 'default');

  pineconeClient = new Pinecone({
    apiKey,
  });

  // Test connection
  try {
    const indexName = process.env.PINECONE_INDEX || 'form-embeddings';
    const index = pineconeClient.index(indexName);
    const stats = await index.describeIndexStats();
    console.log('✅ Pinecone initialized successfully');
    console.log('📊 Index Stats:', JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('❌ Failed to verify Pinecone connection:', error instanceof Error ? error.message : error);
    throw error;
  }

  return pineconeClient;
};

export const getPineconeIndex = async () => {
  const client = await initPinecone();
  const indexName = process.env.PINECONE_INDEX || 'form-embeddings';
  const namespace = process.env.PINECONE_NAMESPACE;
  console.log(`📁 Getting Pinecone index: ${indexName}${namespace ? ` (namespace: ${namespace})` : ''}`);
  const baseIndex = client.index(indexName);
  return namespace ? baseIndex.namespace(namespace) : baseIndex;
};

export { pineconeClient };
