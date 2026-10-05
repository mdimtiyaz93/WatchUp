import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";

const PUBLISABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in client environment");
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={PUBLISABLE_KEY}
    signInUrl="/login"
    signUpUrl="/register"
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/dashboard"
    afterSignOutUrl="/login"
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
