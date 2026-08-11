from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models.user
import models.project

# Create database tables
models.user.Base.metadata.create_all(bind=engine)
models.project.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Embroidery AI Studio API",
    description="The core backend API for generating and managing embroidery files using AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, projects, billing, upload

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(billing.router)
app.include_router(upload.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Embroidery AI Studio API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
