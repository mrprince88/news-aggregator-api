const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news_aggregator';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://integrate.api.nvidia.com/v1';
const MODEL_NAME = process.env.MODEL_NAME || 'stepfun-ai/step-3.5-flash';

async function generateMetadata(article) {
  const prompt = `Analyze the following article.
Title: '${article.title}'
Summary: '${article.summary || ''}'

Please provide the most suitable topic from this exact list: [Politics, Philosophy, Economics, Culture, Technology, Science, Society, Environment].
If none perfectly fit, pick the closest one.
Also, write a concise 2-line description of the article.

Return your answer ONLY as raw valid JSON in this exact format, with no markdown formatting:
{"topic": "<topic>", "description": "<2 line description>"}`;

  const payload = {
    model: MODEL_NAME,
    messages: [
      { role: "system", content: "You are a news categorizer. You return only raw valid JSON without markdown formatting. Do not wrap in ```json" },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  };

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }
  
  return JSON.parse(content);
}

async function backfill() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const articleSchema = new mongoose.Schema({}, { strict: false });
  const Article = mongoose.model('Article', articleSchema, 'articles');

  const articles = await Article.find({});
  console.log(`Found ${articles.length} articles to process.`);

  const batchSize = 10;
  let processed = 0;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (article) => {
      try {
        const doc = article.toObject();
        const hasTopic = !!doc.topic;
        
        const result = await generateMetadata(doc);
        
        const updateDoc = {};
        if (!hasTopic && result.topic) {
          updateDoc.topic = result.topic;
        }
        if (result.description) {
          updateDoc.summary = result.description;
        }
        
        if (Object.keys(updateDoc).length > 0) {
          await Article.updateOne({ _id: doc._id }, { $set: updateDoc });
        }
      } catch (err) {
        console.error(`Failed to process article ${article._id}:`, err.message);
      }
    }));
    
    processed += batch.length;
    console.log(`Processed ${processed} / ${articles.length}`);
  }

  console.log('Backfill complete!');
  await mongoose.disconnect();
}

backfill().catch(console.error);
