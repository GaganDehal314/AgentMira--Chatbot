from fastapi import APIRouter, HTTPException
from pathlib import Path
import os
from backend.schemas import NLPRequest

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - optional dependency
    OpenAI = None  # type: ignore

router = APIRouter(prefix="/nlp", tags=["nlp"])


def load_txt_file(filename: str) -> str:
    """Load content from a text file in the backend/prompt directory."""
    # Get the backend directory (parent of routes directory)
    backend_dir = Path(__file__).parent.parent
    prompt_dir = backend_dir / "prompt"
    file_path = prompt_dir / filename
    
    try:
        with file_path.open("r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"Prompt file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading prompt file: {e}")


def _heuristic_fallback(text: str) -> dict:
    """Basic heuristic fallback for extracting filters when LLM is not available."""
    text_lower = text.lower()
    original_text = text  # Keep original for location matching
    filters = {}
    
    # Extract location from common city names
    cities = {
        "new york": "New York",
        "ny": "New York",
        "miami": "Miami",
        "los angeles": "Los Angeles",
        "la": "Los Angeles",
        "austin": "Austin",
        "san francisco": "San Francisco",
        "sf": "San Francisco",
        "chicago": "Chicago",
        "dallas": "Dallas",
        "seattle": "Seattle",
        "boston": "Boston",
    }
    
    # Check for city names in text (case-insensitive)
    for city_key, city_value in cities.items():
        if city_key in text_lower:
            filters["location"] = city_value
            break
    
    # If no city found, check if text looks like a location (contains common location words)
    if "location" not in filters:
        location_keywords = ["in ", "at ", "near ", "around "]
        for keyword in location_keywords:
            if keyword in text_lower:
                # Try to extract location after keyword
                idx = text_lower.find(keyword) + len(keyword)
                remaining = text_lower[idx:].strip()
                # Take first few words as potential location
                words = remaining.split()[:3]
                if words:
                    potential_location = " ".join(words).title()
                    filters["location"] = potential_location
                break
    
    # Extract bedroom count
    if "bed" in text_lower or "bedroom" in text_lower:
        # Try to extract number
        import re
        bed_match = re.search(r'(\d+)\s*(?:bed|bedroom)', text_lower)
        if bed_match:
            filters["min_bedrooms"] = int(bed_match.group(1))
        else:
            filters["min_bedrooms"] = 2
    
    # Extract price range
    import re
    price_match = re.search(r'(?:under|below|less than|max|maximum)\s*\$?(\d+)', text_lower)
    if price_match:
        filters["max_price"] = float(price_match.group(1))
    
    price_match = re.search(r'(?:over|above|more than|min|minimum)\s*\$?(\d+)', text_lower)
    if price_match:
        filters["min_price"] = float(price_match.group(1))
    
    # Extract amenities
    if "pool" in text_lower:
        filters["amenities"] = ["pool"]
    if "garage" in text_lower:
        filters.setdefault("amenities", []).append("garage")
    if "gym" in text_lower or "fitness" in text_lower:
        filters.setdefault("amenities", []).append("gym")
    
    return filters


def _has_searchable_filters(filters: dict) -> bool:
    """Check if filters contain any searchable criteria."""
    if not filters:
        return False
    # Check if at least one meaningful filter is present
    searchable_keys = ["location", "min_price", "max_price", "min_bedrooms", "min_bathrooms", "amenities"]
    return any(key in filters and filters[key] is not None and filters[key] != "" and filters[key] != [] for key in searchable_keys)


@router.post("/parse")
async def parse_intent(payload: NLPRequest) -> dict:
    # PRIORITY 1: Try OpenAI LLM first if available
    if OpenAI is not None:
        try:
            import json
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise RuntimeError("OPENAI_API_KEY is not set in the environment")

            client = OpenAI(api_key=api_key)
            
            # Load prompt from text file
            system_prompt = load_txt_file("chatbot.txt")
            
            # Use LLM to determine if query is searchable or conversational
            # Response format: {"filters": {...} OR null, "text": "..." OR null}
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": payload.text
                    }
                ],
                response_format={"type": "json_object"},
            )
            message_content = completion.choices[0].message.content
            print(f"LLM Response: {message_content}")
            
            # Parse JSON response
            parsed_response = json.loads(message_content) if isinstance(message_content, str) else message_content
            
            # Extract filters and text from response
            filters = parsed_response.get("filters")
            text_response = parsed_response.get("text")
            
            # Build return dict - can include both text and filters
            result = {"provider": "openai"}
            
            # Always include text if present
            if text_response:
                result["text"] = text_response
            
            # Include filters if they are searchable
            if filters and _has_searchable_filters(filters):
                result["filters"] = filters
            
            return result
            
        except Exception as exc:
            # LLM failed, fall back to heuristic
            print(f"LLM error: {exc}, falling back to heuristic")
            pass
    
    # PRIORITY 2: Fallback to heuristic if LLM not available or failed
    filters = _heuristic_fallback(payload.text)
    if _has_searchable_filters(filters):
        return {"filters": filters, "provider": "fallback"}
    else:
        # No searchable filters found, return conversational response
        return {
            "text": "I'd be happy to help you find properties! Could you tell me more about what you're looking for? For example, which city or area are you interested in? What's your budget range? How many bedrooms do you need?",
            "provider": "fallback"
        }

