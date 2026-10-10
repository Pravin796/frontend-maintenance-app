# Residency Maintenance App (Frontend)

Phase 1 of the mobile application for Residency Maintenance. Built with Expo, React Native, and NativeWind v4.

## Requirements

- Node.js
- Expo CLI
- Android Emulator or physical device with Expo Go

## Installation

```bash
npm install
```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

Press `a` to open on an Android emulator, or scan the QR code with the Expo Go app on a physical device.

## Configuration

The app connects to a Spring Boot backend. You must configure the API URL in a `.env` file.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `EXPO_PUBLIC_API_URL` variable in `.env`.

### Important Notes on the Backend URL

For the mobile app to successfully communicate with your backend, the URL must be reachable from the device running the app.

- **Do NOT use `localhost` or `127.0.0.1`**: On an Android emulator or a physical phone, `localhost` refers to the device itself, not your computer running the backend.
- **For Android Emulator**: Use `http://10.0.2.2:<port>` (e.g., `http://10.0.2.2:8080/api`).
- **For Physical Devices**: Use your computer's local IP address on the Wi-Fi network (e.g., `http://192.168.1.100:8080/api`). Both the computer and phone must be on the same network.
