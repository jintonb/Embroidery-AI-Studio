import cv2
import numpy as np
import pyembroidery
from shapely.geometry import Polygon
import os
import uuid

def _trace_pattern(image_path: str, color_map: dict = None):
    if color_map is None:
        color_map = {}

    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Could not read image from {image_path}")

    # Initialize pyembroidery pattern
    pattern = pyembroidery.EmbPattern()

    # Determine unique colors in the image (ignore alpha channel variations)
    if len(img.shape) == 3 and img.shape[2] == 4:
        b, g, r, a = cv2.split(img)
        bgr = cv2.merge((b, g, r))
        _, alpha_thresh = cv2.threshold(a, 128, 255, cv2.THRESH_BINARY)
    else:
        bgr = img
        alpha_thresh = np.full((img.shape[0], img.shape[1]), 255, dtype=np.uint8)
        
    pixels = bgr.reshape(-1, 3)
    unique_colors = np.unique(pixels, axis=0)
    
    stitch_data = []

    for color in unique_colors:
        b, g, r = color[0], color[1], color[2]
            
        original_hex = f"#{r:02x}{g:02x}{b:02x}"
        
        # Create a mask for this specific color
        lower = np.array(color, dtype="uint8")
        upper = np.array(color, dtype="uint8")
        color_mask = cv2.inRange(bgr, lower, upper)
        
        # Combine with alpha mask so we ignore transparent background pixels
        final_mask = cv2.bitwise_and(color_mask, color_mask, mask=alpha_thresh)
        
        if cv2.countNonZero(final_mask) == 0:
            continue
        
        # Use Canny on the mask to find edges of this specific color region
        edges = cv2.Canny(final_mask, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            continue
            
        # Add thread for this color
        thread = pyembroidery.EmbThread()
        target_hex = color_map.get(original_hex, original_hex)
        thread.set_hex_color(target_hex)
        pattern.add_thread(thread)

        total_points_for_this_color = 0

        for contour in contours:
            if len(contour) < 3:
                continue
                
            # Jump to the start of the contour
            x0, y0 = contour[0][0]
            pattern.add_stitch_absolute(pyembroidery.JUMP, x0 * 2, y0 * 2)
            
            # Stitch through the rest of the points
            for point in contour[1:]:
                x, y = point[0]
                pattern.add_stitch_absolute(pyembroidery.STITCH, x * 2, y * 2)
                total_points_for_this_color += 1
                
        stitch_data.append({
            "hex": original_hex,
            "mapped_hex": target_hex,
            "stitch_count": total_points_for_this_color
        })

    return pattern, stitch_data

def image_to_stitches(image_path: str, color_map: dict = None):
    pattern, stitch_data = _trace_pattern(image_path, color_map)

    # Create output directory if it doesn't exist
    export_dir = "exports"
    os.makedirs(export_dir, exist_ok=True)
    
    base_name = str(uuid.uuid4())
    pes_path = os.path.join(export_dir, f"{base_name}.pes")
    dst_path = os.path.join(export_dir, f"{base_name}.dst")
    jef_path = os.path.join(export_dir, f"{base_name}.jef")
    png_path = os.path.join(export_dir, f"{base_name}.png")
    zip_path = os.path.join(export_dir, f"{base_name}.zip")
    
    # Write files
    pyembroidery.write_pes(pattern, pes_path)
    pyembroidery.write_dst(pattern, dst_path)
    pyembroidery.write_jef(pattern, jef_path)
    pyembroidery.write_png(pattern, png_path)
    
    # Create a zip archive containing all formats
    import zipfile
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        zipf.write(pes_path, arcname=f"{base_name}.pes")
        zipf.write(dst_path, arcname=f"{base_name}.dst")
        zipf.write(jef_path, arcname=f"{base_name}.jef")
        
    return zip_path, png_path, stitch_data

def generate_preview_png(image_path: str, color_map: dict = None) -> str:
    pattern, _ = _trace_pattern(image_path, color_map)
    export_dir = "exports"
    os.makedirs(export_dir, exist_ok=True)
    base_name = str(uuid.uuid4())
    png_path = os.path.join(export_dir, f"{base_name}.png")
    pyembroidery.write_png(pattern, png_path)
    return png_path
