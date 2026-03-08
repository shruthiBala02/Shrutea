"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "../actions/subscribe";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    const res = await subscribeToNewsletter(email);
    
    if (res.error) {
      setStatus("error");
      setMessage(res.error);
    } else {
      setStatus("success");
      setMessage("Subscribed! ✨");
      setEmail("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <form onSubmit={handleSubscribe} className="subscribe-box">
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {message && (
        <p style={{ fontSize: "0.85rem", color: status === "error" ? "var(--feedback-error)" : "var(--feedback-success)", marginLeft: "0.5rem" }}>
          {message}
        </p>
      )}
    </div>
  );
}
