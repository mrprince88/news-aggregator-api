const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/news_aggregator';

async function updateTopics() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const articleSchema = new mongoose.Schema({}, { strict: false });
  const Article = mongoose.model('Article', articleSchema, 'articles');

  const articles = await Article.find({});
  console.log(`Found ${articles.length} articles to process.`);

  function determineTopic(title, summary) {
    const text = `${title || ''} ${summary || ''}`.toLowerCase();
    
    const keywords = {
      Politics: ['politics', 'government', 'election', 'policy', 'democrat', 'republican', 'parliament', 'minister', 'president', 'congress', 'senate', 'legislation', 'supreme court', 'court', 'biden', 'trump', 'modi', 'lawmaker', 'vote'],
      Philosophy: ['philosophy', 'ethics', 'moral', 'existential', 'epistemology', 'metaphysics', 'nietzsche', 'plato', 'socrates', 'kant', 'mind'],
      Economics: ['economics', 'economy', 'market', 'finance', 'inflation', 'gdp', 'recession', 'interest rate', 'stock', 'business', 'trade', 'investment', 'bank', 'wealth'],
      Culture: ['culture', 'art', 'music', 'movie', 'film', 'literature', 'book', 'fashion', 'entertainment', 'celebrity', 'history', 'festival'],
      Technology: ['technology', 'tech', 'software', 'hardware', 'ai', 'artificial intelligence', 'apple', 'google', 'microsoft', 'cybersecurity', 'internet', 'startup', 'digital', 'app', 'computer'],
      Science: ['science', 'research', 'study', 'physics', 'biology', 'chemistry', 'space', 'nasa', 'astronomy', 'quantum', 'scientist', 'discovery', 'evolution'],
      Society: ['society', 'social', 'education', 'healthcare', 'health', 'community', 'inequality', 'welfare', 'population', 'gender', 'crime', 'justice'],
      Environment: ['environment', 'climate', 'sustainability', 'pollution', 'warming', 'green', 'renewable', 'carbon', 'energy', 'emissions', 'fossil fuel', 'nature', 'conservation']
    };

    let bestTopic = undefined;
    let maxMatches = 0;

    for (const [topic, words] of Object.entries(keywords)) {
      let matches = 0;
      for (const word of words) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestTopic = topic;
      }
    }

    return bestTopic;
  }

  let updatedCount = 0;

  for (const article of articles) {
    const doc = article.toObject();
    const topic = determineTopic(doc.title, doc.summary);
    if (topic && doc.topic !== topic) {
      await Article.updateOne({ _id: doc._id }, { $set: { topic } });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} articles with topics.`);
  await mongoose.disconnect();
}

updateTopics().catch(console.error);
