"""
LLM-Powered AI Service for Route Optimization
Uses OpenAI, Anthropic, or local LLM for intelligent route recommendations
"""
import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Try to import OpenAI (primary choice)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Try to import Anthropic (alternative)
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

# Try to import local LLM (Ollama)
try:
    import requests
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False


class AIService:
    """AI service for intelligent route optimization and recommendations"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.llm_provider = os.getenv("LLM_PROVIDER", "openai").lower()
        
        # Initialize based on provider
        if self.llm_provider == "openai" and OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                openai.api_key = api_key
                self.openai_client = openai
        elif self.llm_provider == "anthropic" and ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.anthropic_client = anthropic.Anthropic(api_key=api_key)
        elif self.llm_provider == "ollama" and OLLAMA_AVAILABLE:
            self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    
    def is_available(self) -> bool:
        """Check if AI service is available"""
        if self.llm_provider == "openai":
            return self.openai_client is not None
        elif self.llm_provider == "anthropic":
            return self.anthropic_client is not None
        elif self.llm_provider == "ollama":
            return OLLAMA_AVAILABLE
        return False
    
    def generate_route_recommendations(
        self,
        patient_info: Dict[str, Any],
        available_services: List[Dict[str, Any]],
        insurance_coverage: Dict[str, Any],
        optimized_route: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Use LLM to generate intelligent route recommendations and explanations
        """
        if not self.is_available():
            return self._fallback_recommendations(optimized_route)
        
        prompt = self._build_route_prompt(
            patient_info, available_services, insurance_coverage, optimized_route
        )
        
        try:
            if self.llm_provider == "openai":
                return self._get_openai_recommendations(prompt)
            elif self.llm_provider == "anthropic":
                return self._get_anthropic_recommendations(prompt)
            elif self.llm_provider == "ollama":
                return self._get_ollama_recommendations(prompt)
        except Exception as e:
            print(f"AI service error: {e}")
            return self._fallback_recommendations(optimized_route)
    
    def _build_route_prompt(
        self,
        patient_info: Dict[str, Any],
        available_services: List[Dict[str, Any]],
        insurance_coverage: Dict[str, Any],
        optimized_route: List[Dict[str, Any]]
    ) -> str:
        """Build prompt for LLM"""
        prompt = f"""You are an AI healthcare route optimization assistant. Analyze this patient's care route and provide intelligent recommendations.

PATIENT INFORMATION:
- Name: {patient_info.get('name', 'Unknown')}
- Insurance: {patient_info.get('insurance_code', 'Unknown')}
- Location: {patient_info.get('location_latitude', 'N/A')}, {patient_info.get('location_longitude', 'N/A')}

INSURANCE COVERAGE:
- Coverage Percentage: {insurance_coverage.get('coverage_percentage', 100)}%
- Covered Services: {', '.join(insurance_coverage.get('covered_services', []))}

OPTIMIZED ROUTE:
"""
        for idx, node in enumerate(optimized_route, 1):
            prompt += f"""
{idx}. {node.get('service_name', 'Unknown Service')}
   - Location: {node.get('location', 'Unknown')}
   - Cost: ${node.get('price', 0):.2f}
   - Duration: {node.get('duration', 'Unknown')}
   - Status: {node.get('status', 'Pending')}
"""
        
        prompt += """
Please provide:
1. A natural language explanation of why this route is optimal
2. Alternative route suggestions if applicable
3. Cost-saving tips
4. Time-saving recommendations
5. Any health considerations or warnings

Format your response as JSON with these keys:
- explanation: string (natural language explanation)
- alternatives: array of alternative route suggestions
- cost_tips: array of cost-saving tips
- time_tips: array of time-saving tips
- health_considerations: array of health-related notes
"""
        return prompt
    
    def _get_openai_recommendations(self, prompt: str) -> Dict[str, Any]:
        """Get recommendations from OpenAI"""
        try:
            response = self.openai_client.ChatCompletion.create(
                model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": "You are a helpful healthcare route optimization assistant. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            # Try to parse JSON from response
            try:
                return json.loads(content)
            except:
                # If not JSON, wrap in explanation
                return {
                    "explanation": content,
                    "alternatives": [],
                    "cost_tips": [],
                    "time_tips": [],
                    "health_considerations": []
                }
        except Exception as e:
            print(f"OpenAI error: {e}")
            return self._fallback_recommendations([])
    
    def _get_anthropic_recommendations(self, prompt: str) -> Dict[str, Any]:
        """Get recommendations from Anthropic Claude"""
        try:
            message = self.anthropic_client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229"),
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = message.content[0].text
            try:
                return json.loads(content)
            except:
                return {
                    "explanation": content,
                    "alternatives": [],
                    "cost_tips": [],
                    "time_tips": [],
                    "health_considerations": []
                }
        except Exception as e:
            print(f"Anthropic error: {e}")
            return self._fallback_recommendations([])
    
    def _get_ollama_recommendations(self, prompt: str) -> Dict[str, Any]:
        """Get recommendations from local Ollama"""
        try:
            model = os.getenv("OLLAMA_MODEL", "llama2")
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json().get("response", "")
                try:
                    return json.loads(content)
                except:
                    return {
                        "explanation": content,
                        "alternatives": [],
                        "cost_tips": [],
                        "time_tips": [],
                        "health_considerations": []
                    }
        except Exception as e:
            print(f"Ollama error: {e}")
            return self._fallback_recommendations([])
    
    def _fallback_recommendations(self, route: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback recommendations when AI is not available"""
        return {
            "explanation": "This route has been optimized for minimal travel distance, cost, and time. The services are ordered to reduce travel between locations.",
            "alternatives": [],
            "cost_tips": [
                "Consider scheduling services on the same day to reduce travel costs",
                "Check if your insurance offers telemedicine options for follow-ups"
            ],
            "time_tips": [
                "Arrive 15 minutes early for each appointment",
                "Consider scheduling early morning appointments to avoid traffic"
            ],
            "health_considerations": [
                "Follow your provider's instructions between appointments",
                "Bring all previous test results to each appointment"
            ]
        }
    
    def suggest_alternative_providers(
        self,
        service_name: str,
        current_provider: Dict[str, Any],
        available_providers: List[Dict[str, Any]],
        patient_preferences: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Use AI to suggest alternative providers based on patient needs"""
        if not self.is_available():
            # Simple fallback: return providers sorted by distance
            return sorted(
                available_providers,
                key=lambda p: (
                    (p.get('latitude', 0) - current_provider.get('latitude', 0))**2 +
                    (p.get('longitude', 0) - current_provider.get('longitude', 0))**2
                )
            )[:3]
        
        prompt = f"""Suggest alternative providers for {service_name} based on:
- Current provider: {current_provider.get('name', 'Unknown')}
- Patient preferences: {json.dumps(patient_preferences or {})}
- Available providers: {json.dumps(available_providers[:5])}

Return JSON array of top 3 alternatives with reasons."""
        
        try:
            if self.llm_provider == "openai":
                response = self.openai_client.ChatCompletion.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7
                )
                content = response.choices[0].message.content
                return json.loads(content) if content.startswith('[') else []
        except:
            pass
        
        return self._fallback_recommendations([]).get("alternatives", [])


# Global AI service instance
ai_service = AIService()


