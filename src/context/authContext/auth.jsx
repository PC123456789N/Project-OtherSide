import {auth} from "../../firebase/firebase";

import { onAuthStateChanged } from "firebase/auth";

import { serverTimestamp } from "firebase/firestore";
import { provisionUserDocs } from "../../services/DataDBHandler";

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
            // provisionUserDocs cria o doc Users/{uid} + os 5 docs de jogo
            // (Initiatives, Combats, Monsters, Scripts, Musics) atomicamente,
            // dentro de uma transação — só na primeira vez que esse uid loga.
            // Se dois dispositivos logarem "ao mesmo tempo" com uma conta
            // nova, a transação garante que só um deles cria os documentos
            // (o Firestore detecta o conflito e reexecuta automaticamente a
            // transação perdedora, que então vê o doc já existente e não
            // recria nada).
            const result = await provisionUserDocs(currentUser.uid, {
                CreatedAt: serverTimestamp(),
                Name: currentUser?.displayName || currentUser?.email.split("@")[0],
                Email: currentUser?.email || "",
                UserId: currentUser?.uid,
            });

            console.log(result.created ? "Usuário criado" : "Usuário já existe"); //remove post production
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