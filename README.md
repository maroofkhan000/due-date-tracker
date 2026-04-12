# StudyTrack - Academic Progress Tracker

Welcome to **StudyTrack**! This premium web application helps you stay on top of your subjects, assignments, and quizzes with real-time data synchronization across all your devices.

## Features
- **Google Login**: Securely sync your data with your Google account.
- **Subject Management**: Add or remove subjects as your semester progresses.
- **Dynamic Tracking**: Two assignment slots, two quiz slots, and a lab quiz slot per subject.
- **Progress Visualization**: Automatic progress calculation for each subject.
- **Premium Design**: Modern dark glassmorphism interface with smooth animations.

## Next Steps: Firebase Setup
To make the application functional, you need to connect it to your Firebase project:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click "Add Project" and follow the steps.
2. **Add a Web App**:
   - In your project overview, click the **Web (</>)** icon.
   - Register your app and you will receive a `firebaseConfig` object.
3. **Configure the App**:
   - Open `src/firebase.js`.
   - Replace the placeholders (`YOUR_API_KEY`, etc.) with your actual configuration.
4. **Enable Services**:
   - **Authentication**: Go to "Authentication" > "Sign-in method" and enable **Google**.
   - **Firestore Database**: Go to "Firestore Database" and click "Create Database". Start in **test mode** for development.

## How to Run
Once dependencies are installed and Firebase is configured:
1. Open your terminal in the project directory.
2. Run `npm run dev`.
3. Open the provided local URL in your browser.

## Project Structure
- `src/index.css`: The core design system and utility classes.
- `src/App.jsx`: The main application logic and UI components.
- `src/firebase.js`: Connection bridge between your app and Google Firebase.
