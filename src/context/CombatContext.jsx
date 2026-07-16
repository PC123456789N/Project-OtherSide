import { createContext, useContext, useState } from "react";

const CombatContext = createContext();

export function CombatProvider({ children }) {

    const [combatId, setCombatId] = useState(null);

    return (
        <CombatContext.Provider
            value={{
                combatId,
                setCombatId
            }}
        >
            {children}
        </CombatContext.Provider>
    );
}

export function useCombat() {
    return useContext(CombatContext);
}