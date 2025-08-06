# Expo App

This is an Expo project created with create-expo-app.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Android Studio for Android emulation
- Expo Go app for mobile testing

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Create .env file in the project root and add the following lines:

   ```
   EXPO_PUBLIC_API_URL=http://localhost:8000
   EXPO_PUBLIC_API_URL_ALTERNATIVE=http://10.0.2.2:8000
   ```

3. Download and install Android Studio from https://developer.android.com/studio

4. Set up a Pixel 4a virtual device in Android Studio. Follow the Expo guide at https://docs.expo.dev/workflow/android-studio-emulator/

### Running the App

1. Start the development server

   ```bash
   npx expo start
   ```

2. In the terminal output, choose an option to run the app:
   - Development build
   - Android emulator
   - iOS simulator
   - Expo Go app
   - Web browser (press 'w' in the terminal)

3. For Expo Go, scan the QR code displayed in the terminal. For web development, press 'w' to open in a browser.

## Development

Edit files in the app directory to develop your project. This project uses file-based routing.

## Learn More

- Expo Documentation: https://docs.expo.dev/ for fundamentals and advanced guides
- Learn Expo Tutorial: https://docs.expo.dev/tutorial/introduction/ for a step-by-step project setup