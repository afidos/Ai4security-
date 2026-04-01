# Adversarial AI - Technical Implementation

This document outlines the technical implementation of the "Adversarial AI" component for the LeaderGuard system.

## 📂 File Structure
- `mobile/android/AdversarialAI/ThreatDetectionService.kt`: Core background service for environmental monitoring.
- `mobile/android/AdversarialAI/CameraDetector.kt`: TFLite-based visual detection for cameras and drones.
- `mobile/android/AdversarialAI/CountermeasureManager.kt`: Manages the activation of jamming and countermeasures.
- `mobile/android/AdversarialAI/MicrophoneDetector.kt`: FFT-based audio analysis for hidden microphones.

## 📱 Android Implementation (Kotlin)

### 1. ThreatDetectionService
A `Foreground Service` that runs continuously to monitor the environment.
- **Key Feature**: Periodic checks (every 10s) to balance security and battery life.
- **Security**: Triggers immediate countermeasures upon threat detection.

### 2. CameraDetector (TFLite)
Uses a pre-trained `surveillance_detector.tflite` model to identify cameras and drones in camera frames.
- **Model**: MobileNet SSD or YOLOv5-tiny optimized for mobile.
- **Detection**: Identifies "CCTV", "DRONE", and "HIDDEN_CAMERA" with a confidence threshold (> 0.6).

### 3. CountermeasureManager
Implements physical and digital jamming techniques:
- **Visual Jamming**: High-frequency flash strobing and adversarial screen patterns.
- **Audio Jamming**: Ultrasonic noise (18-22 kHz) and white noise emission.
- **Haptic Jamming**: Random vibration patterns to interfere with gait analysis.

## 🌐 Integration with LeaderGuard

### 1. Early Warning Integration
When the system receives a high-priority alert from the server, the `Adversarial AI` component automatically activates the highest level of jamming.

### 2. Dynamic IP Integration
Upon local threat detection (e.g., a drone), the system triggers an immediate IP rotation via the `RoamingManager` to prevent network-based tracking.

## ⚙️ AndroidManifest.xml Configuration
Add the following permissions and service declaration:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<service
    android:name=".security.adversarial.ThreatDetectionService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="camera|microphone|location" />
```

## ⚠️ Legal Disclaimer
The Adversarial AI component is designed for personal protection and privacy enhancement. 
- **Jamming**: Some countermeasures (like frequency jamming) may be restricted or illegal in certain jurisdictions. 
- **Responsibility**: Users are responsible for ensuring compliance with local laws.
- **Configuration**: All countermeasures can be individually disabled in the application settings.
