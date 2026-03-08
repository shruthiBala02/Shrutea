"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithCode } from "./actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      setLoading(true);
      setError(null);
      const res = await loginWithCode(code);
      setLoading(false);
      
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/studio');
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "var(--space-2xl)" }}>
      <div className="card" style={{ padding: "var(--space-xl)", textAlign: "center" }}>
        
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Admin Access</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Enter the secret code to access the Studio.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input 
            type="password" 
            placeholder="Secret Code" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required 
          />
          {error && <p style={{ color: "var(--feedback-error)", fontSize: "0.85rem" }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Verifying..." : "Enter Studio"}
          </button>
        </form>
        
      </div>
    </div>
  );
}
