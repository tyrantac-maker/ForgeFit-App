from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'forgefit_db')]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'forgefit-super-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 168  # 7 days

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="ForgeFit API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    # Profile fields
    age: Optional[int] = None
    height: Optional[float] = None  # cm
    weight: Optional[float] = None  # kg
    country: Optional[str] = None
    location: Optional[str] = None
    fitness_level: Optional[str] = None  # beginner, intermediate, advanced
    starting_weight: Optional[float] = None
    goal_weight: Optional[float] = None
    goals: Optional[List[str]] = []  # muscle_gain, strength, fat_loss, etc.
    training_location: Optional[str] = None  # home, gym, both
    gym_name: Optional[str] = None
    equipment: Optional[List[Dict[str, Any]]] = []
    schedule: Optional[Dict[str, Any]] = None
    workout_preferences: Optional[Dict[str, Any]] = None
    profile_complete: bool = False
    onboarding_step: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    country: Optional[str] = None
    location: Optional[str] = None
    fitness_level: Optional[str] = None
    starting_weight: Optional[float] = None
    goal_weight: Optional[float] = None
    goals: Optional[List[str]] = None
    training_location: Optional[str] = None
    gym_name: Optional[str] = None
    equipment: Optional[List[Dict[str, Any]]] = None
    schedule: Optional[Dict[str, Any]] = None
    workout_preferences: Optional[Dict[str, Any]] = None
    profile_complete: Optional[bool] = None
    onboarding_step: Optional[int] = None

class Equipment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # dumbbells, barbells, machines, bands, etc.
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None
    resistance: Optional[str] = None  # for bands
    available: bool = True

class Exercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    muscle_group: str
    secondary_muscles: List[str] = []
    equipment_required: List[str] = []
    difficulty: str  # beginner, intermediate, advanced
    instructions: List[str] = []
    animation_url: Optional[str] = None

class WorkoutExercise(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int
    reps: int
    weight: Optional[float] = None
    rest_seconds: int = 60
    notes: Optional[str] = None
    completed: bool = False
    actual_sets: Optional[List[Dict[str, Any]]] = []

class Workout(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    day_of_week: Optional[str] = None
    workout_type: str  # full_body, upper, lower, push, pull, legs, custom
    exercises: List[WorkoutExercise] = []
    estimated_duration: int = 45  # minutes
    ai_generated: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkoutCreate(BaseModel):
    name: str
    day_of_week: Optional[str] = None
    workout_type: str
    exercises: List[WorkoutExercise] = []
    estimated_duration: int = 45

class WorkoutSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    workout_id: str
    workout_name: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    total_duration: Optional[int] = None  # seconds
    exercises_completed: List[Dict[str, Any]] = []
    rep_failures: List[Dict[str, Any]] = []
    adjustments: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    status: str = "in_progress"  # in_progress, completed, abandoned

class PersonalBest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    exercise_name: str
    weight: float
    reps: int
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class PersonalBestCreate(BaseModel):
    exercise_name: str
    weight: float
    reps: int
    notes: Optional[str] = None

class RepFailure(BaseModel):
    exercise_name: str
    weight: float
    target_reps: int
    completed_reps: int
    set_number: int

class WorkoutAdjustment(BaseModel):
    reason: str  # too_tough, too_heavy, too_fast
    exercise_name: Optional[str] = None

class AIWorkoutRequest(BaseModel):
    focus_areas: Optional[List[str]] = None
    duration_minutes: int = 45
    difficulty_preference: Optional[str] = None  # easier, normal, harder

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request) -> dict:
    # Try cookie first
    session_token = request.cookies.get('session_token')
    
    # Try Authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        session_token = auth_header.split(' ')[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session token (from Google OAuth)
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    # Try JWT token
    try:
        payload = decode_jwt_token(session_token)
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid session")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "picture": None,
        "profile_complete": False,
        "onboarding_step": 0,
        "goals": [],
        "equipment": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id, user_data.email)
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    del user_doc["password"]
    if "_id" in user_doc:
        del user_doc["_id"]
    
    return {"user": user_doc, "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("password"):
        raise HTTPException(status_code=401, detail="Please use Google login for this account")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"], user["email"])
    
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    user_response = {k: v for k, v in user.items() if k not in ["password", "_id"]}
    
    return {"user": user_response, "token": token}

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange Emergent OAuth session_id for user data and set cookie"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get session data
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "updated_at": datetime.now(timezone.utc)}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "profile_complete": False,
            "onboarding_step": 0,
            "goals": [],
            "equipment": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    return {"user": user, "token": session_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password"}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== USER PROFILE ENDPOINTS ====================

@api_router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in profile_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_dict}
    )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password": 0})
    return updated_user

@api_router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password"}

# ==================== EQUIPMENT ENDPOINTS ====================

EQUIPMENT_CATALOG = [
    {"name": "Dumbbells", "category": "free_weights", "has_weight": True},
    {"name": "Barbell", "category": "free_weights", "has_weight": True},
    {"name": "EZ Curl Bar", "category": "free_weights", "has_weight": True},
    {"name": "Kettlebells", "category": "free_weights", "has_weight": True},
    {"name": "Weight Plates", "category": "free_weights", "has_weight": True},
    {"name": "Resistance Bands (Light)", "category": "bands", "has_weight": True, "default_resistance": "5-15 lbs"},
    {"name": "Resistance Bands (Medium)", "category": "bands", "has_weight": True, "default_resistance": "15-30 lbs"},
    {"name": "Resistance Bands (Heavy)", "category": "bands", "has_weight": True, "default_resistance": "30-50 lbs"},
    {"name": "Pull-up Bar", "category": "bodyweight", "has_weight": False},
    {"name": "Dip Bars", "category": "bodyweight", "has_weight": False},
    {"name": "Ab Wheel", "category": "bodyweight", "has_weight": False},
    {"name": "Jump Rope", "category": "cardio", "has_weight": False},
    {"name": "Bench (Flat)", "category": "benches", "has_weight": False},
    {"name": "Bench (Adjustable)", "category": "benches", "has_weight": False},
    {"name": "Squat Rack", "category": "racks", "has_weight": False},
    {"name": "Power Rack", "category": "racks", "has_weight": False},
    {"name": "Smith Machine", "category": "machines", "has_weight": True},
    {"name": "Cable Machine", "category": "machines", "has_weight": True},
    {"name": "Leg Press", "category": "machines", "has_weight": True},
    {"name": "Lat Pulldown", "category": "machines", "has_weight": True},
    {"name": "Leg Curl Machine", "category": "machines", "has_weight": True},
    {"name": "Leg Extension Machine", "category": "machines", "has_weight": True},
    {"name": "Chest Press Machine", "category": "machines", "has_weight": True},
    {"name": "Shoulder Press Machine", "category": "machines", "has_weight": True},
    {"name": "Rowing Machine", "category": "cardio", "has_weight": False},
    {"name": "Treadmill", "category": "cardio", "has_weight": False},
    {"name": "Exercise Bike", "category": "cardio", "has_weight": False},
    {"name": "Foam Roller", "category": "recovery", "has_weight": False},
    {"name": "Medicine Ball", "category": "functional", "has_weight": True},
    {"name": "Battle Ropes", "category": "functional", "has_weight": False},
    {"name": "TRX/Suspension Trainer", "category": "functional", "has_weight": False},
]

@api_router.get("/equipment/catalog")
async def get_equipment_catalog():
    return EQUIPMENT_CATALOG

@api_router.post("/equipment")
async def save_user_equipment(equipment: List[Dict[str, Any]], user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"equipment": equipment, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Equipment saved", "equipment": equipment}

# ==================== EXERCISE DATABASE ====================

EXERCISE_DATABASE = [
    # Chest
    {"name": "Bench Press", "muscle_group": "chest", "secondary_muscles": ["triceps", "shoulders"], "equipment_required": ["Barbell", "Bench (Flat)"], "difficulty": "intermediate"},
    {"name": "Dumbbell Bench Press", "muscle_group": "chest", "secondary_muscles": ["triceps", "shoulders"], "equipment_required": ["Dumbbells", "Bench (Flat)"], "difficulty": "beginner"},
    {"name": "Incline Dumbbell Press", "muscle_group": "chest", "secondary_muscles": ["triceps", "shoulders"], "equipment_required": ["Dumbbells", "Bench (Adjustable)"], "difficulty": "intermediate"},
    {"name": "Push-ups", "muscle_group": "chest", "secondary_muscles": ["triceps", "shoulders"], "equipment_required": [], "difficulty": "beginner"},
    {"name": "Cable Flyes", "muscle_group": "chest", "secondary_muscles": [], "equipment_required": ["Cable Machine"], "difficulty": "intermediate"},
    {"name": "Dips", "muscle_group": "chest", "secondary_muscles": ["triceps", "shoulders"], "equipment_required": ["Dip Bars"], "difficulty": "intermediate"},
    
    # Back
    {"name": "Pull-ups", "muscle_group": "back", "secondary_muscles": ["biceps"], "equipment_required": ["Pull-up Bar"], "difficulty": "intermediate"},
    {"name": "Lat Pulldown", "muscle_group": "back", "secondary_muscles": ["biceps"], "equipment_required": ["Lat Pulldown"], "difficulty": "beginner"},
    {"name": "Barbell Rows", "muscle_group": "back", "secondary_muscles": ["biceps", "rear_delts"], "equipment_required": ["Barbell"], "difficulty": "intermediate"},
    {"name": "Dumbbell Rows", "muscle_group": "back", "secondary_muscles": ["biceps", "rear_delts"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Deadlift", "muscle_group": "back", "secondary_muscles": ["hamstrings", "glutes", "core"], "equipment_required": ["Barbell"], "difficulty": "advanced"},
    {"name": "Face Pulls", "muscle_group": "back", "secondary_muscles": ["rear_delts"], "equipment_required": ["Cable Machine"], "difficulty": "beginner"},
    
    # Shoulders
    {"name": "Overhead Press", "muscle_group": "shoulders", "secondary_muscles": ["triceps"], "equipment_required": ["Barbell"], "difficulty": "intermediate"},
    {"name": "Dumbbell Shoulder Press", "muscle_group": "shoulders", "secondary_muscles": ["triceps"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Lateral Raises", "muscle_group": "shoulders", "secondary_muscles": [], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Front Raises", "muscle_group": "shoulders", "secondary_muscles": [], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Reverse Flyes", "muscle_group": "shoulders", "secondary_muscles": ["upper_back"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    
    # Legs
    {"name": "Squats", "muscle_group": "legs", "secondary_muscles": ["glutes", "core"], "equipment_required": ["Barbell", "Squat Rack"], "difficulty": "intermediate"},
    {"name": "Goblet Squats", "muscle_group": "legs", "secondary_muscles": ["glutes", "core"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Leg Press", "muscle_group": "legs", "secondary_muscles": ["glutes"], "equipment_required": ["Leg Press"], "difficulty": "beginner"},
    {"name": "Lunges", "muscle_group": "legs", "secondary_muscles": ["glutes"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Romanian Deadlift", "muscle_group": "legs", "secondary_muscles": ["glutes", "lower_back"], "equipment_required": ["Barbell"], "difficulty": "intermediate"},
    {"name": "Leg Curls", "muscle_group": "legs", "secondary_muscles": [], "equipment_required": ["Leg Curl Machine"], "difficulty": "beginner"},
    {"name": "Leg Extensions", "muscle_group": "legs", "secondary_muscles": [], "equipment_required": ["Leg Extension Machine"], "difficulty": "beginner"},
    {"name": "Calf Raises", "muscle_group": "legs", "secondary_muscles": [], "equipment_required": [], "difficulty": "beginner"},
    
    # Arms
    {"name": "Bicep Curls", "muscle_group": "arms", "secondary_muscles": [], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Hammer Curls", "muscle_group": "arms", "secondary_muscles": ["forearms"], "equipment_required": ["Dumbbells"], "difficulty": "beginner"},
    {"name": "Barbell Curls", "muscle_group": "arms", "secondary_muscles": [], "equipment_required": ["Barbell"], "difficulty": "beginner"},
    {"name": "Tricep Pushdowns", "muscle_group": "arms", "secondary_muscles": [], "equipment_required": ["Cable Machine"], "difficulty": "beginner"},
    {"name": "Skull Crushers", "muscle_group": "arms", "secondary_muscles": [], "equipment_required": ["EZ Curl Bar", "Bench (Flat)"], "difficulty": "intermediate"},
    {"name": "Tricep Dips", "muscle_group": "arms", "secondary_muscles": ["chest"], "equipment_required": ["Dip Bars"], "difficulty": "intermediate"},
    
    # Core
    {"name": "Plank", "muscle_group": "core", "secondary_muscles": [], "equipment_required": [], "difficulty": "beginner"},
    {"name": "Crunches", "muscle_group": "core", "secondary_muscles": [], "equipment_required": [], "difficulty": "beginner"},
    {"name": "Russian Twists", "muscle_group": "core", "secondary_muscles": ["obliques"], "equipment_required": [], "difficulty": "beginner"},
    {"name": "Leg Raises", "muscle_group": "core", "secondary_muscles": ["hip_flexors"], "equipment_required": [], "difficulty": "intermediate"},
    {"name": "Ab Wheel Rollouts", "muscle_group": "core", "secondary_muscles": [], "equipment_required": ["Ab Wheel"], "difficulty": "advanced"},
    {"name": "Cable Woodchops", "muscle_group": "core", "secondary_muscles": ["obliques"], "equipment_required": ["Cable Machine"], "difficulty": "intermediate"},
]

@api_router.get("/exercises")
async def get_exercises(muscle_group: Optional[str] = None, difficulty: Optional[str] = None):
    exercises = EXERCISE_DATABASE.copy()
    
    if muscle_group:
        exercises = [e for e in exercises if e["muscle_group"] == muscle_group]
    
    if difficulty:
        exercises = [e for e in exercises if e["difficulty"] == difficulty]
    
    return exercises

@api_router.get("/exercises/available")
async def get_available_exercises(user: dict = Depends(get_current_user)):
    """Get exercises available based on user's equipment"""
    user_equipment = [e.get("name") for e in user.get("equipment", [])]
    
    available = []
    for exercise in EXERCISE_DATABASE:
        required = exercise.get("equipment_required", [])
        if not required or all(eq in user_equipment for eq in required):
            available.append(exercise)
    
    return available

# ==================== WORKOUT ENDPOINTS ====================

@api_router.post("/workouts")
async def create_workout(workout_data: WorkoutCreate, user: dict = Depends(get_current_user)):
    workout = Workout(
        user_id=user["user_id"],
        name=workout_data.name,
        day_of_week=workout_data.day_of_week,
        workout_type=workout_data.workout_type,
        exercises=workout_data.exercises,
        estimated_duration=workout_data.estimated_duration,
        ai_generated=False
    )
    
    await db.workouts.insert_one(workout.dict())
    return workout

@api_router.get("/workouts")
async def get_workouts(user: dict = Depends(get_current_user)):
    workouts = await db.workouts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return workouts

@api_router.get("/workouts/{workout_id}")
async def get_workout(workout_id: str, user: dict = Depends(get_current_user)):
    workout = await db.workouts.find_one({"id": workout_id, "user_id": user["user_id"]}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout

@api_router.put("/workouts/{workout_id}")
async def update_workout(workout_id: str, workout_data: WorkoutCreate, user: dict = Depends(get_current_user)):
    update_dict = workout_data.dict()
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.workouts.update_one(
        {"id": workout_id, "user_id": user["user_id"]},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return await db.workouts.find_one({"id": workout_id}, {"_id": 0})

@api_router.delete("/workouts/{workout_id}")
async def delete_workout(workout_id: str, user: dict = Depends(get_current_user)):
    result = await db.workouts.delete_one({"id": workout_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"message": "Workout deleted"}

# ==================== AI WORKOUT GENERATION ====================

@api_router.post("/workouts/generate")
async def generate_ai_workout(request: AIWorkoutRequest, user: dict = Depends(get_current_user)):
    """Generate AI-powered workout based on user profile and preferences"""
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Get available exercises for user
    user_equipment = [e.get("name") for e in user.get("equipment", [])]
    available_exercises = []
    for exercise in EXERCISE_DATABASE:
        required = exercise.get("equipment_required", [])
        if not required or all(eq in user_equipment for eq in required):
            available_exercises.append(exercise)
    
    # Build prompt
    user_profile = f"""
    User Profile:
    - Age: {user.get('age', 'Not specified')}
    - Fitness Level: {user.get('fitness_level', 'beginner')}
    - Goals: {', '.join(user.get('goals', ['general_fitness']))}
    - Training Location: {user.get('training_location', 'home')}
    - Available Equipment: {', '.join(user_equipment) if user_equipment else 'Bodyweight only'}
    """
    
    exercises_list = "\n".join([f"- {e['name']} (targets {e['muscle_group']}, difficulty: {e['difficulty']})" for e in available_exercises])
    
    focus = request.focus_areas if request.focus_areas else user.get('goals', ['general_fitness'])
    
    prompt = f"""
    Create a {request.duration_minutes}-minute workout plan for this user:
    
    {user_profile}
    
    Focus areas for today: {', '.join(focus)}
    Difficulty preference: {request.difficulty_preference or 'normal'}
    
    Available exercises:
    {exercises_list}
    
    Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
    {{
        "name": "Workout name",
        "workout_type": "full_body|upper|lower|push|pull|legs",
        "exercises": [
            {{
                "exercise_name": "Exercise Name",
                "sets": 3,
                "reps": 10,
                "weight": null,
                "rest_seconds": 60,
                "notes": "optional tip"
            }}
        ],
        "estimated_duration": {request.duration_minutes}
    }}
    
    CRITICAL RULES:
    1. Only use exercises from the available list
    2. Adjust sets/reps based on user's fitness level and goals
    3. Include 4-6 exercises for the given duration
    4. For strength goals: lower reps (6-8), higher weight
    5. For muscle gain: moderate reps (8-12)
    6. For fat loss/conditioning: higher reps (12-15) with shorter rest
    7. Always include a warm-up suggestion in notes of first exercise
    8. WEIGHT MUST BE A NUMBER OR NULL - NEVER USE TEXT LIKE "increase gradually"
    9. If weight is not applicable (bodyweight exercises), use null
    10. For weighted exercises, suggest a specific number (e.g., 20, 50, 80)
    """
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"workout_gen_{user['user_id']}_{datetime.now().timestamp()}",
            system_message="You are a professional fitness trainer. Always respond with valid JSON only."
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse response
        import json
        # Clean up response - remove markdown if present
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        clean_response = clean_response.strip()
        
        workout_data = json.loads(clean_response)
        
        # Create workout
        exercises = []
        for ex in workout_data.get("exercises", []):
            # Validate and clean weight value
            weight = ex.get("weight")
            if weight is not None:
                try:
                    # Try to convert to float
                    if isinstance(weight, str):
                        # If it's a string that's not numeric, set to null
                        if not weight.replace('.', '').replace('-', '').isdigit():
                            weight = None
                        else:
                            weight = float(weight)
                    else:
                        weight = float(weight)
                except (ValueError, TypeError):
                    weight = None
            
            exercises.append(WorkoutExercise(
                exercise_id=str(uuid.uuid4()),
                exercise_name=ex["exercise_name"],
                sets=ex["sets"],
                reps=ex["reps"],
                weight=weight,
                rest_seconds=ex.get("rest_seconds", 60),
                notes=ex.get("notes")
            ))
        
        workout = Workout(
            user_id=user["user_id"],
            name=workout_data.get("name", "AI Generated Workout"),
            workout_type=workout_data.get("workout_type", "full_body"),
            exercises=exercises,
            estimated_duration=workout_data.get("estimated_duration", request.duration_minutes),
            ai_generated=True
        )
        
        await db.workouts.insert_one(workout.dict())
        
        return workout.dict()
        
    except Exception as e:
        logger.error(f"AI workout generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate workout: {str(e)}")

# ==================== WORKOUT SESSION ENDPOINTS ====================

@api_router.post("/sessions/start/{workout_id}")
async def start_workout_session(workout_id: str, user: dict = Depends(get_current_user)):
    workout = await db.workouts.find_one({"id": workout_id, "user_id": user["user_id"]}, {"_id": 0})
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    session = WorkoutSession(
        user_id=user["user_id"],
        workout_id=workout_id,
        workout_name=workout["name"],
        exercises_completed=[{"exercise": ex, "completed": False} for ex in workout.get("exercises", [])]
    )
    
    await db.workout_sessions.insert_one(session.dict())
    return session.dict()

@api_router.put("/sessions/{session_id}")
async def update_session(session_id: str, update_data: dict, user: dict = Depends(get_current_user)):
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.workout_sessions.update_one(
        {"id": session_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return await db.workout_sessions.find_one({"id": session_id}, {"_id": 0})

@api_router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    session = await db.workout_sessions.find_one({"id": session_id, "user_id": user["user_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    started_at = session["started_at"]
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at)
    
    # Ensure started_at has timezone info
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    
    ended_at = datetime.now(timezone.utc)
    total_duration = int((ended_at - started_at).total_seconds())
    
    await db.workout_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "ended_at": ended_at,
            "total_duration": total_duration,
            "status": "completed",
            "notes": notes
        }}
    )
    
    return await db.workout_sessions.find_one({"id": session_id}, {"_id": 0})

@api_router.post("/sessions/{session_id}/rep-failure")
async def log_rep_failure(session_id: str, failure: RepFailure, user: dict = Depends(get_current_user)):
    """Log a rep failure during workout"""
    failure_data = {
        **failure.dict(),
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.workout_sessions.update_one(
        {"id": session_id, "user_id": user["user_id"]},
        {"$push": {"rep_failures": failure_data}}
    )
    
    # Store for future workout adaptation
    await db.rep_failure_history.insert_one({
        "user_id": user["user_id"],
        "session_id": session_id,
        **failure_data
    })
    
    return {"message": "Rep failure logged", "failure": failure_data}

@api_router.post("/sessions/{session_id}/adjust")
async def adjust_workout(session_id: str, adjustment: WorkoutAdjustment, user: dict = Depends(get_current_user)):
    """Adjust current workout based on feedback"""
    adjustment_data = {
        **adjustment.dict(),
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.workout_sessions.update_one(
        {"id": session_id, "user_id": user["user_id"]},
        {"$push": {"adjustments": adjustment_data}}
    )
    
    # Store for future workout adaptation
    await db.adjustment_history.insert_one({
        "user_id": user["user_id"],
        "session_id": session_id,
        **adjustment_data
    })
    
    return {"message": "Adjustment logged", "adjustment": adjustment_data}

@api_router.get("/sessions")
async def get_sessions(limit: int = 20, user: dict = Depends(get_current_user)):
    sessions = await db.workout_sessions.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("started_at", -1).to_list(limit)
    return sessions

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    session = await db.workout_sessions.find_one({"id": session_id, "user_id": user["user_id"]}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# ==================== PERSONAL BESTS ====================

@api_router.post("/personal-bests")
async def add_personal_best(pb_data: PersonalBestCreate, user: dict = Depends(get_current_user)):
    pb = PersonalBest(
        user_id=user["user_id"],
        exercise_name=pb_data.exercise_name,
        weight=pb_data.weight,
        reps=pb_data.reps,
        notes=pb_data.notes
    )
    
    await db.personal_bests.insert_one(pb.dict())
    return pb.dict()

@api_router.get("/personal-bests")
async def get_personal_bests(exercise_name: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["user_id"]}
    if exercise_name:
        query["exercise_name"] = exercise_name
    
    pbs = await db.personal_bests.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return pbs

@api_router.get("/personal-bests/top")
async def get_top_personal_bests(user: dict = Depends(get_current_user)):
    """Get best PB for each exercise"""
    pipeline = [
        {"$match": {"user_id": user["user_id"]}},
        {"$sort": {"weight": -1}},
        {"$group": {
            "_id": "$exercise_name",
            "exercise_name": {"$first": "$exercise_name"},
            "weight": {"$first": "$weight"},
            "reps": {"$first": "$reps"},
            "date": {"$first": "$date"}
        }}
    ]
    
    results = await db.personal_bests.aggregate(pipeline).to_list(100)
    return results

# ==================== PROGRESS & STATS ====================

@api_router.get("/stats/overview")
async def get_stats_overview(user: dict = Depends(get_current_user)):
    """Get user's workout statistics overview"""
    user_id = user["user_id"]
    
    # Total workouts completed
    total_sessions = await db.workout_sessions.count_documents({
        "user_id": user_id,
        "status": "completed"
    })
    
    # Total workout time (in minutes)
    pipeline = [
        {"$match": {"user_id": user_id, "status": "completed"}},
        {"$group": {"_id": None, "total_seconds": {"$sum": "$total_duration"}}}
    ]
    time_result = await db.workout_sessions.aggregate(pipeline).to_list(1)
    total_minutes = (time_result[0]["total_seconds"] // 60) if time_result else 0
    
    # This week's workouts
    week_start = datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    this_week = await db.workout_sessions.count_documents({
        "user_id": user_id,
        "status": "completed",
        "started_at": {"$gte": week_start}
    })
    
    # Current streak
    streak = await calculate_streak(user_id)
    
    # Total PBs
    total_pbs = await db.personal_bests.count_documents({"user_id": user_id})
    
    return {
        "total_workouts": total_sessions,
        "total_minutes": total_minutes,
        "this_week": this_week,
        "current_streak": streak,
        "total_pbs": total_pbs
    }

async def calculate_streak(user_id: str) -> int:
    """Calculate current workout streak in days"""
    sessions = await db.workout_sessions.find(
        {"user_id": user_id, "status": "completed"},
        {"started_at": 1}
    ).sort("started_at", -1).to_list(365)
    
    if not sessions:
        return 0
    
    streak = 0
    current_date = datetime.now(timezone.utc).date()
    
    workout_dates = set()
    for s in sessions:
        started_at = s["started_at"]
        if isinstance(started_at, str):
            started_at = datetime.fromisoformat(started_at)
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        workout_dates.add(started_at.date())
    
    # Check if worked out today or yesterday to start streak
    if current_date not in workout_dates and (current_date - timedelta(days=1)) not in workout_dates:
        return 0
    
    check_date = current_date if current_date in workout_dates else current_date - timedelta(days=1)
    
    while check_date in workout_dates:
        streak += 1
        check_date -= timedelta(days=1)
    
    return streak

@api_router.get("/stats/weekly")
async def get_weekly_stats(user: dict = Depends(get_current_user)):
    """Get workout stats for each day of current week"""
    user_id = user["user_id"]
    
    # Get start of week (Monday)
    today = datetime.now(timezone.utc)
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    daily_stats = []
    for i in range(7):
        day_start = week_start + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        count = await db.workout_sessions.count_documents({
            "user_id": user_id,
            "status": "completed",
            "started_at": {"$gte": day_start, "$lt": day_end}
        })
        
        daily_stats.append({
            "day": day_start.strftime("%a"),
            "date": day_start.isoformat(),
            "workouts": count
        })
    
    return daily_stats

# ==================== ROOT & HEALTH ====================

@api_router.get("/")
async def root():
    return {"message": "ForgeFit API v1.0", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
