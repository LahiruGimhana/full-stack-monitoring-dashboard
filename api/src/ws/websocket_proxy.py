# websocket_proxy.py
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
import websockets

async def websocket_proxy(ip, port, endpoint, ws: WebSocket):
    try:
        async with websockets.connect(f"ws://{ip}:{port}/app/{endpoint}") as remote_ws:
            await ws.accept()
            while True:
                response = await remote_ws.recv()
                print(f"Received response from server: {response}")
                await ws.send_text(f"{endpoint}: {response}")
                if ws.client_state.name != "CONNECTED":
                        break
                # message = await ws.receive_text()
                # await remote_ws.send(message)
                # response = await remote_ws.recv()
                # await ws.send_text(f"{endpoint}: {response}")
    except websockets.exceptions.ConnectionClosedOK:
        pass
    except WebSocketDisconnect as e:
        # Handle WebSocket disconnect gracefully
        print(f"WebSocket disconnected with code {e.code}.")
