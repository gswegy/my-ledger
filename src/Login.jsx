import { useState } from "react";
import { supabase } from "./supabaseClient";

const page = {
  minHeight: "100vh",
  background: "#1C1913",
  color: "#F3EEE3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  fontFamily: "Georgia, serif",
};

const card = {
  width: "100%",
  maxWidth: 360,
  background: "#232019",
  border: "1px solid #3A3527",
  borderRadius: 14,
  padding: "1.5rem",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  background: "#1C1913",
  border: "1px solid #3A3527",
  borderRadius: 8,
  padding: "0.7rem 0.85rem",
  color: "#F3EEE3",
  fontSize: 15,
  marginBottom: 10,
  outline: "none",
};

const button = {
  width: "100%",
  background: "#C9A227",
  color: "#1C1913",
  border: "none",
  borderRadius: 8,
  padding: "0.75rem",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message || "Couldn't sign in. Check your email and password.");
  }

  return (
    <div style={page}>
      <form style={card} onSubmit={handleSubmit}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>ledger</div>
        <div style={{ fontSize: 13, color: "#8B7355", marginBottom: 18 }}>Sign in to continue</div>
        <input
          style={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          required
        />
        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: "#D4756B", fontSize: 13, marginBottom: 10 }}>{error}</div>}
        <button style={{ ...button, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
