import requests
import json

def test_individual_skill_assessment():
    """Test individual skill assessment generation"""
    
    # Test skills
    test_skills = ["Python", "React", "SQL"]
    
    print("🧪 Testing Individual Skill Assessment Generation")
    print("=" * 50)
    
    for skill in test_skills:
        print(f"\n🎯 Testing assessment for: {skill}")
        
        try:
            response = requests.post("http://127.0.0.1:8000/generate_skill_assessment", 
                json={
                    "skills": [skill],
                    "difficulty": "intermediate"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    assessment = data.get("assessment", {})
                    questions = assessment.get("questions", [])
                    print(f"✅ Success! Generated {len(questions)} questions for {skill}")
                    print(f"   Assessment ID: {assessment.get('assessment_id', 'N/A')}")
                    print(f"   Skills tested: {assessment.get('skills_tested', [])}")
                else:
                    print(f"❌ Failed: {data.get('message', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Individual skill assessment test completed!")

if __name__ == "__main__":
    test_individual_skill_assessment() 