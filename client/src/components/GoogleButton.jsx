import { useEffect, useRef, useState } from "react";

// Renders Google's official "Sign in with Google" button if a real
// GOOGLE_CLIENT_ID has been configured on the server and the Google
// Identity Services script loads successfully. Otherwise shows a disabled
// state with a clear explanation instead of silently failing.
const GoogleButton = ({ onCredential, requirePhone, phoneValue }) => {
  const divRef = useRef(null);
  const [scriptError, setScriptError] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const existing = document.getElementById("google-identity-script");
    const init = () => {
      if (!window.google || !divRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential)
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: "filled_black",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill"
        });
      } catch {
        setScriptError(true);
      }
    };

    if (existing) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);
  }, [clientId, onCredential]);

  if (!clientId || scriptError) {
    return (
      <div className="w-full text-center">
        <button
          type="button"
          disabled
          className="btn-secondary w-full opacity-50 cursor-not-allowed"
          title="Google Sign-In is not configured yet"
        >
          Continue with Google
        </button>
        <p className="text-xs text-dim/70 mt-2">
          Google Sign-In is currently unavailable.
        </p>
      </div>
    );
  }

  if (requirePhone && !phoneValue) {
    return (
      <div className="w-full text-center">
        <button
          type="button"
          disabled
          className="btn-secondary w-full opacity-50 cursor-not-allowed"
        >
          Continue with Google
        </button>
        <p className="text-xs text-dim/70 mt-2">
          Enter your Ethiopian phone number above first, then continue with
          Google.
        </p>
      </div>
    );
  }

  return <div ref={divRef} className="flex justify-center w-full" />;
};

export default GoogleButton;
