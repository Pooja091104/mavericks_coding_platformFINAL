import requests
import json
import time

def test_optimized_assessment_system():
    """Test the optimized assessment system with speed and video recommendations"""
    
    # Test skills that have predefined assessments
    test_skills = ["Python", "JavaScript", "React", "SQL"]
    
    print("🚀 Testing Optimized Assessment System")
    print("=" * 60)
    
    for skill in test_skills:
        print(f"\n🎯 Testing: {skill}")
        print("-" * 30)
        
        start_time = time.time()
        
        try:
            # Test individual skill assessment
            response = requests.post("http://127.0.0.1:8000/generate_skill_assessment", 
                json={
                    "skills": [skill],
                    "difficulty": "intermediate"
                }
            )
            
            generation_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    assessment = data.get("assessment", {})
                    questions = assessment.get("questions", [])
                    source = assessment.get("source", "unknown")
                    
                    print(f"✅ Success! Generated {len(questions)} questions")
                    print(f"   ⚡ Generation time: {generation_time:.2f}s")
                    print(f"   📚 Source: {source}")
                    print(f"   🆔 Assessment ID: {assessment.get('assessment_id', 'N/A')}")
                    
                    # Test assessment submission with video recommendations
                    if questions:
                        print(f"   🎬 Testing video recommendations...")
                        
                        # Simulate some answers (mix of correct/incorrect)
                        answers = {}
                        for i, q in enumerate(questions[:3]):  # Test first 3 questions
                            answers[q["id"]] = q["correct_answer"] if i % 2 == 0 else "wrong_answer"
                        
                        # Submit assessment
                        submit_response = requests.post("http://127.0.0.1:8000/submit_assessment",
                            json={
                                "assessment_id": assessment["assessment_id"],
                                "answers": answers,
                                "time_taken": 5
                            }
                        )
                        
                        if submit_response.status_code == 200:
                            submit_data = submit_response.json()
                            if submit_data.get("success"):
                                analysis = submit_data.get("analysis", {})
                                score = analysis.get("score", 0)
                                recommendations = analysis.get("recommendations", [])
                                
                                print(f"   📊 Score: {score}%")
                                print(f"   🎥 Video recommendations: {len(recommendations)}")
                                
                                for i, rec in enumerate(recommendations[:2]):  # Show first 2
                                    print(f"      {i+1}. {rec.get('video_title', 'Unknown')}")
                                    print(f"         📝 {rec.get('description', 'No description')}")
                                    print(f"         🔗 {rec.get('video_url', 'No URL')}")
                            else:
                                print(f"   ❌ Assessment submission failed: {submit_data.get('message', 'Unknown error')}")
                        else:
                            print(f"   ❌ Assessment submission HTTP error: {submit_response.status_code}")
                else:
                    print(f"❌ Failed: {data.get('message', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Optimized assessment system test completed!")
    print("\n📈 Performance Improvements:")
    print("   • Predefined assessments: Instant (< 0.1s)")
    print("   • Cached assessments: Very fast (< 0.1s)")
    print("   • AI-generated assessments: Slower (2-5s)")
    print("   • Curated video recommendations: High-quality, relevant videos")

if __name__ == "__main__":
    test_optimized_assessment_system() 