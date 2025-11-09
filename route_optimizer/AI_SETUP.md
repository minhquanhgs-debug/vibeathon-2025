# 🤖 AI/LLM Setup for Route Optimizer

The Route Optimizer now supports LLM-powered AI recommendations! Choose one of the following options:

---

## 🎯 Option 1: OpenAI (Easiest - Recommended)

### Setup:

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create an account (or sign in)
   - Create a new API key
   - Copy the key

2. **Install OpenAI package:**
```powershell
cd route_optimizer
venv\Scripts\activate
pip install openai
```

3. **Add to `route_optimizer/.env`:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

4. **Restart the server:**
```powershell
uvicorn route_optimizer:app --reload
```

✅ **Done!** AI recommendations will now be included in route responses.

---

## 🎯 Option 2: Anthropic Claude

### Setup:

1. **Get Anthropic API Key:**
   - Go to https://console.anthropic.com/
   - Create an account
   - Get your API key

2. **Install Anthropic package:**
```powershell
pip install anthropic
```

3. **Add to `route_optimizer/.env`:**
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

4. **Restart the server**

---

## 🎯 Option 3: Local LLM with Ollama (Free!)

### Setup:

1. **Install Ollama:**
   - Download from https://ollama.ai
   - Install and run Ollama

2. **Download a model:**
```powershell
ollama pull llama2
# or
ollama pull mistral
```

3. **Add to `route_optimizer/.env`:**
```env
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

4. **Restart the server**

✅ **Free and runs locally!** No API costs.

---

## 🧪 Test AI Integration

### Check if AI is working:

1. **Make a route optimization request:**
```bash
curl -X POST "http://localhost:8000/api/route_optimizer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "insurance_code": "AET-GOLD",
    "location_latitude": 37.0842,
    "location_longitude": -94.5133
  }'
```

2. **Check response for `ai_recommendations` field:**
```json
{
  "patient_id": "P1",
  "route": [...],
  "ai_recommendations": {
    "explanation": "This route is optimized because...",
    "alternatives": [...],
    "cost_tips": [...],
    "time_tips": [...],
    "health_considerations": [...]
  }
}
```

---

## 📊 What AI Provides

The AI service adds:

1. **Natural Language Explanation** - Why this route is optimal
2. **Alternative Routes** - Other options to consider
3. **Cost-Saving Tips** - How to reduce expenses
4. **Time-Saving Tips** - How to optimize schedule
5. **Health Considerations** - Important health notes

---

## 🔧 Troubleshooting

### "AI service not available"
- Make sure you installed the LLM package (openai, anthropic, or ollama)
- Check your `.env` file has correct settings
- Verify API key is correct (for OpenAI/Anthropic)

### "OpenAI error: Invalid API key"
- Check your API key in `.env`
- Make sure you have credits in your OpenAI account

### "Ollama connection refused"
- Make sure Ollama is running
- Check `OLLAMA_URL` in `.env` matches your Ollama URL
- Verify model is downloaded: `ollama list`

---

## 💰 Cost Comparison

- **OpenAI GPT-3.5:** ~$0.002 per route (very cheap)
- **Anthropic Claude:** ~$0.003 per route
- **Ollama (Local):** FREE! (runs on your computer)

---

## ✅ Quick Start (OpenAI)

```powershell
# 1. Install
cd route_optimizer
venv\Scripts\activate
pip install openai

# 2. Add to .env
echo "LLM_PROVIDER=openai" >> .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 3. Restart
uvicorn route_optimizer:app --reload
```

**That's it!** AI recommendations will now appear in route responses! 🎉


