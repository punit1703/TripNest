import json
import urllib.request
from urllib.error import URLError, HTTPError
from django.conf import settings

class OpenRouterService:
    @staticmethod
    def generate_itinerary(destination, days, budget):
        api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        prompt = (
            f"Create a structured {days}-day itinerary for a trip to {destination} with a total budget of {budget}. "
            "Return the response STRICTLY as a JSON object with the following structure:\n"
            "{\n"
            '  "estimated_budget": "A brief string describing the estimated budget breakdown",\n'
            '  "itinerary": [\n'
            '    {"day_number": 1, "title": "...", "description": "..."},\n'
            '    ...\n'
            "  ]\n"
            "}\n"
            "Do not include any markdown backticks (like ```json). Return ONLY valid raw JSON data."
        )

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "google/gemini-2.5-pro",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode('utf-8'), 
            headers=headers, 
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                content = result['choices'][0]['message']['content']
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.startswith('```'):
                    content = content[3:]
                if content.endswith('```'):
                    content = content[:-3]
                
                return json.loads(content.strip())
        except HTTPError as e:
            raise Exception(f"OpenRouter API HTTP error: {e.code} - {e.read().decode('utf-8')}")
        except URLError as e:
            raise Exception(f"Failed to reach OpenRouter API: {e.reason}")
        except json.JSONDecodeError:
            raise Exception("Failed to parse JSON from AI response")
        except Exception as e:
            raise Exception(f"An unexpected error occurred: {str(e)}")
