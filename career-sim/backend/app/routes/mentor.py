from fastapi import WebSocket, APIRouter
from app.core.gemini import ask_gemini
from app.core.context import get_context
import asyncio

router = APIRouter()

@router.websocket("/mentor")
async def mentor(ws: WebSocket):
    await ws.accept()
    while True:
        try:
            msg = await ws.receive_text()
            context = get_context()
            reply = ask_gemini(msg, context)
            
            # Streaming effect
            for word in reply.split(" "):
                await ws.send_text(word + " ")
                await asyncio.sleep(0.02)
        except Exception as e:
            # Handle potential disconnections or errors
            print(f"WebSocket error: {e}")
            break
