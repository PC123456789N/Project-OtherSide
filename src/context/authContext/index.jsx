import {auth} from "../../firebase/firebase";
import { db } from "../../firebase/firebase";

import { onAuthStateChanged } from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import React, { useContext, useEffect, useState} from "react";


const AuthContext = React.createContext();

export function useAuth(){
    return useContext(AuthContext);
};

export function AuthProvider({ children }){
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user){
        if(user){
            setCurrentUser({ ...user });
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null)
            setUserLoggedIn(false)
        }
        setLoading(false)
    };

    useEffect(() => {
        if (!currentUser) return;

        const checkUser = async () => {
            const userRef = doc(db, "Users", currentUser?.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // 🟢 cria usuário
                await setDoc(userRef, {
                    CreatedAt: serverTimestamp(),
                    Name: currentUser?.displayName  || currentUser?.email.split("@")[0],
                    Email: currentUser?.email  || "",
                    UserId: currentUser?.uid,
                });

            console.log("Usuário criado");
            } else {
            console.log("Usuário já existe");
            }
        };

        checkUser();
    }, [currentUser]);

    const value = {
        currentUser,
        userLoggedIn,
        loading,
        userId: currentUser?.uid,
        userName: currentUser?.displayName  || currentUser?.email.split("@")[0]
    };

    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}