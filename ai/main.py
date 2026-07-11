import os
import uuid
import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import structlog

load_dotenv()

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configuration
class Settings:
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin123")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "adamae")
    MINIO_USE_SSL: bool = os.getenv("MINIO_USE_SSL", "false").lower() == "true"
    AI_SERVICE_TOKEN: str = os.getenv("AI_SERVICE_TOKEN", "ai-service-secret-token")
    DEVICE: str = os.getenv("DEVICE", "cpu")
    MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "2"))
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "/app/models")

settings = Settings()

# Global state
job_queue: asyncio.Queue = asyncio.Queue()
active_jobs: Dict[str, Dict] = {}
worker_task: Optional[asyncio.Task] = None

from minio import Minio
from redis import Redis
import rq

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SSL,
)

redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
job_queue_rq = rq.Queue('ai-jobs', connection=redis_client)

def ensure_bucket():
    if not minio_client.bucket_exists(settings.MINIO_BUCKET):
        minio_client.make_bucket(settings.MINIO_BUCKET)
        policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{settings.MINIO_BUCKET}/*"]
            }]
        }
        minio_client.set_bucket_policy(settings.MINIO_BUCKET, json.dumps(policy))

@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_task
    logger.info("Starting AI service...")
    ensure_bucket()
    
    # Load models on startup
    await load_models()
    
    worker_task = asyncio.create_task(job_worker())
    logger.info("AI service started")
    yield
    logger.info("Shutting down AI service...")
    if worker_task:
        worker_task.cancel()
        try:
            await worker_task
        except asyncio.CancelledError:
            pass

app = FastAPI(
    title="AfroToon AI Service",
    description="AI-powered video-to-cartoon and African cartoon generation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class JobInput(BaseModel):
    type: str
    projectId: str
    userId: str
    input: Dict[str, Any]
    priority: int = 0

class JobResponse(BaseModel):
    jobId: str
    status: str

class JobStatusResponse(BaseModel):
    jobId: str
    status: str
    progress: int
    currentStep: Optional[str] = None
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class StyleConfig(BaseModel):
    style: str = "AFRICAN_CARTOON"
    quality: str = "MEDIUM_720P"
    fps: int = 30
    settings: Dict[str, Any] = {}

class AfricanCartoonInput(BaseModel):
    prompt: str
    character: Optional[Dict[str, Any]] = None
    background: Optional[str] = None
    clothing: Optional[str] = None
    accessories: List[str] = []
    style: str = "AFRICAN_CARTOON"
    duration: float = 5.0
    fps: int = 30
    resolution: str = "720p"

# Model cache
models = {}

async def load_models():
    logger.info("Loading AI models...")
    models['device'] = settings.DEVICE
    models['loaded'] = True
    logger.info("Models loaded (placeholder - implement actual model loading)")

def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization[7:]
    if token != settings.AI_SERVICE_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")
    return token

async def update_job_status(job_id: str, status: str, progress: int = 0, step: str = None, output: dict = None, error: str = None):
    job_data = {
        "status": status,
        "progress": progress,
        "currentStep": step,
        "output": output,
        "error": error,
        "updatedAt": datetime.utcnow().isoformat(),
    }
    active_jobs[job_id] = job_data
    redis_client.hset(f"job:{job_id}", mapping=job_data)
    await redis_client.publish(f"job:{job_id}:updates", json.dumps(job_data))

async def job_worker():
    logger.info("Job worker started")
    while True:
        try:
            job_data = await job_queue.get()
            job_id = job_data.get("jobId")
            if not job_id:
                continue
            
            if len(active_jobs) >= settings.MAX_CONCURRENT_JOBS:
                await job_queue.put(job_data)
                await asyncio.sleep(5)
                continue
            
            asyncio.create_task(process_job(job_data))
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error("Worker error", error=str(e))
            await asyncio.sleep(1)

async def process_job(job_data: dict):
    job_id = job_data["jobId"]
    job_type = job_data["type"]
    
    await update_job_status(job_id, "PROCESSING", 10, "Initializing")
    
    try:
        if job_type == "VIDEO_TO_CARTOON":
            await process_video_to_cartoon(job_id, job_data["input"])
        elif job_type == "TEXT_TO_CARTOON":
            await process_text_to_cartoon(job_id, job_data["input"])
        elif job_type == "AFRICAN_CARTOON_GENERATOR":
            await process_african_cartoon(job_id, job_data["input"])
        else:
            raise ValueError(f"Unknown job type: {job_type}")
        
        await update_job_status(job_id, "COMPLETED", 100, "Done")
    except Exception as e:
        logger.error("Job failed", job_id=job_id, error=str(e))
        await update_job_status(job_id, "FAILED", 0, error=str(e))

async def process_video_to_cartoon(job_id: str, input_data: dict):
    video_url = input_data.get("videoUrl")
    style = input_data.get("style", "ANIME")
    quality = input_data.get("quality", "MEDIUM_720P")
    
    await update_job_status(job_id, "PROCESSING", 20, "Downloading video")
    # Download video from MinIO
    
    await update_job_status(job_id, "PROCESSING", 40, "Extracting frames")
    # Extract frames with ffmpeg
    
    await update_job_status(job_id, "PROCESSING", 60, "Applying cartoon style")
    # Apply AnimeGAN / style transfer
    
    await update_job_status(job_id, "PROCESSING", 80, "Reconstructing video")
    # Reconstruct video
    
    await update_job_status(job_id, "PROCESSING", 90, "Uploading result")
    # Upload to MinIO
    
    output = {"videoUrl": f"https://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/outputs/{job_id}.mp4"}
    await update_job_status(job_id, "COMPLETED", 100, "Done", output)

async def process_text_to_cartoon(job_id: str, input_data: dict):
    prompt = input_data.get("prompt")
    style = input_data.get("style", "AFRICAN_CARTOON")
    duration = input_data.get("duration", 5.0)
    
    await update_job_status(job_id, "PROCESSING", 30, "Generating keyframes")
    # Generate keyframes from text
    
    await update_job_status(job_id, "PROCESSING", 60, "Interpolating frames")
    # Frame interpolation
    
    await update_job_status(job_id, "PROCESSING", 80, "Rendering video")
    # Render video
    
    output = {"videoUrl": f"https://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/outputs/{job_id}.mp4"}
    await update_job_status(job_id, "COMPLETED", 100, "Done", output)

async def process_african_cartoon(job_id: str, input_data: dict):
    await update_job_status(job_id, "PROCESSING", 20, "Loading African assets")
    # Load character, background, clothing from asset library
    
    await update_job_status(job_id, "PROCESSING", 50, "Composing scene")
    # Compose scene with African elements
    
    await update_job_status(job_id, "PROCESSING", 80, "Animating")
    # Animate with procedural animation
    
    output = {"videoUrl": f"https://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/outputs/{job_id}.mp4"}
    await update_job_status(job_id, "COMPLETED", 100, "Done", output)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "device": settings.DEVICE, "models_loaded": models.get('loaded', False)}

@app.post("/api/jobs", response_model=JobResponse)
async def create_job(job: JobInput, token: str = Depends(verify_token)):
    job_id = str(uuid.uuid4())
    await update_job_status(job_id, "QUEUED", 0, "Queued")
    await job_queue.put({"jobId": job_id, **job.dict()})
    return JobResponse(jobId=job_id, status="QUEUED")

@app.get("/api/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str, token: str = Depends(verify_token)):
    job_data = redis_client.hgetall(f"job:{job_id}")
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(jobId=job_id, **job_data)

@app.post("/api/jobs/{job_id}/cancel")
async def cancel_job(job_id: str, token: str = Depends(verify_token)):
    if job_id in active_jobs:
        active_jobs[job_id]["status"] = "CANCELLED"
        await update_job_status(job_id, "CANCELLED", 0, "Cancelled by user")
    return {"message": "Job cancelled"}

@app.get("/api/styles")
async def get_styles(token: str = Depends(verify_token)):
    return {
        "video_to_cartoon": ["ANIME", "COMIC", "PIXAR_STYLE", "DISNEY_STYLE", "AFRICAN_CARTOON", "MANGA", "CHIBI", "GHIBLI_STYLE"],
        "african_cartoon": ["AFRICAN_CARTOON", "MAASAI_STYLE", "YORUBA_STYLE", "ZULU_STYLE", "KENTE_STYLE", "ANKARA_STYLE"],
    }

@app.get("/api/assets/african")
async def get_african_assets(token: str = Depends(verify_token)):
    return {
        "characters": ["maasai_warrior", "yoruba_elder", "zulu_dancer", "modern_african_youth"],
        "backgrounds": ["savanna", "village", "market", "city_skyline", "kente_pattern"],
        "clothing": ["maasai_shuka", "ankara_dress", "dashiki", "kente_cloth", "modern_african"],
        "accessories": ["beaded_jewelry", "headwrap", "walking_stick", "shield", "drum"],
        "music": ["afrobeat", "highlife", "kwaito", "amapiano", "traditional_drums"],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)