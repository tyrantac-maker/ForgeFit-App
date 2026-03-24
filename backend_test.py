#!/usr/bin/env python3
"""
ForgeFit Backend API Testing Suite
Tests all backend APIs according to the test_result.md requirements
"""

import asyncio
import httpx
import json
import uuid
from datetime import datetime, timezone
import sys
import os

# Base URL from frontend/.env
BASE_URL = "https://ai-trainer-forge.preview.emergentagent.com/api"

class ForgeFitAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session_token = None
        self.user_id = None
        self.test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@forgefit.com"
        self.test_user_password = "TestPassword123!"
        self.test_user_name = "Test User"
        self.workout_id = None
        self.session_id = None
        self.results = {
            "passed": [],
            "failed": [],
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", error=None):
        """Log test result"""
        if success:
            self.results["passed"].append(f"✅ {test_name}: {message}")
            print(f"✅ {test_name}: {message}")
        else:
            error_msg = f"❌ {test_name}: {message}"
            if error:
                error_msg += f" - Error: {str(error)}"
            self.results["failed"].append(error_msg)
            print(error_msg)
    
    def log_error(self, test_name, error):
        """Log test error"""
        error_msg = f"🔥 {test_name}: CRITICAL ERROR - {str(error)}"
        self.results["errors"].append(error_msg)
        print(error_msg)
    
    async def test_user_registration(self):
        """Test POST /api/auth/register"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/auth/register",
                    json={
                        "email": self.test_user_email,
                        "password": self.test_user_password,
                        "name": self.test_user_name
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "user" in data and "token" in data:
                        self.session_token = data["token"]
                        self.user_id = data["user"]["user_id"]
                        self.log_result("User Registration", True, f"User created with ID: {self.user_id}")
                        return True
                    else:
                        self.log_result("User Registration", False, "Missing user or token in response")
                        return False
                else:
                    self.log_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("User Registration", e)
            return False
    
    async def test_user_login(self):
        """Test POST /api/auth/login"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/auth/login",
                    json={
                        "email": self.test_user_email,
                        "password": self.test_user_password
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "user" in data and "token" in data:
                        # Update token from login
                        self.session_token = data["token"]
                        self.log_result("User Login", True, f"Login successful for {self.test_user_email}")
                        return True
                    else:
                        self.log_result("User Login", False, "Missing user or token in response")
                        return False
                else:
                    self.log_result("User Login", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("User Login", e)
            return False
    
    async def test_get_current_user(self):
        """Test GET /api/auth/me"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/auth/me",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "user_id" in data and data["user_id"] == self.user_id:
                        self.log_result("Get Current User", True, f"Retrieved user data for {data.get('email')}")
                        return True
                    else:
                        self.log_result("Get Current User", False, "User ID mismatch or missing")
                        return False
                else:
                    self.log_result("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Get Current User", e)
            return False
    
    async def test_profile_update(self):
        """Test PUT /api/profile"""
        try:
            profile_data = {
                "age": 28,
                "height": 175.0,
                "weight": 75.0,
                "fitness_level": "intermediate",
                "goals": ["muscle_gain", "strength"],
                "training_location": "gym",
                "equipment": [
                    {"name": "Dumbbells", "category": "free_weights", "has_weight": True},
                    {"name": "Barbell", "category": "free_weights", "has_weight": True},
                    {"name": "Bench (Adjustable)", "category": "benches", "has_weight": False}
                ],
                "profile_complete": True
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    f"{self.base_url}/profile",
                    json=profile_data,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("age") == 28 and data.get("fitness_level") == "intermediate":
                        self.log_result("Profile Update", True, "Profile updated with complete data")
                        return True
                    else:
                        self.log_result("Profile Update", False, "Profile data not updated correctly")
                        return False
                else:
                    self.log_result("Profile Update", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Profile Update", e)
            return False
    
    async def test_equipment_catalog(self):
        """Test GET /api/equipment/catalog"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/equipment/catalog")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        # Check if it has expected equipment
                        equipment_names = [item.get("name") for item in data]
                        if "Dumbbells" in equipment_names and "Barbell" in equipment_names:
                            self.log_result("Equipment Catalog", True, f"Retrieved {len(data)} equipment items")
                            return True
                        else:
                            self.log_result("Equipment Catalog", False, "Missing expected equipment items")
                            return False
                    else:
                        self.log_result("Equipment Catalog", False, "Empty or invalid equipment catalog")
                        return False
                else:
                    self.log_result("Equipment Catalog", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Equipment Catalog", e)
            return False
    
    async def test_ai_workout_generation(self):
        """Test POST /api/workouts/generate"""
        try:
            workout_request = {
                "focus_areas": ["chest", "back"],
                "duration_minutes": 45,
                "difficulty_preference": "normal"
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/workouts/generate",
                    json=workout_request,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and "exercises" in data and data.get("ai_generated") == True:
                        self.workout_id = data["id"]  # Store for later tests
                        self.log_result("AI Workout Generation", True, f"Generated workout with {len(data['exercises'])} exercises")
                        return True
                    else:
                        self.log_result("AI Workout Generation", False, "Invalid workout structure or not AI generated")
                        return False
                else:
                    self.log_result("AI Workout Generation", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("AI Workout Generation", e)
            return False
    
    async def test_get_workouts(self):
        """Test GET /api/workouts"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/workouts",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        # Should have at least the AI generated workout
                        if len(data) > 0:
                            self.log_result("Get Workouts", True, f"Retrieved {len(data)} workouts")
                            return True
                        else:
                            self.log_result("Get Workouts", False, "No workouts found")
                            return False
                    else:
                        self.log_result("Get Workouts", False, "Invalid response format")
                        return False
                else:
                    self.log_result("Get Workouts", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Get Workouts", e)
            return False
    
    async def test_create_custom_workout(self):
        """Test POST /api/workouts"""
        try:
            workout_data = {
                "name": "Custom Test Workout",
                "workout_type": "upper",
                "exercises": [
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": "Push-ups",
                        "sets": 3,
                        "reps": 15,
                        "rest_seconds": 60
                    },
                    {
                        "exercise_id": str(uuid.uuid4()),
                        "exercise_name": "Pull-ups",
                        "sets": 3,
                        "reps": 8,
                        "rest_seconds": 90
                    }
                ],
                "estimated_duration": 30
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/workouts",
                    json=workout_data,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and data.get("name") == "Custom Test Workout":
                        self.log_result("Create Custom Workout", True, f"Created workout: {data['name']}")
                        return True
                    else:
                        self.log_result("Create Custom Workout", False, "Invalid workout creation response")
                        return False
                else:
                    self.log_result("Create Custom Workout", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Create Custom Workout", e)
            return False
    
    async def test_get_single_workout(self):
        """Test GET /api/workouts/{id}"""
        if not self.workout_id:
            self.log_result("Get Single Workout", False, "No workout ID available from previous tests")
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/workouts/{self.workout_id}",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and data["id"] == self.workout_id:
                        self.log_result("Get Single Workout", True, f"Retrieved workout: {data.get('name')}")
                        return True
                    else:
                        self.log_result("Get Single Workout", False, "Workout ID mismatch")
                        return False
                else:
                    self.log_result("Get Single Workout", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Get Single Workout", e)
            return False
    
    async def test_start_workout_session(self):
        """Test POST /api/sessions/start/{workout_id}"""
        if not self.workout_id:
            self.log_result("Start Workout Session", False, "No workout ID available")
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sessions/start/{self.workout_id}",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and data.get("status") == "in_progress":
                        self.session_id = data["id"]
                        self.log_result("Start Workout Session", True, f"Started session: {self.session_id}")
                        return True
                    else:
                        self.log_result("Start Workout Session", False, "Invalid session start response")
                        return False
                else:
                    self.log_result("Start Workout Session", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Start Workout Session", e)
            return False
    
    async def test_log_rep_failure(self):
        """Test POST /api/sessions/{session_id}/rep-failure"""
        if not self.session_id:
            self.log_result("Log Rep Failure", False, "No session ID available")
            return False
        
        try:
            failure_data = {
                "exercise_name": "Bench Press",
                "weight": 80.0,
                "target_reps": 10,
                "completed_reps": 7,
                "set_number": 2
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sessions/{self.session_id}/rep-failure",
                    json=failure_data,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "message" in data and "failure" in data:
                        self.log_result("Log Rep Failure", True, "Rep failure logged successfully")
                        return True
                    else:
                        self.log_result("Log Rep Failure", False, "Invalid rep failure response")
                        return False
                else:
                    self.log_result("Log Rep Failure", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Log Rep Failure", e)
            return False
    
    async def test_log_workout_adjustment(self):
        """Test POST /api/sessions/{session_id}/adjust"""
        if not self.session_id:
            self.log_result("Log Workout Adjustment", False, "No session ID available")
            return False
        
        try:
            adjustment_data = {
                "reason": "too_heavy",
                "exercise_name": "Bench Press"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sessions/{self.session_id}/adjust",
                    json=adjustment_data,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "message" in data and "adjustment" in data:
                        self.log_result("Log Workout Adjustment", True, "Workout adjustment logged successfully")
                        return True
                    else:
                        self.log_result("Log Workout Adjustment", False, "Invalid adjustment response")
                        return False
                else:
                    self.log_result("Log Workout Adjustment", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Log Workout Adjustment", e)
            return False
    
    async def test_complete_session(self):
        """Test POST /api/sessions/{session_id}/complete"""
        if not self.session_id:
            self.log_result("Complete Session", False, "No session ID available")
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sessions/{self.session_id}/complete",
                    json={"notes": "Great workout session!"},
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "completed" and "total_duration" in data:
                        self.log_result("Complete Session", True, f"Session completed in {data['total_duration']} seconds")
                        return True
                    else:
                        self.log_result("Complete Session", False, "Session not marked as completed")
                        return False
                else:
                    self.log_result("Complete Session", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Complete Session", e)
            return False
    
    async def test_get_sessions(self):
        """Test GET /api/sessions"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/sessions",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        self.log_result("Get Sessions", True, f"Retrieved {len(data)} sessions")
                        return True
                    else:
                        self.log_result("Get Sessions", False, "No sessions found")
                        return False
                else:
                    self.log_result("Get Sessions", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Get Sessions", e)
            return False
    
    async def test_add_personal_best(self):
        """Test POST /api/personal-bests"""
        try:
            pb_data = {
                "exercise_name": "Bench Press",
                "weight": 85.0,
                "reps": 8,
                "notes": "New personal best!"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/personal-bests",
                    json=pb_data,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if "id" in data and data.get("exercise_name") == "Bench Press":
                        self.log_result("Add Personal Best", True, f"Added PB: {data['weight']}kg x {data['reps']} reps")
                        return True
                    else:
                        self.log_result("Add Personal Best", False, "Invalid personal best response")
                        return False
                else:
                    self.log_result("Add Personal Best", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Add Personal Best", e)
            return False
    
    async def test_get_personal_bests(self):
        """Test GET /api/personal-bests"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/personal-bests",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        self.log_result("Get Personal Bests", True, f"Retrieved {len(data)} personal bests")
                        return True
                    else:
                        self.log_result("Get Personal Bests", False, "No personal bests found")
                        return False
                else:
                    self.log_result("Get Personal Bests", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Get Personal Bests", e)
            return False
    
    async def test_stats_overview(self):
        """Test GET /api/stats/overview"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/stats/overview",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["total_workouts", "total_minutes", "this_week", "current_streak", "total_pbs"]
                    if all(field in data for field in required_fields):
                        self.log_result("Stats Overview", True, f"Stats: {data['total_workouts']} workouts, {data['total_minutes']} minutes")
                        return True
                    else:
                        self.log_result("Stats Overview", False, "Missing required stats fields")
                        return False
                else:
                    self.log_result("Stats Overview", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Stats Overview", e)
            return False
    
    async def test_weekly_stats(self):
        """Test GET /api/stats/weekly"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/stats/weekly",
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) == 7:
                        # Check if each day has required fields
                        if all("day" in day and "workouts" in day for day in data):
                            self.log_result("Weekly Stats", True, f"Retrieved 7 days of stats")
                            return True
                        else:
                            self.log_result("Weekly Stats", False, "Invalid daily stats structure")
                            return False
                    else:
                        self.log_result("Weekly Stats", False, "Expected 7 days of stats")
                        return False
                else:
                    self.log_result("Weekly Stats", False, f"HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            self.log_error("Weekly Stats", e)
            return False
    
    async def run_all_tests(self):
        """Run all backend API tests in sequence"""
        print(f"🚀 Starting ForgeFit Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"👤 Test User: {self.test_user_email}")
        print("=" * 60)
        
        # Authentication flow
        await self.test_user_registration()
        await self.test_user_login()
        await self.test_get_current_user()
        
        # Profile management
        await self.test_profile_update()
        
        # Equipment
        await self.test_equipment_catalog()
        
        # Workout management
        await self.test_ai_workout_generation()
        await self.test_get_workouts()
        await self.test_create_custom_workout()
        await self.test_get_single_workout()
        
        # Workout sessions
        await self.test_start_workout_session()
        await self.test_log_rep_failure()
        await self.test_log_workout_adjustment()
        await self.test_complete_session()
        await self.test_get_sessions()
        
        # Personal bests
        await self.test_add_personal_best()
        await self.test_get_personal_bests()
        
        # Stats
        await self.test_stats_overview()
        await self.test_weekly_stats()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        print(f"✅ PASSED: {len(self.results['passed'])}")
        for result in self.results['passed']:
            print(f"  {result}")
        
        if self.results['failed']:
            print(f"\n❌ FAILED: {len(self.results['failed'])}")
            for result in self.results['failed']:
                print(f"  {result}")
        
        if self.results['errors']:
            print(f"\n🔥 ERRORS: {len(self.results['errors'])}")
            for result in self.results['errors']:
                print(f"  {result}")
        
        total_tests = len(self.results['passed']) + len(self.results['failed']) + len(self.results['errors'])
        success_rate = (len(self.results['passed']) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 SUCCESS RATE: {success_rate:.1f}% ({len(self.results['passed'])}/{total_tests})")
        
        return {
            "total_tests": total_tests,
            "passed": len(self.results['passed']),
            "failed": len(self.results['failed']),
            "errors": len(self.results['errors']),
            "success_rate": success_rate,
            "results": self.results
        }

async def main():
    """Main test runner"""
    tester = ForgeFitAPITester()
    results = await tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results['failed'] > 0 or results['errors'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())