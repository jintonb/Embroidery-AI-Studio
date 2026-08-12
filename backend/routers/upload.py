from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.project import Project, ProjectStatus
from api.deps import get_current_user
from core.ai_processor import process_image_pipeline
import os
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

# Directory to save uploaded and processed images temporarily (in production use S3)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{project_id}")
async def upload_image(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify project belongs to user
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Read image
    try:
        contents = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read file")

    # Update project status
    project.status = ProjectStatus.PROCESSING
    db.commit()

    try:
        # Save original (simplified approach)
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        original_path = os.path.join(UPLOAD_DIR, f"original_{unique_filename}")
        
        with open(original_path, "wb") as f:
            f.write(contents)
            
        project.original_image_url = original_path

        # Run AI Pipeline (Background removal + OpenCV processing)
        processed_bytes, palette = process_image_pipeline(contents)
        
        # Save processed image
        processed_path = os.path.join(UPLOAD_DIR, f"processed_{uuid.uuid4()}.png")
        with open(processed_path, "wb") as f:
            f.write(processed_bytes)

        # Update project with image url and extracted colors
        project.embroidery_file_url = processed_path
        project.original_palette = palette
        project.mapped_palette = palette
        
        # We leave status as processing or set to completed depending on if digitization happens here
        # For Phase 4, let's keep it processing, ready for Phase 5.
        db.commit()
        
        return {"message": "File uploaded and AI preprocessing complete", "processed_path": processed_path}

    except Exception as e:
        project.status = ProjectStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
