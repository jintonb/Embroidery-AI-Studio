from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.user import User
from models.project import Project, ProjectStatus
from api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

# Pydantic Schemas for Request/Response
class ProjectCreate(BaseModel):
    name: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    status: ProjectStatus
    original_image_url: str | None = None
    embroidery_file_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
def create_project(
    project_in: ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.credits < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Not enough credits to create a new project"
        )
    
    new_project = Project(
        name=project_in.name,
        user_id=current_user.id
    )
    db.add(new_project)
    
    # Deduct 1 credit for creating a project (or you can deduct when digitizing)
    current_user.credits -= 1
    
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

from core.digitizer import image_to_stitches

@router.post("/{project_id}/digitize", response_model=ProjectResponse)
def digitize_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.embroidery_file_url:
        raise HTTPException(status_code=400, detail="No image uploaded yet")
        
    # project.embroidery_file_url is currently pointing to the AI processed image from Phase 4
    processed_image_path = project.embroidery_file_url
    
    try:
        # Run the digitization engine
        pes_path = image_to_stitches(processed_image_path)
        
        # Update the project with the final embroidery file and status
        project.embroidery_file_url = pes_path
        project.status = ProjectStatus.COMPLETED
        db.commit()
        db.refresh(project)
        
        return project
    except Exception as e:
        project.status = ProjectStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
