# Dynamic Digital Roaming - Technical Implementation

This document outlines the technical implementation of the "Dynamic Digital Roaming" feature for the LeaderGuard system.

## 📂 File Structure
- `mobile/android/LeaderVpnService.kt`: Core VPN service for traffic routing.
- `mobile/android/RoamingManager.kt`: Intelligent scheduling and rotation logic.
- `server/proxy_manager.py`: FastAPI backend for dynamic proxy management.
- `proxies_config.json`: Global configuration for the roaming system.

## 📱 Android Implementation (Kotlin)

### 1. LeaderVpnService (`mobile/android/LeaderVpnService.kt`)
The `LeaderVpnService` extends Android's `VpnService` to create a local tunnel. It intercepts all device traffic and routes it through the selected proxy chain.
- **Key Feature**: Transparent routing without requiring root.
- **Security**: Prevents DNS leaks by forcing DNS through the tunnel.
- **Mechanism**: Intercepts IP packets at the TUN interface and encapsulates them for proxy/Tor delivery.

### 2. RoamingManager (`mobile/android/RoamingManager.kt`)
Handles the timing and logic for rotating IP addresses based on risk level.
- **Algorithm**: Uses a base interval (e.g., 60s) + random jitter (+/- 5s) to avoid temporal fingerprinting.
- **Risk-Based**: Automatically increases rotation frequency when `riskLevel > 80` or on Early Warning alerts.
- **Implementation**: Uses `AlarmManager` for precise, battery-efficient scheduling.

## 🌐 Backend Implementation (FastAPI)

### 1. Proxy Management API (`server/proxy_manager.py`)
The `/api/v1/proxies/dynamic` endpoint provides a fresh list of proxy nodes.
- **Selection**: Prioritizes nodes with low latency and high anonymity.
- **Security**: Requires a `device_id` and `api_key` for access.
- **Protocol Support**: Supports SOCKS5, HTTPS, and Tor exit nodes.

### 2. Audit Logging
Encrypted logs of roaming events are sent to `/api/v1/roaming/audit` for security monitoring.
- **Data**: Timestamps, rotation events, and encrypted metadata.

## ⚙️ Configuration (`proxies_config.json`)
Allows fine-tuning of the roaming behavior:
- `encryption_hopping`: Periodically changes the encryption algorithm used for the tunnel.
- `decoy_traffic_ratio`: Generates fake background traffic to mask real user activity patterns.
- `fingerprinting_obfuscation`: Randomizes User-Agent, language, and timezone headers to prevent device tracking.

## 🚀 Deployment Instructions

### Android
1. Add `LeaderVpnService` to your `AndroidManifest.xml`.
2. Request `BIND_VPN_SERVICE` permission.
3. Initialize `RoamingManager` in your main activity or background service.

### Server
1. Install dependencies: `pip install fastapi uvicorn`.
2. Run the server: `python server/proxy_manager.py`.
3. Configure the `api_key` in your environment variables.
