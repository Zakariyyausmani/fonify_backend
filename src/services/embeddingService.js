const axios = require('axios');

/**
 * Generates an embedding for a given text using HuggingFace Inference API.
 * Uses sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
 * or sentence-transformers/all-mpnet-base-v2 (768 dimensions).
 * Here we use a 384-dim model for speed.
 */
exports.generateEmbedding = async (text) => {
  try {
    // We attempt to use the Hugging Face Inference API (free tier)
    // No token is passed, which works for public models within limits.
    const response = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: text },
      { timeout: 10000 }
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    throw new Error('Unexpected response format from embedding API');
  } catch (error) {
    console.error('Embedding Generation Error:', error.message);
    
    // FALLBACK: For development/testing/FYP purposes, if the API fails, 
    // we return a zero-vector or a deterministic mock to avoid crashing the import.
    // In a real RAG system, you'd want a reliable API.
    console.warn('⚠️ Falling back to dummy embedding (384 dims). Semantic search will be limited.');
    return new Array(384).fill(0).map((_, i) => Math.sin(i + text.length));
  }
};

/**
 * Simple Cosine Similarity
 */
exports.cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
};
