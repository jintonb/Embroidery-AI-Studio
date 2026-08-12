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
    original_palette: List[str] | None = None
    mapped_palette: List[str] | None = None
    stitch_data: list | None = None
    preview_png_url: str | None = None
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

class DigitizeRequest(BaseModel):
    color_map: dict[str, str] = {}

@router.post("/{project_id}/digitize", response_model=ProjectResponse)
def digitize_project(
    project_id: int, 
    request: DigitizeRequest,
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
        # Save the new color mapping to the project mapped_palette if it exists
        if project.original_palette:
            new_mapped_palette = []
            for og_color in project.original_palette:
                new_mapped_palette.append(request.color_map.get(og_color, og_color))
            project.mapped_palette = new_mapped_palette

        # Run the digitization engine
        zip_path, png_path, stitch_data = image_to_stitches(processed_image_path, color_map=request.color_map)
        
        # Update the project with the final embroidery file and status
        project.embroidery_file_url = zip_path
        project.preview_png_url = png_path
        project.stitch_data = stitch_data
        project.status = ProjectStatus.COMPLETED
        db.commit()
        db.refresh(project)
        
        return project
    except Exception as e:
        project.status = ProjectStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/remap")
def remap_preview(project_id: int, request: DigitizeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from core.digitizer import generate_preview_png
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.embroidery_file_url:
        raise HTTPException(status_code=400, detail="No image to remap")
    
    # Use original image path
    # If zip file exists, we need the processed image. Store it.
    img_path = project.original_image_url or project.embroidery_file_url
    # Prefer embroidery_file_url when status is processing (it points to processed PNG)
    if project.status.value == 'processing':
        img_path = project.embroidery_file_url
    
    try:
        png_path = generate_preview_png(img_path, color_map=request.color_map)
        project.preview_png_url = png_path
        db.commit()
        return {"preview_png_url": png_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
