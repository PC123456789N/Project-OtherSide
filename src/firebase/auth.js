
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";


export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await doSignInWithGoogle(auth, provider);
    //result.user
    return result;
};

export const doSignOut = () => {
    return auth.signOut();
};

export const doPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
    return updatePassword(auth.currentUser, password);
};

