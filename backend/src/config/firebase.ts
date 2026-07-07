import { initializeApp, cert, applicationDefault, App } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectId = process.env.FIREBASE_PROJECT_ID;

try {
  if (serviceAccountJson) {
    console.log('[Firebase] Initializing using service account JSON from environment...');
    const serviceAccount = JSON.parse(serviceAccountJson);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId || serviceAccount.project_id,
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(`[Firebase] Initializing using GOOGLE_APPLICATION_CREDENTIALS file path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    app = initializeApp({
      credential: applicationDefault(),
      projectId: projectId,
    });
  } else if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log('[Firebase] Initializing using local Firebase Emulators...');
    app = initializeApp({
      projectId: projectId || 'dev-quizverse-project',
    });
  } else {
    console.warn('[Firebase] Warning: No Firebase credentials specified in environment. Attempting default initialization...');
    app = initializeApp({
      projectId: projectId,
    });
  }
  console.log('[Firebase] Admin SDK initialized successfully.');
} catch (error) {
  console.error('[Firebase] Error initializing Firebase Admin SDK:', error);
  console.log('[Firebase] Please configure environment variables in backend/.env to connect to your project.');
  
  // Create a dummy app in development to prevent server boot failure
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Firebase] Falling back to dummy initialization for local development...');
    app = initializeApp({
      projectId: 'dummy-dev-project',
    }, 'dummy-app');
  } else {
    throw error;
  }
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };
