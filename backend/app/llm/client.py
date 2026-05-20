"""
llm/client.py - Multi-provider LLM client.
Supports both OpenAI and Google Gemini (free).
"""

import google.generativeai as genai
from openai import AsyncOpenAI
from app.config import get_settings
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# Initialize clients
openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)

MODEL_COSTS = {
    'gpt-4o-mini': {'input': 0.000150, 'output': 0.000600},
    'gemini-1.5-flash': {'input': 0.0, 'output': 0.0},  # Free tier
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    costs = MODEL_COSTS.get(model, MODEL_COSTS['gpt-4o-mini'])
    input_cost = (input_tokens / 1000) * costs['input']
    output_cost = (output_tokens / 1000) * costs['output']
    return round(input_cost + output_cost, 8)
