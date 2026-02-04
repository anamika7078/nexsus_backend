const admin = require('firebase-admin');

// You should download your service account JSON from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
// Then set the path to it in your .env file
const path = require('path');
const fs = require('fs');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const absolutePath = serviceAccountPath ? path.resolve(process.cwd(), serviceAccountPath) : null;

if (absolutePath && fs.existsSync(absolutePath)) {
    try {
        if (!admin.apps.length) {
            const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized successfully');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error.message);
    }
} else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_PATH is missing or file not found. Social login verification will fail.');
}

const isFirebaseInitialized = () => admin.apps.length > 0;

const verifyFirebaseToken = async (idToken) => {
    if (!isFirebaseInitialized()) {
        throw new Error('Firebase Admin not initialized. Check your service account configuration.');
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        throw error;
    }
};

module.exports = {
    verifyFirebaseToken,
    isFirebaseInitialized,
    admin
};
