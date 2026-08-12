import cv2
import numpy as np
from rembg import remove
from PIL import Image
import io

def remove_background(image_bytes: bytes) -> bytes:
    """Removes the background from the image using rembg."""
    # rembg expects bytes and returns bytes
    output_bytes = remove(image_bytes)
    return output_bytes

def preprocess_for_vectorization(image_bytes: bytes) -> bytes:
    """
    Applies OpenCV filters to clean up the image:
    1. Denoising
    2. Color quantization
    3. Edge enhancement
    Returns the processed image as bytes (PNG format).
    """
    # Convert bytes to numpy array for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

    if img is None:
        raise ValueError("Could not decode image bytes")

    # If the image has an alpha channel (from rembg), separate it
    alpha_channel = None
    if img.shape[2] == 4:
        b, g, r, alpha_channel = cv2.split(img)
        img = cv2.merge((b, g, r))
        
    # 1. Denoising (FastNlMeansDenoisingColored works well for photos/art)
    denoised = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    # 2. Color Quantization (K-Means) to reduce colors for embroidery
    Z = denoised.reshape((-1, 3))
    Z = np.float32(Z)
    
    # Define criteria and apply kmeans (reduce to 8 colors)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    K = 8
    ret, label, center = cv2.kmeans(Z, K, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    center = np.uint8(center)
    
    # Extract the color palette as HEX strings
    palette = []
    for b, g, r in center:
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        if hex_color not in palette:
            palette.append(hex_color)

    res = center[label.flatten()]
    quantized = res.reshape((denoised.shape))

    # Re-attach alpha channel if it existed
    if alpha_channel is not None:
        b, g, r = cv2.split(quantized)
        final_img = cv2.merge((b, g, r, alpha_channel))
    else:
        final_img = quantized

    # Encode back to PNG bytes
    success, encoded_img = cv2.imencode('.png', final_img)
    if not success:
        raise ValueError("Could not encode processed image")
        
    return encoded_img.tobytes(), palette

def process_image_pipeline(image_bytes: bytes):
    """Runs the full AI preprocessing pipeline."""
    no_bg = remove_background(image_bytes)
    processed_bytes, palette = preprocess_for_vectorization(no_bg)
    return processed_bytes, palette
