from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import firebase_admin
from firebase_admin import messaging, credentials
import os

app = FastAPI()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

class AlertRequest(BaseModel):
    user_id: str
    risk_level: str
    message: str
    time_to_evacuate_minutes: int

@app.post("/api/alert/trigger")
async function trigger_alert(request: AlertRequest):
    # 1. Fetch user's FCM token from database
    fcm_token = get_user_fcm_token(request.user_id)
    if not fcm_token:
        raise HTTPException(status_code=404, detail="User FCM token not found")

    # 2. Construct FCM message
    message = messaging.Message(
        notification=messaging.Notification(
            title=f"Leader Guard: {request.risk_level} ALERT",
            body=request.message,
        ),
        data={
            "alert_level": request.risk_level,
            "evacuation_time": str(request.time_to_evacuate_minutes),
            "message": request.message,
        },
        token=fcm_token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                sound='default',
                click_action='OPEN_EMERGENCY_ACTIVITY'
            ),
        ),
    )

    # 3. Send message
    try:
        response = messaging.send(message)
        # Log to DB
        log_alert_event(request.user_id, request.risk_level, "SENT")
        return {"status": "success", "message_id": response}
    except Exception as e:
        log_alert_event(request.user_id, request.risk_level, "FAILED")
        raise HTTPException(status_code=500, detail=str(e))

def get_user_fcm_token(user_id: str):
    # Mock DB call
    return "MOCK_FCM_TOKEN_FROM_DB"

def log_alert_event(user_id, level, status):
    # Mock DB log
    print(f"Alert for {user_id} - Level: {level} - Status: {status}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
