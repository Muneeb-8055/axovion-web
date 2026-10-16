"""
Universal AI Brain for Axovion Agents.
Supports OpenAI (GPT-4o-mini), Google Gemini (Free Tier), and Groq with zero third-party dependencies.
"""

import os
import json
import urllib.request
import urllib.error
from pathlib import Path


def load_env(env_path=None):
    """Simple .env loader with zero dependencies."""
    if not env_path:
        env_path = Path(__file__).resolve().parent / ".env"
    else:
        env_path = Path(env_path)

    if not env_path.exists():
        return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip("'\"")
                if key not in os.environ:
                    os.environ[key] = val


# Automatically load .env on module import
load_env()


class AIBrain:
    """Universal LLM client that talks to OpenAI, Gemini, or Groq."""

    def __init__(self, provider=None):
        self.provider = (provider or os.getenv("AI_PROVIDER", "openai")).lower()

    def generate(self, messages, temperature=0.7, max_tokens=1500):
        """Sends chat messages to the configured AI provider and returns the string response."""
        if self.provider == "gemini":
            return self._call_gemini(messages, temperature, max_tokens)
        elif self.provider == "groq":
            return self._call_groq(messages, temperature, max_tokens)
        else:
            return self._call_openai(messages, temperature, max_tokens)

    def _call_openai(self, messages, temperature, max_tokens):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or "your_" in api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set in growth-agent/.env! "
                "Add your key or switch AI_PROVIDER to 'gemini' in .env."
            )
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        url = "https://api.openai.com/v1/chat/completions"
        return self._send_request(url, api_key, model, messages, temperature, max_tokens)

    def _call_gemini(self, messages, temperature, max_tokens):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or "your_" in api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set in growth-agent/.env! "
                "Get a 100% free key at https://aistudio.google.com/app/apikey"
            )
        model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        # Google AI Studio OpenAI-compatible endpoint
        url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        return self._send_request(url, api_key, model, messages, temperature, max_tokens)

    def _call_groq(self, messages, temperature, max_tokens):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or "your_" in api_key:
            raise ValueError("GROQ_API_KEY is not set in growth-agent/.env!")
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        url = "https://api.groq.com/openai/v1/chat/completions"
        return self._send_request(url, api_key, model, messages, temperature, max_tokens)

    def _send_request(self, url, api_key, model, messages, temperature, max_tokens):
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "AxovionGrowthAgent/1.0",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"API Error ({self.provider} status {e.code}): {err_body}")
        except Exception as e:
            raise RuntimeError(f"Connection failed ({self.provider}): {e}")


# Singleton instance ready for easy import
brain = AIBrain()
