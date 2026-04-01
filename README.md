# Leader Guard (Open Source)

## Overview
This project is an open-source prototype for a personal security assessment tool designed for high-profile individuals. It analyzes device state, communication patterns, and physical movement to provide a real-time risk dashboard.

**Note:** This is a web-based MVP simulating mobile functionality for demonstration and development purposes.

## Features
- **Device Analysis:** Scans installed apps and permissions (simulated).
- **Comms Security:** Monitors call logs for unknown or blacklisted numbers.
- **Movement Tracking:** Real-time location monitoring with anomaly detection.
- **Digital Footprint:** Notification monitoring for social engineering keywords.
- **Early Voice Warning:** Real-time audio/vibration alerts with a 15-minute evacuation countdown.
- **Dynamic Digital Roaming:** Multi-layer proxy and Tor routing to rotate IP addresses and prevent online tracking.
- **Risk Dashboard:** Visual risk level indicator (Low to Critical).
- **Panic Button:** Instant emergency broadcast.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Motion.
- **Backend:** Node.js (Express) - acting as the security intelligence API.
- **Configuration:** JSON-based modular config.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Configuration
Edit `public/config.json` to customize:
- `serverUrl`: Your backend endpoint.
- `mockMode`: Toggle between real data simulation and static testing.
- `keywords`: List of sensitive terms to monitor.
- `blacklistNumbers`: Known malicious origins.

## Open Source & Customization
This project is designed to be modular. You can replace the risk assessment logic in `server.ts` or add new modules in `App.tsx`.

### Mobile Implementation (Android/FastAPI)
For real-world deployment, refer to the `/docs/implementation` directory for:
- `AndroidAlertService.kt`: Foreground service for alert listening.
- `EmergencyActivity.kt`: Full-screen lock-screen overlay.
- `FastAPI_AlertTrigger.py`: Backend logic for FCM push notifications.
- `DynamicRoaming.md`: Technical guide for IP rotation, VpnService, and proxy chaining.

### Dynamic Digital Roaming Setup
1. **Android:** Implement `LeaderVpnService` using `VpnService` API.
2. **Tor:** Integrate `Orbot` or a custom Tor binary for onion routing.
3. **Server:** Deploy the FastAPI proxy manager to provide dynamic exit nodes.
4. **Legal:** Check local laws regarding anonymity tools (Tor/VPN) before deployment.

To configure FCM:
1. Create a project in Firebase Console.
2. Add an Android app and download `google-services.json`.
3. Add the FCM dependency in `build.gradle`: `implementation 'com.google.firebase:firebase-messaging-ktx:23.1.0'`.
4. Configure the server with the Firebase Admin SDK service account key.

## Disclaimer
This tool is for **educational and research purposes only**. It is not a substitute for professional security services. The authors are not responsible for any misuse or legal implications arising from the use of this software.

## License
MIT License
