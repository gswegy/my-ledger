import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./storage"; // wires up window.storage before Ledger ever calls it
import Ledger from "./Ledger";
import Login from "./Login";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#1C1913",
          color: "#8B7355",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0.5rem 1rem",
          background: "#1C1913",
        }}
      >
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: "transparent",
            border: "1px solid #3A3527",
            color: "#8B7355",
            borderRadius: 8,
            padding: "0.35rem 0.75rem",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
      <Ledger />
    </div>
  );
}
