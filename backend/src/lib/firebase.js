import admin from 'firebase-admin';

// Initialize Firebase Admin SDK with minimal config
let firebaseApp;

export const initializeFirebase = () => {
  if (!firebaseApp) {
    try {
      // Simple initialization using environment variables
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error.message);
    }
  }
  return firebaseApp;
};

// Verify Firebase ID token (basic implementation)
export const verifyFirebaseToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      initializeFirebase();
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};
