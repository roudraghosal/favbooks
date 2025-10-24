"""
Image proxy router to handle external book covers
Solves CORS and mixed content (http/https) issues
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx
from urllib.parse import unquote

router = APIRouter()


@router.get("/cover")
async def proxy_book_cover(url: str):
    """
    Proxy endpoint for book cover images
    Fixes CORS and mixed content issues with external image sources
    
    Usage: /api/images/cover?url=http://books.google.com/...
    """
    try:
        # Decode URL if it's encoded
        decoded_url = unquote(url)
        
        # Convert http to https for Google Books
        if decoded_url.startswith('http://books.google.com'):
            decoded_url = decoded_url.replace('http://', 'https://')
        
        # Validate URL
        if not decoded_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Invalid image URL")
        
        # Fetch image from external source with headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.google.com/',
        }
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(decoded_url, headers=headers)
            
            if response.status_code != 200:
                # If Google Books fails, try OpenLibrary as fallback
                raise HTTPException(
                    status_code=404,
                    detail="Image not found or unavailable"
                )
            
            # Return image with appropriate content type
            content_type = response.headers.get('content-type', 'image/jpeg')
            
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
                    "Access-Control-Allow-Origin": "*",
                }
            )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Image source timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching image: {str(e)}")


@router.get("/placeholder")
async def get_placeholder_image(
    width: int = 200,
    height: int = 300,
    text: str = "No Cover"
):
    """
    Generate a placeholder image for books without covers
    Returns a simple SVG placeholder
    """
    svg_content = f'''
    <svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <g>
            <rect x="20%" y="30%" width="60%" height="5%" fill="#6B7280" rx="2"/>
            <rect x="20%" y="40%" width="60%" height="5%" fill="#6B7280" rx="2"/>
            <rect x="20%" y="50%" width="40%" height="5%" fill="#6B7280" rx="2"/>
        </g>
        <text 
            x="50%" 
            y="70%" 
            font-family="Arial, sans-serif" 
            font-size="14" 
            fill="#9CA3AF" 
            text-anchor="middle"
        >{text}</text>
    </svg>
    '''
    
    return Response(
        content=svg_content,
        media_type="image/svg+xml",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        }
    )
