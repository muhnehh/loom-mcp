import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useFS = false;
env.backends.onnx.wasm.numThreads = 1;

let embeddingPipeline: any = null;
let deviceType: 'cuda' | 'cpu' = 'cpu';

export async function initGPUEmbeddings(preferGPU: boolean = true): Promise<boolean> {
  try {
    if (preferGPU) {
      try {
        env.backends.onnx.wasm.numThreads = 4;
        deviceType = 'cuda';
      } catch {
        deviceType = 'cpu';
      }
    }
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.error(`GPU embeddings initialized: ${deviceType}`);
    return true;
  } catch (error) {
    console.error('GPU embeddings failed:', error);
    return false;
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    await initGPUEmbeddings(deviceType === 'cuda');
  }
  
  const output = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true
  });
  
  return Array.from(output.data);
}

export async function semanticSearchGPU(
  query: string,
  documents: string[],
  limit: number = 5
): Promise<{ index: number; score: number; text: string }[]> {
  const queryEmbedding = await getEmbedding(query);
  
  const results = await Promise.all(
    documents.map(async (doc, index) => {
      const docEmbedding = await getEmbedding(doc);
      const score = cosineSimilarity(queryEmbedding, docEmbedding);
      return { index, score, text: doc };
    })
  );
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return dotProduct / (normA * normB);
}

export function getDeviceType(): string {
  return deviceType;
}

export function isGPUAvailable(): boolean {
  return deviceType === 'cuda';
}