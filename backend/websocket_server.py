from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"✅ User {user_id} connected. Total connections: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_subscription_update(self, user_id: str, subscriptions: List[str], version: int = None):
        """Отправка обновления подписки конкретному пользователю с версией"""
        if user_id in self.active_connections:
            message = json.dumps({
                "type": "subscription_update",
                "subscriptions": subscriptions,
                "version": version,  # Новая версия подписок
                "timestamp": datetime.utcnow().isoformat()
            })
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                    print(f"📤 Sent update to user {user_id}: {subscriptions} (version: {version})")
                except:
                    pass

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Обработка входящих сообщений если нужно
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)

@app.post("/notify-subscription-update")
async def notify_subscription_update(data: dict):
    """Endpoint для уведомления об обновлении подписки"""
    user_id = data.get('user_id')
    subscriptions = data.get('subscriptions', [])
    version = data.get('version')  # Новая версия подписок
    
    if user_id:
        await manager.send_subscription_update(str(user_id), subscriptions, version)
        print(f"📤 WebSocket notification sent to user {user_id}: {subscriptions} (version: {version})")
        return {"status": "success", "message": f"Notification sent to user {user_id}"}
    
    return {"status": "error", "message": "user_id is required"}


@app.get("/health")
async def health_check():
    """Проверка работоспособности WebSocket сервера"""
    return {
        "status": "success", 
        "message": "WebSocket server is running",
        "active_connections": len(manager.active_connections),
        "total_connections": sum(len(conns) for conns in manager.active_connections.values())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)





