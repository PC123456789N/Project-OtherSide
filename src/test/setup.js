import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// O módulo real src/firebase/firebase.js chama initializeApp/getAnalytics/getAuth/getFirestore
// contra um projeto Firebase de verdade. Nos testes isso nunca deve tentar sair para a rede,
// então mockamos o módulo inteiro globalmente — os testes de DataDBHandler mockam
// "firebase/firestore" por cima disso para controlar cada chamada individualmente.
vi.mock("../firebase/firebase", () => ({
  app: {},
  auth: {},
  db: {},
}));
