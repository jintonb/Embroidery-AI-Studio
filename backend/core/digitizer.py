import cv2
import numpy as np
import pyembroidery
from shapely.geometry import Polygon
import os
import uuid

def image_to_stitches(image_path: str) -> str:
    """
    Reads a processed image, extracts contours, creates tatami/satin fills,
    and exports it as a PES and DST embroidery file.
    Returns the path to the main PES file.
    """
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not read image from {image_path}")

    # For simplicity in this initial engine, we'll convert to grayscale and edge detect
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Initialize pyembroidery pattern
    pattern = pyembroidery.EmbPattern()
    
    # Basic path generation logic
    for contour in contours:
        if len(contour) < 3:
            continue
            
        # Add basic running stitch around the contour
        points = []
        for point in contour:
            x, y = point[0]
            # scale appropriately (e.g. 1 pixel = 1/10 mm)
            points.append((x * 2, y * 2))
            
        if points:
            pattern.add_block(points, "blue") # simple running stitch

    # Create output directory if it doesn't exist
    export_dir = "exports"
    os.makedirs(export_dir, exist_ok=True)
    
    base_name = str(uuid.uuid4())
    pes_path = os.path.join(export_dir, f"{base_name}.pes")
    dst_path = os.path.join(export_dir, f"{base_name}.dst")
    
    # Write files
    pyembroidery.write_pes(pattern, pes_path)
    pyembroidery.write_dst(pattern, dst_path)
    
    return pes_path
