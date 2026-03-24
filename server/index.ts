import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    status: 'BuildMind AI is live ✅',
    version: '1.0.0'
  });
});

// AI Generate route
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are BuildMind AI — world's best AI app builder. 
            Generate complete production-ready code when given a description.
            Always return working HTML, CSS, and JavaScript in one file.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4096
      })
    });

    const data = await response.json();
    const result = data.choices[0]?.message?.content;

    res.json({ 
      success: true,
      result: result 
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy ✅' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BuildMind AI running on port ${PORT} ✅`);
});

export default app;
