# Music Therapy Mobile App

React Native mobile frontend for the Music Therapy System using Expo.

## Setup Requirements
- Node.js (v16+)
- Expo CLI (`npm install -g expo-cli`)
- For physical device: Expo Go app on your phone

## Quick Start
1. Navigate to directory: `cd mobile/MusicTherapyApp`
2. Install dependencies: `npm install`
3. Find your Mac's explicit internal IP address (e.g. 192.168.x.x) and replace localhost in `services/api.js`:
   `const API_BASE_URL = 'http://YOUR_IP:8080/api';`
4. Start the server: `npx expo start`
5. Scan QR Code!
