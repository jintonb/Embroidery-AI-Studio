from fastapi import APIRouter, Query
from typing import Optional
from core.thread_library import search_threads, find_nearest_thread, get_all_brands

router = APIRouter(prefix="/threads", tags=["threads"])

@router.get("/brands")
def list_brands():
    return get_all_brands()

@router.get("/")
def search(brand: Optional[str] = None, q: Optional[str] = Query(None)):
    return search_threads(brand=brand, query=q)

@router.get("/nearest")
def nearest(hex: str, brand: Optional[str] = None, count: int = 5):
    hex_clean = hex if hex.startswith('#') else '#' + hex
    return find_nearest_thread(hex_clean, brand=brand, count=count)
