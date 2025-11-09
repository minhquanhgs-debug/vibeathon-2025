import requests
import json

print("Testing Route Optimizer API...")
print("=" * 50)

# Test 1: Health check
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"âœ… Health check: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"âŒ Health check failed: {e}")
    print("   Make sure server is running: uvicorn route_optimizer:app --reload")
    exit(1)

# Test 2: Route optimization
try:
    data = {
        "name": "Test Patient",
        "insurance_code": "AET-GOLD",
        "location_latitude": 37.0842,
        "location_longitude": -94.5133
    }
    response = requests.post(
        "http://localhost:8000/api/route_optimizer",
        json=data,
        timeout=10
    )
    print(f"\nâœ… Route optimization: {response.status_code}")
    result = response.json()
    print(f"   Patient ID: {result.get('patient_id')}")
    print(f"   Route nodes: {len(result.get('route', []))}")
    print(f"   Total cost: ${result.get('total_estimated_cost')}")
    if result.get('ai_recommendations'):
        print(f"   AI recommendations: âœ…")
    else:
        print(f"   AI recommendations: âŒ (not configured)")
except requests.exceptions.ConnectionError:
    print("\nâŒ Cannot connect to server")
    print("   Start server: cd route_optimizer && venv\\Scripts\\activate && uvicorn route_optimizer:app --reload")
except Exception as e:
    print(f"\nâŒ Route optimization failed: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"   Status: {e.response.status_code}")
        print(f"   Error: {e.response.text}")

print("\n" + "=" * 50)
