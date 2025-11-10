import json
import logging
from typing import Dict, Any, List
import httpx

from app.config import settings


logger = logging.getLogger(__name__)


class ThematicCodingService:
    """Service for LLM-based thematic coding using Ollama"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
    
    async def analyze_themes(self, transcription_text: str) -> Dict[str, Any]:
        """
        Analyze transcription text and extract themes using LLM
        
        Args:
            transcription_text: Full text transcription to analyze
            
        Returns:
            Dictionary with themes analysis results
        """
        try:
            if not transcription_text or not transcription_text.strip():
                logger.warning("Empty transcription text provided")
                return {
                    "themes": [],
                    "summary": "No transcription available for analysis",
                    "success": False
                }
            
            logger.info(f"Analyzing themes for transcription ({len(transcription_text)} chars)")
            
            # Create the prompt for thematic analysis
            prompt = self._create_analysis_prompt(transcription_text)
            
            # Call Ollama API
            themes_data = await self._call_ollama(prompt)
            
            logger.info(f"Thematic analysis completed: {len(themes_data.get('themes', []))} themes found")
            return themes_data
            
        except Exception as e:
            logger.error(f"Thematic analysis failed: {e}", exc_info=True)
            return {
                "themes": [],
                "summary": f"Analysis failed: {str(e)}",
                "success": False,
                "error": str(e)
            }
    
    def _create_analysis_prompt(self, text: str) -> str:
        """Create a prompt for thematic analysis"""
        prompt = f"""You are an expert qualitative researcher specializing in thematic analysis. Analyze the following transcription and identify the main themes present in the text.

For each theme:
- Provide ONLY a clear, concise theme name (maximum 2-3 words)
- Each theme name should be brief and descriptive

Identify between 3-8 themes maximum. Focus on the most significant and recurring themes.

Transcription:
{text}

You must respond with valid JSON in this exact format:
{{
  "themes": [
    {{
      "name": "Theme Name"
    }}
  ],
  "summary": "A brief 1-2 sentence overall summary of the transcription's main topics"
}}

Respond only with valid JSON, no additional text before or after."""
        
        return prompt
    
    async def _call_ollama(self, prompt: str) -> Dict[str, Any]:
        """
        Call Ollama API to generate thematic analysis
        
        Args:
            prompt: The analysis prompt
            
        Returns:
            Parsed JSON response with themes
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json",
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                        }
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Extract the generated text
                generated_text = result.get("response", "")
                
                # Parse JSON response
                try:
                    themes_data = json.loads(generated_text)
                    themes_data["success"] = True
                    return themes_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from Ollama response: {e}")
                    logger.error(f"Raw response: {generated_text}")
                    
                    # Fallback: try to extract themes manually
                    return {
                        "themes": [],
                        "summary": generated_text[:500] if generated_text else "Failed to parse response",
                        "success": False,
                        "error": "JSON parsing failed"
                    }
                    
        except httpx.TimeoutException:
            logger.error("Ollama API timeout")
            raise Exception("LLM request timed out. Please try again.")
        except httpx.RequestError as e:
            logger.error(f"Ollama API request failed: {e}")
            raise Exception(f"Failed to connect to Ollama: {str(e)}. Make sure Ollama is running.")
        except Exception as e:
            logger.error(f"Ollama API call failed: {e}", exc_info=True)
            raise
