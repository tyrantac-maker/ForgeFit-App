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
    height_feet: Optional[int] = None
    height_inches: Optional[int] = None
    height_unit: Optional[str] = None  # 'cm' or 'ft_in'
    weight: Optional[float] = None
    weight_unit: Optional[str] = None  # 'kg', 'lbs', 'stone'
    country: Optional[str] = None
    location: Optional[str] = None
    fitness_level: Optional[str] = None
    starting_weight: Optional[float] = None
    goal_weight: Optional[float] = None
    goals: Optional[List[str]] = None
    training_location: Optional[str] = None
    gym_name: Optional[str] = None
    equipment: Optional[List[Dict[str, Any]]] = None
    custom_equipment: Optional[List[Dict[str, Any]]] = None
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
    {"name": "Multi Position Push Up Board", "category": "bodyweight", "has_weight": False},
    {"name": "Wonder Core 2 / Sit Up Ab Machine", "category": "bodyweight", "has_weight": False},
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
    {"name": "Plyo Box", "category": "functional", "has_weight": False},
    {"name": "Stability Ball", "category": "functional", "has_weight": False},
    {"name": "Yoga Mat", "category": "recovery", "has_weight": False},
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

@api_router.post("/equipment/custom")
async def add_custom_equipment(equipment_data: Dict[str, Any], user: dict = Depends(get_current_user)):
    """Add a custom equipment item that's not in the catalog"""
    custom_item = {
        "name": equipment_data.get("name"),
        "category": equipment_data.get("category", "custom"),
        "has_weight": equipment_data.get("has_weight", False),
        "min_weight": equipment_data.get("min_weight", 0),
        "max_weight": equipment_data.get("max_weight", 0),
        "is_custom": True,
        "user_id": user["user_id"]
    }
    
    # Add to user's custom equipment list
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {
            "$push": {"custom_equipment": custom_item},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    return {"message": "Custom equipment added", "equipment": custom_item}

@api_router.get("/equipment/custom")
async def get_custom_equipment(user: dict = Depends(get_current_user)):
    """Get user's custom equipment"""
    return user.get("custom_equipment", [])

# ==================== EXERCISE DATABASE ====================

EXERCISE_DATABASE = [
    # ─── CHEST ───────────────────────────────────────────────────────────────
    {"id":"chest_001","name":"Barbell Bench Press","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Lie flat, grip slightly wider than shoulder-width. Lower bar to chest with control, press explosively."},
    {"id":"chest_002","name":"Incline Barbell Bench Press","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Set bench to 30-45°. Targets upper chest. Lower bar to upper chest, press up."},
    {"id":"chest_003","name":"Decline Barbell Bench Press","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Set bench to -15°. Targets lower chest. Control the descent carefully."},
    {"id":"chest_004","name":"Close-Grip Bench Press","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Grip shoulder-width apart. Elbows stay close to body. Emphasises triceps."},
    {"id":"chest_005","name":"Dumbbell Bench Press","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Greater range of motion than barbell. Lower DBs until elbows are level with the bench."},
    {"id":"chest_006","name":"Incline Dumbbell Press","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Bench at 30-45°. Drives upper chest and front delts. Lower DBs to chest level."},
    {"id":"chest_007","name":"Decline Dumbbell Press","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Targets lower pec fibres. Keep wrists stacked over elbows."},
    {"id":"chest_008","name":"Dumbbell Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Slight bend in elbows throughout. Stretch pecs at the bottom, squeeze at the top."},
    {"id":"chest_009","name":"Incline Dumbbell Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"30-45° bench. Isolates upper chest. Feel the stretch and squeeze on each rep."},
    {"id":"chest_010","name":"Cable Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"intermediate","instructions":"Set cables at shoulder height. Maintain constant tension through full range of motion."},
    {"id":"chest_011","name":"High-to-Low Cable Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"intermediate","instructions":"Cables set high. Pull down and across body. Targets lower chest fibres."},
    {"id":"chest_012","name":"Low-to-High Cable Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"intermediate","instructions":"Cables set low. Pull up and across. Targets upper chest fibres."},
    {"id":"chest_013","name":"Machine Chest Press","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Chest Press Machine"],"difficulty":"beginner","instructions":"Adjust seat so handles align with mid-chest. Push through full range."},
    {"id":"chest_014","name":"Pec Deck / Machine Flyes","muscle_group":"chest","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Chest Press Machine"],"difficulty":"beginner","instructions":"Keep a slight bend in elbows. Squeeze chest hard at peak contraction."},
    {"id":"chest_015","name":"Push-ups","muscle_group":"chest","secondary_muscles":["triceps","front_delts","core"],"categories":["push","compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Hands just outside shoulder-width. Body in a straight line. Full range — chest to floor."},
    {"id":"chest_016","name":"Wide Push-ups","muscle_group":"chest","secondary_muscles":["front_delts"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Hands wider than shoulder-width. Emphasises chest over triceps."},
    {"id":"chest_017","name":"Diamond Push-ups","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Form a diamond shape with thumbs and index fingers. Heavily loads triceps."},
    {"id":"chest_018","name":"Decline Push-ups","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Feet elevated on bench/step. Shifts load to upper chest."},
    {"id":"chest_019","name":"Incline Push-ups","muscle_group":"chest","secondary_muscles":["triceps"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Hands on elevated surface. Reduces body weight load. Good regression."},
    {"id":"chest_020","name":"Chest Dips","muscle_group":"chest","secondary_muscles":["triceps","front_delts"],"categories":["push","compound","bodyweight"],"equipment_required":["Dip Bars"],"difficulty":"intermediate","instructions":"Lean forward to target chest. Lower until elbows hit 90°, press back up."},
    {"id":"chest_021","name":"Dumbbell Pullover","muscle_group":"chest","secondary_muscles":["lats","serratus"],"categories":["pull","isolation"],"equipment_required":["Dumbbells","Bench"],"difficulty":"intermediate","instructions":"Lie perpendicular to bench. Lower DB behind head with arms slightly bent. Great chest and lat stretch."},
    {"id":"chest_022","name":"Landmine Press","muscle_group":"chest","secondary_muscles":["front_delts","triceps"],"categories":["push","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Single arm. Start at shoulder, press up and forward. Safe on shoulders."},

    # ─── BACK ────────────────────────────────────────────────────────────────
    {"id":"back_001","name":"Deadlift","muscle_group":"back","secondary_muscles":["hamstrings","glutes","core","traps"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"advanced","instructions":"Hip-width stance. Neutral spine. Drive through floor, hips and shoulders rise together. Lock out hips at top."},
    {"id":"back_002","name":"Sumo Deadlift","muscle_group":"back","secondary_muscles":["glutes","inner_thigh","hamstrings"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"advanced","instructions":"Wide stance, toes out. Hands inside knees. Drive knees out and pull. More glute emphasis."},
    {"id":"back_003","name":"Romanian Deadlift","muscle_group":"back","secondary_muscles":["hamstrings","glutes"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Soft bend in knees. Hinge at hips, push them back. Bar stays close to legs. Feel hamstring stretch."},
    {"id":"back_004","name":"Barbell Rows","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Hinge to 45°. Pull bar to lower chest/navel. Squeeze shoulder blades at top. No hip swinging."},
    {"id":"back_005","name":"Pendlay Rows","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Bar starts on floor each rep. Torso parallel to floor. Explosive pull. Great for raw strength."},
    {"id":"back_006","name":"T-Bar Row","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Load one end of barbell. Straddle bar, pull to chest. Keep chest up."},
    {"id":"back_007","name":"Dumbbell Rows","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Brace with hand on bench. Pull elbow up and back, not just back. Full stretch at bottom."},
    {"id":"back_008","name":"Chest-Supported Dumbbell Row","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Lie face-down on incline bench. Eliminates body English — strict back stimulus."},
    {"id":"back_009","name":"Pull-ups","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound","bodyweight"],"equipment_required":["Pull-up Bar"],"difficulty":"intermediate","instructions":"Overhand grip, wider than shoulders. Dead hang start. Pull chest to bar."},
    {"id":"back_010","name":"Chin-ups","muscle_group":"back","secondary_muscles":["biceps"],"categories":["pull","compound","bodyweight"],"equipment_required":["Pull-up Bar"],"difficulty":"intermediate","instructions":"Underhand grip, shoulder-width. More bicep involvement than pull-ups."},
    {"id":"back_011","name":"Neutral-Grip Pull-ups","muscle_group":"back","secondary_muscles":["biceps"],"categories":["pull","compound","bodyweight"],"equipment_required":["Pull-up Bar"],"difficulty":"intermediate","instructions":"Palms facing each other. Easiest grip for beginners. Great lat and bicep builder."},
    {"id":"back_012","name":"Lat Pulldown","muscle_group":"back","secondary_muscles":["biceps"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Wide overhand grip. Pull bar to upper chest. Lean back slightly. Squeeze lats."},
    {"id":"back_013","name":"Wide-Grip Lat Pulldown","muscle_group":"back","secondary_muscles":["biceps"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Extra-wide grip. Emphasises lat width over thickness."},
    {"id":"back_014","name":"Reverse-Grip Lat Pulldown","muscle_group":"back","secondary_muscles":["biceps"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Underhand grip. Lower bicep engagement. Pulls elbows closer to body."},
    {"id":"back_015","name":"Seated Cable Row","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Sit tall. Pull handle to navel. Squeeze shoulder blades together. Control return."},
    {"id":"back_016","name":"Wide-Grip Cable Row","muscle_group":"back","secondary_muscles":["rear_delts"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Wide bar attachment. Pull to upper chest. Great for upper back thickness."},
    {"id":"back_017","name":"Face Pulls","muscle_group":"back","secondary_muscles":["rear_delts","external_rotators"],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Rope at eye-level. Pull to face with elbows high. External rotate at end. Shoulder health essential."},
    {"id":"back_018","name":"Straight Arm Pulldown","muscle_group":"back","secondary_muscles":["serratus"],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Arms nearly straight. Pull bar down to hips. Isolates lats without bicep involvement."},
    {"id":"back_019","name":"Band Pull-Aparts","muscle_group":"back","secondary_muscles":["rear_delts"],"categories":["pull","isolation"],"equipment_required":["Resistance Bands"],"difficulty":"beginner","instructions":"Straight arms at shoulder height. Pull band apart until arms fully extended sideways."},
    {"id":"back_020","name":"Inverted Rows","muscle_group":"back","secondary_muscles":["biceps","rear_delts"],"categories":["pull","compound","bodyweight"],"equipment_required":["Barbell"],"difficulty":"beginner","instructions":"Bar set waist-height. Hang underneath, pull chest to bar. Legs straight for harder version."},
    {"id":"back_021","name":"Good Mornings","muscle_group":"back","secondary_muscles":["hamstrings","glutes"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Bar on upper back. Hinge at hips with soft knees. Feel hamstring stretch at bottom."},
    {"id":"back_022","name":"Hyperextensions","muscle_group":"back","secondary_muscles":["glutes","hamstrings"],"categories":["pull","isolation"],"equipment_required":["Hyperextension Bench"],"difficulty":"beginner","instructions":"Hinge at hips. Squeeze glutes to extend back to neutral — don't hyperextend past parallel."},
    {"id":"back_023","name":"Dumbbell Shrugs","muscle_group":"back","secondary_muscles":["traps"],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hold DBs at sides. Shrug shoulders straight up. Hold briefly. Don't roll shoulders."},
    {"id":"back_024","name":"Barbell Shrugs","muscle_group":"back","secondary_muscles":["traps"],"categories":["pull","isolation"],"equipment_required":["Barbell"],"difficulty":"beginner","instructions":"Overhand grip on barbell. Shrug directly up. Pause at top. Heavier loads possible than DBs."},

    # ─── SHOULDERS ───────────────────────────────────────────────────────────
    {"id":"shld_001","name":"Barbell Overhead Press","muscle_group":"shoulders","secondary_muscles":["triceps","upper_chest","core"],"categories":["push","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Grip just outside shoulders. Press bar overhead in slight arc to clear chin. Lock out arms."},
    {"id":"shld_002","name":"Push Press","muscle_group":"shoulders","secondary_muscles":["triceps","legs","core"],"categories":["push","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Use a small leg drive to initiate the press. Catch bar overhead with locked arms."},
    {"id":"shld_003","name":"Dumbbell Shoulder Press","muscle_group":"shoulders","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Seated or standing. DBs at ear level. Press up and slightly in. Don't flare elbows excessively."},
    {"id":"shld_004","name":"Arnold Press","muscle_group":"shoulders","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Start with palms facing you. Rotate palms forward as you press up. Hits all three delt heads."},
    {"id":"shld_005","name":"Lateral Raises","muscle_group":"shoulders","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Slight lean forward and soft elbow bend. Raise to shoulder height. Control the eccentric."},
    {"id":"shld_006","name":"Cable Lateral Raises","muscle_group":"shoulders","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Cable at ankle height on opposite side. Cross-body raise. Constant tension advantage over DBs."},
    {"id":"shld_007","name":"Front Raises","muscle_group":"shoulders","secondary_muscles":["upper_chest"],"categories":["push","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Raise one or both arms to eye height. Targets anterior deltoid. Avoid swinging."},
    {"id":"shld_008","name":"Reverse Dumbbell Flyes","muscle_group":"shoulders","secondary_muscles":["upper_back"],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hinge forward 45°. Lead with elbows, raise out to sides. Targets rear deltoid."},
    {"id":"shld_009","name":"Cable Reverse Flyes","muscle_group":"shoulders","secondary_muscles":["rear_delts"],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Cables at shoulder height, cross the handles. Pull apart to T-position."},
    {"id":"shld_010","name":"Upright Rows","muscle_group":"shoulders","secondary_muscles":["traps","biceps"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Narrow grip. Pull bar to chin height, elbows lead. Avoid if shoulder impingement issues."},
    {"id":"shld_011","name":"Dumbbell Upright Rows","muscle_group":"shoulders","secondary_muscles":["traps"],"categories":["pull","compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Wider hand position reduces shoulder impingement risk vs barbell."},
    {"id":"shld_012","name":"Machine Shoulder Press","muscle_group":"shoulders","secondary_muscles":["triceps"],"categories":["push","compound"],"equipment_required":["Shoulder Press Machine"],"difficulty":"beginner","instructions":"Set seat height so handles are at ear level. Press up fully."},
    {"id":"shld_013","name":"Pike Push-ups","muscle_group":"shoulders","secondary_muscles":["triceps"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Inverted V shape. Lower head between hands. Great handstand press progression."},
    {"id":"shld_014","name":"Handstand Push-ups","muscle_group":"shoulders","secondary_muscles":["triceps","core"],"categories":["push","bodyweight"],"equipment_required":[],"difficulty":"advanced","instructions":"Wall-supported or free. Full overhead pressing range. Elite upper body strength."},
    {"id":"shld_015","name":"Band Lateral Raises","muscle_group":"shoulders","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Resistance Bands"],"difficulty":"beginner","instructions":"Step on band centre. Raise both arms to shoulder height."},

    # ─── LEGS ─────────────────────────────────────────────────────────────────
    {"id":"legs_001","name":"Barbell Back Squat","muscle_group":"legs","secondary_muscles":["glutes","core","lower_back"],"categories":["compound"],"equipment_required":["Barbell","Squat Rack"],"difficulty":"intermediate","instructions":"Bar on upper traps. Squat to parallel or below. Drive knees out. Tall chest."},
    {"id":"legs_002","name":"Barbell Front Squat","muscle_group":"legs","secondary_muscles":["core","upper_back"],"categories":["compound"],"equipment_required":["Barbell","Squat Rack"],"difficulty":"advanced","instructions":"Bar on front delts. Elbows high. More upright torso. Harder on wrist and thoracic mobility."},
    {"id":"legs_003","name":"Romanian Deadlift","muscle_group":"legs","secondary_muscles":["glutes","lower_back"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"intermediate","instructions":"Soft knees. Hinge at hips, bar grazes legs. Feel the hamstring stretch. Return by driving hips forward."},
    {"id":"legs_004","name":"Dumbbell Romanian Deadlift","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["pull","compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Same as barbell RDL but with dumbbells. Easier to learn technique."},
    {"id":"legs_005","name":"Goblet Squat","muscle_group":"legs","secondary_muscles":["glutes","core"],"categories":["compound","bodyweight"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hold DB at chest. Squat deep with elbows brushing inner knees. Great for mobility."},
    {"id":"legs_006","name":"Kettlebell Goblet Squat","muscle_group":"legs","secondary_muscles":["glutes","core"],"categories":["compound"],"equipment_required":["Kettlebell"],"difficulty":"beginner","instructions":"Cup KB at chest. Squat deep, stay upright. Perfect teaching tool for squat pattern."},
    {"id":"legs_007","name":"Dumbbell Lunges","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Step forward, drop back knee toward floor. Front shin stays vertical. Alternate legs."},
    {"id":"legs_008","name":"Walking Lunges","muscle_group":"legs","secondary_muscles":["glutes","balance"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Continuous forward lunges. Cover distance. Great metabolic and balance challenge."},
    {"id":"legs_009","name":"Reverse Lunges","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Step back instead of forward. Easier on knees. More glute activation."},
    {"id":"legs_010","name":"Bulgarian Split Squats","muscle_group":"legs","secondary_muscles":["glutes","hip_flexors"],"categories":["compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"intermediate","instructions":"Rear foot elevated. Drop back knee to floor. Brutal quad and glute builder."},
    {"id":"legs_011","name":"Step-ups","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Step onto a bench or box. Drive through the heel. Fully extend hip at top."},
    {"id":"legs_012","name":"Leg Press","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["push","compound"],"equipment_required":["Leg Press Machine"],"difficulty":"beginner","instructions":"Feet shoulder-width on platform. Lower until 90° knee angle. Don't lock out fully."},
    {"id":"legs_013","name":"Hack Squat","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["push","compound"],"equipment_required":["Hack Squat Machine"],"difficulty":"intermediate","instructions":"Pads on shoulders. Squat to 90°. Narrow stance hits more quad."},
    {"id":"legs_014","name":"Lying Leg Curls","muscle_group":"legs","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Leg Curl Machine"],"difficulty":"beginner","instructions":"Lie face-down. Curl heels toward glutes. Squeeze at peak. Control the eccentric."},
    {"id":"legs_015","name":"Seated Leg Curls","muscle_group":"legs","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Leg Curl Machine"],"difficulty":"beginner","instructions":"Seated position stretches hamstrings at hip, giving better contraction."},
    {"id":"legs_016","name":"Leg Extensions","muscle_group":"legs","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Leg Extension Machine"],"difficulty":"beginner","instructions":"Straighten legs fully. Hold briefly at top. Control descent. Quad isolation."},
    {"id":"legs_017","name":"Standing Calf Raises","muscle_group":"legs","secondary_muscles":[],"categories":["push","isolation","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Rise onto balls of feet. Full range: deep stretch at bottom, full contraction at top."},
    {"id":"legs_018","name":"Seated Calf Raises","muscle_group":"legs","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Seated Calf Raise Machine"],"difficulty":"beginner","instructions":"Targets soleus (lower calf). Full stretch at bottom, squeeze at top."},
    {"id":"legs_019","name":"Smith Machine Squats","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["push","compound"],"equipment_required":["Smith Machine"],"difficulty":"beginner","instructions":"Fixed bar path. Allows foot placement experimentation. Good for overloading."},
    {"id":"legs_020","name":"Hip Thrusts","muscle_group":"legs","secondary_muscles":["glutes","hamstrings"],"categories":["compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Upper back on bench, bar across hips. Drive hips to ceiling. Squeeze glutes hard at top."},
    {"id":"legs_021","name":"Bodyweight Squats","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Feet shoulder-width, toes slightly out. Squat to parallel or below. Knees track toes."},
    {"id":"legs_022","name":"Jump Squats","muscle_group":"legs","secondary_muscles":["glutes","calves"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Squat down then explode upward. Land softly with bent knees. Power developer."},
    {"id":"legs_023","name":"Wall Sit","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["isolation","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Back flat on wall, thighs parallel to floor. Hold the isometric position."},
    {"id":"legs_024","name":"Box Jumps","muscle_group":"legs","secondary_muscles":["glutes","calves"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Stand before box, swing arms, explode up. Land softly on box. Step down."},
    {"id":"legs_025","name":"Cable Pull-Throughs","muscle_group":"legs","secondary_muscles":["glutes","lower_back"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Face away from cable, rope between legs. Hip hinge movement. Great glute and hamstring activation."},
    {"id":"legs_026","name":"Dumbbell Step-ups","muscle_group":"legs","secondary_muscles":["glutes"],"categories":["compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hold DBs at sides. Step onto elevated surface. Drive through heel at top."},

    # ─── ARMS — BICEPS ────────────────────────────────────────────────────────
    {"id":"arms_001","name":"Barbell Curls","muscle_group":"arms","secondary_muscles":["forearms"],"categories":["pull","isolation"],"equipment_required":["Barbell"],"difficulty":"beginner","instructions":"Shoulder-width grip. Curl bar to shoulders. Squeeze at top. Elbows fixed at sides."},
    {"id":"arms_002","name":"EZ Bar Curls","muscle_group":"arms","secondary_muscles":["forearms"],"categories":["pull","isolation"],"equipment_required":["EZ Curl Bar"],"difficulty":"beginner","instructions":"Semi-supinated grip. Easier on wrists than straight bar. Great mass builder."},
    {"id":"arms_003","name":"Dumbbell Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Alternate or simultaneous. Supinate wrist on the way up for peak bicep contraction."},
    {"id":"arms_004","name":"Hammer Curls","muscle_group":"arms","secondary_muscles":["forearms","brachialis"],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Neutral grip throughout. Hits brachialis and forearms. Great for arm thickness."},
    {"id":"arms_005","name":"Concentration Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Elbow braced on inner thigh. Strict curl. Best peak bicep isolation."},
    {"id":"arms_006","name":"Incline Dumbbell Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Lie back on 45° bench. Arms hang behind torso for stretch. Long-head bicep emphasis."},
    {"id":"arms_007","name":"Cable Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Low cable attachment. Constant tension through full range. Great for pump."},
    {"id":"arms_008","name":"Rope Hammer Curls","muscle_group":"arms","secondary_muscles":["brachialis"],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Rope attachment on low cable. Neutral grip curl. Hits brachialis fully."},
    {"id":"arms_009","name":"Preacher Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["EZ Curl Bar"],"difficulty":"beginner","instructions":"Arms resting on preacher pad. Eliminates cheating. Isolates lower bicep insertion."},
    {"id":"arms_010","name":"Spider Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Lie face-down on incline bench. Arms hang freely. Strict curl with full range."},
    {"id":"arms_011","name":"Resistance Band Curls","muscle_group":"arms","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Resistance Bands"],"difficulty":"beginner","instructions":"Step on band. Curl up. Increasing resistance at peak."},
    # ─── ARMS — TRICEPS ──────────────────────────────────────────────────────
    {"id":"arms_012","name":"Skull Crushers","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Bar extended above chest. Lower bar to forehead by flexing elbows. Press back up."},
    {"id":"arms_013","name":"EZ Bar Skull Crushers","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["EZ Curl Bar","Bench"],"difficulty":"intermediate","instructions":"EZ bar reduces wrist strain. Lower to forehead or behind head for extra stretch."},
    {"id":"arms_014","name":"Tricep Pushdowns (Bar)","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Elbows fixed at sides. Push bar down to full extension. Squeeze at bottom."},
    {"id":"arms_015","name":"Tricep Pushdowns (Rope)","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Split rope at bottom for extra supination. Wider contraction. Hits lateral and medial heads."},
    {"id":"arms_016","name":"Overhead Dumbbell Extension","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hold single DB overhead with both hands. Lower behind head. Long-head tricep stretch."},
    {"id":"arms_017","name":"Overhead Cable Extension","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Face away from cable. Rope behind head. Press forward and up. Constant tension on long head."},
    {"id":"arms_018","name":"Tricep Kickbacks","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Hinge forward. Upper arm parallel to floor. Extend forearm back. Squeeze at full extension."},
    {"id":"arms_019","name":"Bench Dips","muscle_group":"arms","secondary_muscles":["chest","front_delts"],"categories":["push","bodyweight"],"equipment_required":["Bench"],"difficulty":"beginner","instructions":"Hands on bench behind you, legs out. Dip until elbows hit 90°. Feet elevated for harder version."},
    {"id":"arms_020","name":"Tricep Dips","muscle_group":"arms","secondary_muscles":["chest","front_delts"],"categories":["push","compound","bodyweight"],"equipment_required":["Dip Bars"],"difficulty":"intermediate","instructions":"Body upright (vs leaning forward). Targets triceps more than chest."},
    {"id":"arms_021","name":"French Press","muscle_group":"arms","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["EZ Curl Bar","Bench"],"difficulty":"intermediate","instructions":"Similar to skull crushers but lower bar behind head for greater stretch on the long head."},
    {"id":"arms_022","name":"JM Press","muscle_group":"arms","secondary_muscles":["chest"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"advanced","instructions":"Cross between close-grip bench and skull crusher. Bar descends to throat. Powerlifter's tricep builder."},

    # ─── CORE ─────────────────────────────────────────────────────────────────
    {"id":"core_001","name":"Plank","muscle_group":"core","secondary_muscles":["shoulders","glutes"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Elbows under shoulders. Body rigid line. Brace abs like expecting a punch. Don't drop hips."},
    {"id":"core_002","name":"Side Plank","muscle_group":"core","secondary_muscles":["obliques","hips"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Stack feet or stagger. Body in straight line. Don't let hips sag."},
    {"id":"core_003","name":"Hollow Body Hold","muscle_group":"core","secondary_muscles":[],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"intermediate","instructions":"Lie flat. Lift arms, head and legs. Lower back pressed to floor. Hold the tension."},
    {"id":"core_004","name":"Dead Bug","muscle_group":"core","secondary_muscles":[],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Lie on back, arms up, knees at 90°. Lower opposite arm and leg simultaneously. Lower back stays flat."},
    {"id":"core_005","name":"Crunches","muscle_group":"core","secondary_muscles":[],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Curl shoulders up. Don't pull neck. Focus on exhaling and squeezing abs at top."},
    {"id":"core_006","name":"Bicycle Crunches","muscle_group":"core","secondary_muscles":["obliques"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Alternate elbow to opposite knee. Keep lower back pressed down. Slow and controlled."},
    {"id":"core_007","name":"Leg Raises","muscle_group":"core","secondary_muscles":["hip_flexors"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"intermediate","instructions":"Lying flat. Keep legs straight. Lower until just above floor. Don't arch back."},
    {"id":"core_008","name":"Hanging Leg Raises","muscle_group":"core","secondary_muscles":["hip_flexors"],"categories":["pull","isolation"],"equipment_required":["Pull-up Bar"],"difficulty":"intermediate","instructions":"Hang from bar. Raise legs to parallel or higher. Avoid swinging."},
    {"id":"core_009","name":"Hanging Knee Raises","muscle_group":"core","secondary_muscles":[],"categories":["pull","isolation","bodyweight"],"equipment_required":["Pull-up Bar"],"difficulty":"beginner","instructions":"Easier than leg raises. Bring knees to chest. Good starter before progressing."},
    {"id":"core_010","name":"V-Ups","muscle_group":"core","secondary_muscles":["hip_flexors"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"intermediate","instructions":"Simultaneously raise legs and upper body. Touch toes at peak. Lower together with control."},
    {"id":"core_011","name":"Russian Twists","muscle_group":"core","secondary_muscles":["obliques"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Lean back 45°. Rotate side to side. Add weight for extra challenge. Feet off floor = harder."},
    {"id":"core_012","name":"Mountain Climbers","muscle_group":"core","secondary_muscles":["shoulders","hip_flexors"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Plank position. Drive knees to chest alternately. Keep hips level. Fast for cardio, slow for abs."},
    {"id":"core_013","name":"Ab Wheel Rollouts","muscle_group":"core","secondary_muscles":["lats","shoulders"],"categories":["bodyweight","compound"],"equipment_required":["Ab Wheel"],"difficulty":"advanced","instructions":"Kneel, roll wheel out to full extension. Pull back using abs not hips. Brutal core exercise."},
    {"id":"core_014","name":"Cable Crunches","muscle_group":"core","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Kneel facing cable. Rope at forehead. Crunch down with abs, not hip flexors. Add load progressively."},
    {"id":"core_015","name":"Cable Woodchops","muscle_group":"core","secondary_muscles":["obliques","shoulders"],"categories":["pull","compound"],"equipment_required":["Cable Machine"],"difficulty":"intermediate","instructions":"High-to-low or low-to-high rotation. Mimics sports movement. Great oblique and core builder."},
    {"id":"core_016","name":"Pallof Press","muscle_group":"core","secondary_muscles":["chest","shoulders"],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Cable at chest height. Press out and hold. Anti-rotation core challenge. Essential for spine stability."},
    {"id":"core_017","name":"Dragon Flags","muscle_group":"core","secondary_muscles":["lats"],"categories":["bodyweight","compound"],"equipment_required":["Bench"],"difficulty":"advanced","instructions":"Grip bench behind head. Raise whole body like a flag. Lower with total body tension. Bruce Lee's special."},
    {"id":"core_018","name":"Flutter Kicks","muscle_group":"core","secondary_muscles":["hip_flexors"],"categories":["bodyweight","isolation"],"equipment_required":[],"difficulty":"beginner","instructions":"Lie flat, legs slightly raised. Alternate up-and-down kicks. Keep lower back pressed to floor."},
    {"id":"core_019","name":"Decline Sit-ups","muscle_group":"core","secondary_muscles":["hip_flexors"],"categories":["bodyweight","isolation"],"equipment_required":["Bench"],"difficulty":"beginner","instructions":"Feet hooked on decline bench. Curl up fully. Add weight at chest for progression."},
    {"id":"core_020","name":"Weighted Cable Crunches","muscle_group":"core","secondary_muscles":[],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"intermediate","instructions":"Add heavy load. Focus on crushing abs to knees. Don't pull with arms."},

    # ─── GLUTES ───────────────────────────────────────────────────────────────
    {"id":"glut_001","name":"Barbell Hip Thrusts","muscle_group":"glutes","secondary_muscles":["hamstrings","core"],"categories":["push","compound"],"equipment_required":["Barbell","Bench"],"difficulty":"intermediate","instructions":"Upper back on bench edge, bar across hip crease. Drive hips up until body forms straight line. Squeeze at top."},
    {"id":"glut_002","name":"Dumbbell Hip Thrusts","muscle_group":"glutes","secondary_muscles":["hamstrings"],"categories":["push","compound"],"equipment_required":["Dumbbells","Bench"],"difficulty":"beginner","instructions":"Same as barbell hip thrust but with a DB on each hip. Good beginner option."},
    {"id":"glut_003","name":"Glute Bridges","muscle_group":"glutes","secondary_muscles":["hamstrings","core"],"categories":["push","compound","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Lie on back, knees bent. Drive hips up, squeeze glutes hard at top. Hold 1-2 seconds."},
    {"id":"glut_004","name":"Single-Leg Glute Bridge","muscle_group":"glutes","secondary_muscles":["hamstrings"],"categories":["push","isolation","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"One leg extended. Drive through the planted foot. Great for glute symmetry and balance."},
    {"id":"glut_005","name":"Cable Kickbacks","muscle_group":"glutes","secondary_muscles":["hamstrings"],"categories":["pull","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Ankle attachment, face cable. Kick leg back and up with controlled hip extension."},
    {"id":"glut_006","name":"Donkey Kicks","muscle_group":"glutes","secondary_muscles":[],"categories":["push","isolation","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"All fours. Drive heel to ceiling with knee bent. Squeeze glute at top. Don't rotate hips."},
    {"id":"glut_007","name":"Fire Hydrants","muscle_group":"glutes","secondary_muscles":["hip_abductors"],"categories":["isolation","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"All fours. Raise knee out to side, keeping knee bent. Targets glute medius."},
    {"id":"glut_008","name":"Sumo Squats","muscle_group":"glutes","secondary_muscles":["inner_thigh","legs"],"categories":["compound"],"equipment_required":["Dumbbells"],"difficulty":"beginner","instructions":"Wide stance, toes out. Squat deep. Emphasis on inner thigh and glutes."},
    {"id":"glut_009","name":"Hip Abductor Machine","muscle_group":"glutes","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Hip Abductor Machine"],"difficulty":"beginner","instructions":"Push knees apart against resistance. Targets glute medius and outer glute."},
    {"id":"glut_010","name":"Monster Walks","muscle_group":"glutes","secondary_muscles":["hip_abductors"],"categories":["isolation","bodyweight"],"equipment_required":["Resistance Bands"],"difficulty":"beginner","instructions":"Band around ankles. Walk sideways in a squat position. Burns glute medius effectively."},
    {"id":"glut_011","name":"Clamshells","muscle_group":"glutes","secondary_muscles":["hip_external_rotators"],"categories":["isolation","bodyweight"],"equipment_required":[],"difficulty":"beginner","instructions":"Lie on side, knees bent. Open top knee like a clamshell. Band adds resistance."},
    {"id":"glut_012","name":"Cable Hip Abduction","muscle_group":"glutes","secondary_muscles":[],"categories":["push","isolation"],"equipment_required":["Cable Machine"],"difficulty":"beginner","instructions":"Ankle attachment, cable on inside. Sweep leg out to side against resistance."},

    # ─── FULL BODY / FUNCTIONAL ──────────────────────────────────────────────
    {"id":"full_001","name":"Burpees","muscle_group":"full_body","secondary_muscles":["chest","core","legs"],"categories":["compound","bodyweight"],"equipment_required":[],"difficulty":"intermediate","instructions":"Drop to plank, do a push-up, jump feet in, explode up with arms overhead. Elite conditioner."},
    {"id":"full_002","name":"Kettlebell Swings","muscle_group":"full_body","secondary_muscles":["glutes","hamstrings","core"],"categories":["pull","compound"],"equipment_required":["Kettlebell"],"difficulty":"intermediate","instructions":"Hip hinge, not a squat. Drive hips forward explosively. KB floats to shoulder height."},
    {"id":"full_003","name":"Kettlebell Clean and Press","muscle_group":"full_body","secondary_muscles":["shoulders","core"],"categories":["push","compound"],"equipment_required":["Kettlebell"],"difficulty":"intermediate","instructions":"Clean KB to rack position, then overhead press. Full body power and strength builder."},
    {"id":"full_004","name":"Dumbbell Thrusters","muscle_group":"full_body","secondary_muscles":["legs","core"],"categories":["push","compound"],"equipment_required":["Dumbbells"],"difficulty":"intermediate","instructions":"Front squat into overhead press in one movement. Brutal for conditioning."},
    {"id":"full_005","name":"Turkish Get-up","muscle_group":"full_body","secondary_muscles":["core","shoulders"],"categories":["compound"],"equipment_required":["Kettlebell"],"difficulty":"advanced","instructions":"Move from lying to standing with KB locked overhead. Demands total body coordination."},
    {"id":"full_006","name":"Power Clean","muscle_group":"full_body","secondary_muscles":["back","legs","traps"],"categories":["pull","compound"],"equipment_required":["Barbell"],"difficulty":"advanced","instructions":"Explosive barbell pull. Bar goes from floor to shoulders in one movement. Olympic lifting."},
    {"id":"full_007","name":"Clean and Press","muscle_group":"full_body","secondary_muscles":["legs","back","shoulders"],"categories":["push","pull","compound"],"equipment_required":["Barbell"],"difficulty":"advanced","instructions":"Power clean followed immediately by overhead press. Classic strength and power builder."},
    {"id":"full_008","name":"Battle Ropes","muscle_group":"full_body","secondary_muscles":["core","shoulders"],"categories":["compound"],"equipment_required":["Battle Ropes"],"difficulty":"intermediate","instructions":"Alternating or simultaneous waves. Intense cardiovascular and upper body conditioning."},
    {"id":"full_009","name":"Jumping Jacks","muscle_group":"full_body","secondary_muscles":["shoulders","calves"],"categories":["bodyweight","compound"],"equipment_required":[],"difficulty":"beginner","instructions":"Jump feet wide while raising arms overhead. Simple cardio warm-up or HIIT element."},
    {"id":"full_010","name":"High Knees","muscle_group":"full_body","secondary_muscles":["core","hip_flexors"],"categories":["bodyweight","compound"],"equipment_required":[],"difficulty":"beginner","instructions":"Run in place bringing knees to waist height. Arms pump opposite to legs."},
    {"id":"full_011","name":"Jump Rope","muscle_group":"full_body","secondary_muscles":["calves","core","shoulders"],"categories":["bodyweight","compound"],"equipment_required":["Jump Rope"],"difficulty":"beginner","instructions":"Keep elbows close. Jump just high enough for rope to pass. Great cardio and coordination."},
    {"id":"full_012","name":"Rowing Machine","muscle_group":"full_body","secondary_muscles":["back","legs","core"],"categories":["pull","compound"],"equipment_required":["Rowing Machine"],"difficulty":"beginner","instructions":"Legs drive first, then lean back, then arm pull. 60% legs, 20% back, 20% arms."},
]

class EquipmentAnalysisRequest(BaseModel):
    equipment_name: str
    equipment_url: Optional[str] = None
    equipment_description: Optional[str] = None

@api_router.get("/exercises")
async def get_exercises(
    muscle_group: Optional[str] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    equipment_only: Optional[bool] = False,
    user: dict = Depends(get_current_user)
):
    exercises = EXERCISE_DATABASE.copy()

    if muscle_group and muscle_group != "all":
        exercises = [e for e in exercises if e["muscle_group"] == muscle_group]

    if difficulty:
        exercises = [e for e in exercises if e["difficulty"] == difficulty]

    if category and category != "all":
        exercises = [e for e in exercises if category in e.get("categories", [])]

    if equipment_only:
        user_equipment = [eq.get("name", "").lower() for eq in user.get("equipment", [])]
        def is_available(ex):
            req = [r.lower() for r in ex.get("equipment_required", [])]
            if not req:
                return True
            return any(r in user_equipment for r in req) or all(r in user_equipment for r in req)
        exercises = [e for e in exercises if is_available(e)]

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

@api_router.post("/exercises/analyze-equipment")
async def analyze_custom_equipment(
    request: EquipmentAnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """Use AI to analyze custom equipment and suggest exercises it enables"""
    if not EMERGENT_LLM_KEY:
        # Return curated exercises based on keyword matching in equipment name/description
        keywords = (request.equipment_name + " " + (request.equipment_description or "")).lower()
        suggestions = []
        equipment_map = {
            "cable": ["Cable Machine"], "pulley": ["Cable Machine"],
            "barbell": ["Barbell"], "bar": ["Barbell"],
            "dumbbell": ["Dumbbells"], "kettlebell": ["Kettlebell"],
            "band": ["Resistance Bands"], "resistance": ["Resistance Bands"],
            "bench": ["Bench"], "pull": ["Pull-up Bar"],
            "squat": ["Squat Rack"], "rack": ["Squat Rack"],
            "leg press": ["Leg Press Machine"], "leg curl": ["Leg Curl Machine"],
        }
        matched_equipment = []
        for kw, eq_list in equipment_map.items():
            if kw in keywords:
                matched_equipment.extend(eq_list)
        if matched_equipment:
            for ex in EXERCISE_DATABASE:
                if any(eq in ex.get("equipment_required", []) for eq in matched_equipment):
                    suggestions.append(ex)
        if not suggestions:
            suggestions = [e for e in EXERCISE_DATABASE if not e.get("equipment_required")]
        return {
            "equipment_name": request.equipment_name,
            "analysis": f"Based on the equipment '{request.equipment_name}', here are exercises you can perform.",
            "exercises": suggestions[:20],
            "ai_powered": False,
        }
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"equipment_{user['user_id']}", system_message=(
            "You are an expert personal trainer. Analyze the described fitness equipment and suggest "
            "specific exercises that can be performed with it. Return a JSON object with keys: "
            "'analysis' (string description) and 'exercise_names' (array of exercise name strings)."
        ))
        prompt = f"Equipment: {request.equipment_name}\n"
        if request.equipment_url:
            prompt += f"URL: {request.equipment_url}\n"
        if request.equipment_description:
            prompt += f"Description: {request.equipment_description}\n"
        prompt += "List exercises (as JSON with 'analysis' string and 'exercise_names' array)."
        resp = await chat.send_message(UserMessage(content=prompt))
        import json as _json, re as _re
        m = _re.search(r'\{.*\}', resp.content or "", _re.DOTALL)
        ai_data = _json.loads(m.group()) if m else {}
        ai_names = [n.lower() for n in ai_data.get("exercise_names", [])]
        matched = [e for e in EXERCISE_DATABASE if any(n in e["name"].lower() for n in ai_names)]
        new_exercises = []
        for name in ai_data.get("exercise_names", []):
            if not any(e["name"].lower() == name.lower() for e in EXERCISE_DATABASE):
                new_exercises.append({
                    "id": f"ai_{name.lower().replace(' ','_')[:20]}",
                    "name": name, "muscle_group": "full_body",
                    "secondary_muscles": [], "categories": ["compound"],
                    "equipment_required": [request.equipment_name],
                    "difficulty": "intermediate",
                    "instructions": f"Perform {name} using the {request.equipment_name}.",
                    "ai_suggested": True,
                })
        return {
            "equipment_name": request.equipment_name,
            "analysis": ai_data.get("analysis", ""),
            "exercises": matched + new_exercises,
            "ai_powered": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

# ==================== RULE-BASED WORKOUT GENERATOR ====================

def generate_rule_based_workout_sync(request, user: dict) -> dict:
    """Generate a structured workout without AI using exercise database and user profile."""
    import random

    fitness_level = user.get('fitness_level', 'beginner')
    goals = user.get('goals', ['general_fitness'])
    user_equipment = [e.get("name") for e in user.get("equipment", [])]

    focus_areas = request.focus_areas if request.focus_areas else goals
    duration = request.duration_minutes

    # Filter available exercises
    available = []
    for ex in EXERCISE_DATABASE:
        required = ex.get("equipment_required", [])
        if not required or all(eq in user_equipment for eq in required):
            available.append(ex)

    if not available:
        available = [ex for ex in EXERCISE_DATABASE if not ex.get("equipment_required")]

    # Determine sets/reps/rest by fitness level and goal
    if 'strength' in focus_areas:
        sets, reps, rest = (5, 5, 120) if fitness_level == 'advanced' else (4, 6, 90)
        workout_type = "full_body"
    elif 'muscle_gain' in focus_areas:
        sets, reps, rest = (4, 10, 75) if fitness_level != 'beginner' else (3, 12, 60)
        workout_type = "upper"
    elif 'fat_loss' in focus_areas or 'conditioning' in focus_areas:
        sets, reps, rest = (3, 15, 45)
        workout_type = "full_body"
    else:
        sets, reps, rest = (3, 12, 60)
        workout_type = "full_body"

    # Target muscle groups based on focus
    goal_muscle_map = {
        'muscle_gain': ['chest', 'back', 'shoulders', 'arms'],
        'strength': ['legs', 'back', 'chest'],
        'fat_loss': ['legs', 'core', 'chest', 'back'],
        'conditioning': ['legs', 'core', 'chest'],
        'endurance': ['legs', 'core'],
        'calisthenics': ['chest', 'back', 'core', 'arms'],
        'general_fitness': ['chest', 'back', 'legs', 'core', 'shoulders'],
    }

    target_muscles = []
    for f in focus_areas:
        target_muscles.extend(goal_muscle_map.get(f, ['chest', 'back', 'legs']))
    target_muscles = list(dict.fromkeys(target_muscles))  # dedupe, preserve order

    # Select exercises: prioritise target muscles, then fill with others
    num_exercises = 5 if duration <= 45 else 6

    selected = []
    used_muscles = set()
    for muscle in target_muscles:
        candidates = [e for e in available if e['muscle_group'] == muscle and muscle not in used_muscles]
        if candidates:
            pick = random.choice(candidates)
            selected.append(pick)
            used_muscles.add(muscle)
        if len(selected) >= num_exercises:
            break

    # Fill remaining slots
    if len(selected) < num_exercises:
        remaining = [e for e in available if e not in selected]
        random.shuffle(remaining)
        for ex in remaining:
            if len(selected) >= num_exercises:
                break
            selected.append(ex)

    # Build exercise list
    exercises_out = []
    for i, ex in enumerate(selected):
        # Bodyweight exercises get null weight
        needs_weight = bool(ex.get("equipment_required"))
        weight_val = None
        if needs_weight:
            if 'strength' in focus_areas:
                weight_val = 60.0 if fitness_level == 'advanced' else 40.0
            elif 'muscle_gain' in focus_areas:
                weight_val = 20.0 if fitness_level == 'beginner' else 40.0
        note = "Start with a 5-minute warm-up before beginning." if i == 0 else None
        exercises_out.append({
            "exercise_name": ex["name"],
            "sets": sets,
            "reps": reps,
            "weight": weight_val,
            "rest_seconds": rest,
            "notes": note,
        })

    # Choose workout name
    primary_goal = focus_areas[0] if focus_areas else 'general_fitness'
    name_map = {
        'muscle_gain': 'Hypertrophy Builder',
        'strength': 'Strength Session',
        'fat_loss': 'Fat Burn Circuit',
        'conditioning': 'Conditioning Blast',
        'endurance': 'Endurance Grind',
        'calisthenics': 'Bodyweight Flow',
        'general_fitness': 'Full Body Session',
    }
    name = name_map.get(primary_goal, 'Custom Workout')

    return {
        "name": name,
        "workout_type": workout_type,
        "exercises": exercises_out,
        "estimated_duration": duration,
    }


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
        # No AI key — use rule-based generator
        workout_data = generate_rule_based_workout_sync(request, user)
        exercises = []
        for ex in workout_data.get("exercises", []):
            exercises.append(WorkoutExercise(
                exercise_id=str(uuid.uuid4()),
                exercise_name=ex["exercise_name"],
                sets=ex["sets"],
                reps=ex["reps"],
                weight=ex.get("weight"),
                rest_seconds=ex.get("rest_seconds", 60),
                notes=ex.get("notes"),
            ))
        workout = Workout(
            user_id=user["user_id"],
            name=workout_data["name"],
            workout_type=workout_data["workout_type"],
            exercises=exercises,
            estimated_duration=workout_data["estimated_duration"],
            ai_generated=False,
        )
        await db.workouts.insert_one(workout.dict())
        return workout.dict()
    
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
        logger.error(f"AI workout generation error: {e}, falling back to rule-based")
        try:
            workout_data = generate_rule_based_workout_sync(request, user)
            exercises = []
            for ex in workout_data.get("exercises", []):
                exercises.append(WorkoutExercise(
                    exercise_id=str(uuid.uuid4()),
                    exercise_name=ex["exercise_name"],
                    sets=ex["sets"],
                    reps=ex["reps"],
                    weight=ex.get("weight"),
                    rest_seconds=ex.get("rest_seconds", 60),
                    notes=ex.get("notes"),
                ))
            workout = Workout(
                user_id=user["user_id"],
                name=workout_data["name"],
                workout_type=workout_data["workout_type"],
                exercises=exercises,
                estimated_duration=workout_data["estimated_duration"],
                ai_generated=False,
            )
            await db.workouts.insert_one(workout.dict())
            return workout.dict()
        except Exception as e2:
            logger.error(f"Rule-based generation also failed: {e2}")
            raise HTTPException(status_code=500, detail="Failed to generate workout")

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

@app.on_event("startup")
async def ensure_admin_account():
    existing = await db.users.find_one({"email": "admin@forgefit.dev"})
    if not existing:
        import uuid as _uuid
        from datetime import datetime, timezone
        user_id = f"user_{_uuid.uuid4().hex[:12]}"
        hashed = hash_password("ForgeFit@2026")
        await db.users.insert_one({
            "user_id": user_id,
            "email": "admin@forgefit.dev",
            "name": "Admin",
            "password": hashed,
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
