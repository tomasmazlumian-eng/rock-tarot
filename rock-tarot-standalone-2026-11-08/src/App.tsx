import React, { useState } from "react";
import { TAROT_DECK } from "./cardsData";

export default function App() {
  const [view, setView] = useState("landing");
  const [card, setCard] = useState(TAROT_DECK[0]);

  const drawCard = () => {
    const i = Math.floor(Math.random() * TAROT_DECK.length);
    setCard(TAROT_DECK[i]);
    setView("reveal");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070609", color: "#f5f5f4", padding: "20px", textAlign: "center", fontFamily: "Georgia, serif" }}>
      <header style={{ borderBottom: "1px solid #332", paddingmarginBottom: "30px" }}> "#fbbf24", margin: 0 }}>✦ ROCK TAROT ✦</h2>
        <small style={{}}>22 Major Arcana</small>view === "landing" ? (
        <div style={{ maxWidth: "500px", margin: "40px auto" }}>
          <h1 style={{ fontSize: "36px", color: "#fef08a" }}>DISCOVER YOUR ROCK SOUL</h1>
          <p style={{ fontStyle: "italic", color: "#d4af37", marginBottom: "30px" }}>
            Every soul has a song. Every journey has a card.
          </p>

          <div onClick={drawCard} style={{margin: "20px auto", width: "240px" }}><img
              src="https://storage.googleapis.com/producer-app-public/producer/754482a0-b7dd-42fe-acd3-58464b66e23f"
              alt="Card Back"
              style={{ width: "100%", borderRadius: "12px", border: "2px solid #d4af37", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}
            />
          </div>

          <button
            onClick={drawCard}
            style={{ marginTop: "20px", padding: "14px 28px", backgroundColor: "#d4af37", color: "#000", fontWeight: "bold", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", letterSpacing: "2px" }}
          >
            DISCOVER MY CARD
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "20px auto" }}>
          <h3 style={{ color: "#d4af37", margin: "5px 0" }}>CARD {card.romanNumber}</h3>
          <h1 style={{ fontSize: "36px", color: "#fff", margin: "5px 0" }}>{card.archetype}</h1>
          <h2 style={{ fontSize: "22px", color: "#f43f5e", margin: "5px 0 20px 0" }}>{card.artist}</h2>

          <div style={{ margin: "20px auto", width: "240px" }}>
            <img
              src={card.imageUrl || "https://storage.googleapis.com/producer-app-public/producer/754482a0-b7dd-42fe-acd3-58464b66e23f"}
              alt={card.archetype}
              style={{ width: "100%", borderRadius: "12px",solid #d4af37", boxShadow: "0 10px 30px rgba(212,175,55,0.3)" }}
            />
          </div>

          <div style={{ backgroundColor: "#14121a", border: "1px solid #443", borderRadius: "14px", padding: "20px", textAlign: "left", margin: "20px 0" }}>
            <p style={{ color: "#ddd", lineHeight: "1.6" }}>{card.archetypeExplanation}</p>
            <div style={{ background: "#000", borderLeft: "4px solid #d4af37", padding: "10px", margin: "14px 0" }}>
              <small style={{ color: "#d4af37",}}>YOUR MESSAGE:</small>: "4px 0", color: "#fff" }}>&ldquo;{card.cardMessage}&rdquo;</p>
            </div>
            <div style={{ background: "#200", border: "1px solid #722", padding: "10px", borderRadius: "8px" }}>
              <small style={{ color: "#f87171", fontWeight: "bold" }}>🤘 YOUR CHALLENGE:</small>
              <p style={{ margin: "4px 0", color: "#fecaca" }}>{card.challenge}</p>
            </div>
          </div>

          <div style={{ backgroundColor: "#1a0c14", border: "1px solid #e11d48", borderRadius: "14px",margin: "20px 0", display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}>
            <img
              src="https://storage.googleapis.com/producer-app-public/producer/ec5c5f33-88cf-4092-a088-32e0ff9dca42"
              alt="Coach"
              style={{ width: "70px", height: "70px",objectFit: "cover", border: "2px solid #d4af37" }}
            />
            <div>
              <h4 style={{ margin: "0 0 4px 0", color: "#fef08a" }}>DISCOVER THE POWER OF YOUR VOICE</h4>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#ccc" }}>Private 1-on-1 vocal coaching with Tomas Mazlumian.</p>
              <a
                href="https://www.lessonface.com/TomyMaz"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#f43f5e", fontWeight: "bold", fontSize: "12px", textDecoration: "underline" }}
              >
                Explore Singing Lessons on Lessonface &rarr;
              </a>
            </div>
          </div>

          <button
            onClick={drawCard}
            style={{ padding: "12px 24px", backgroundColor: "#e11d48", color: "#fff", fontWeight: "bold", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}
          >
            DRAW ANOTHER CARD
          </button>
        </div>
      )}

      <footer style={{ marginTop: "40px", bordersolid #332", paddingTop: "15px", color: "#666", fontSize: "12px" }}>
        ✦ ROCK TAROT • Transformative Rock Mythology • Music Freak
      </footer>
    </div>
  );
}
