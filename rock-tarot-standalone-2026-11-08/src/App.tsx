import React, { useState } from "react";
import { TAROT_DECK } from "./cardsData";
import { CardArtwork, CardBack } from "./cardArt";
import {
  toggleAmbientSound,
  playShuffleSound,
  playRevealChime
} from "./audioEffects";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "reveal">("landing");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedCard, setSelectedCard] = useState(TAROT_DECK[0]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shareText, setShareText] = useState("");

  const lessonsUrl = "https://www.lessonface.com/TomyMaz";

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    toggleAmbientSound(next);
  };

  const handleDrawCard = () => {
    setIsShuffling(true);
    if (soundEnabled) playShuffleSound();

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
      const chosen = TAROT_DECK[randomIndex];
      setSelectedCard(chosen);
      setIsShuffling(false);
      setCurrentView("reveal");
      if (soundEnabled) playRevealChime();
    }, 1200);
  };

  const handleShare = async () => {
    const text = `✦ ROCK TAROT ✦ I drew ${selectedCard.romanNumber} — ${selectedCard.archetype} (${selectedCard.artist})!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Rock Tarot", text: text, url: window.location.href });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(text);
    setShareText("Copied to clipboard!");
    setTimeout(() => setShareText(""), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#070609] text-stone-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="w-full border-b border-amber-900/30 bg-[#09080d]/80 px-4 py-3 flex items-center justify-between">
        <div onClick={() => setCurrentView("landing")} className="flex items-center gap-2 cursor-pointer">
          <span className="font-serif font-bold text-amber-400">✦</span>
          <span className="font-serif font-bold text-amber-200 tracking-wider">ROCK TAROT</span>
        </div>
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg border border-stone-800 text-stone-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto text-center">
        {currentView === "landing" ? (
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-amber-100 mb-4">
              DISCOVER YOUR ROCK SOUL
            </h1>
            <p className="font-serif text-lg text-amber-200/90 italic mb-8 max-w-xl">
              &ldquo;Every soul has a song. Every journey has a card.&rdquo;
            </p>

            <div onClick={handleDrawCard} className="cursor-pointer my-4 hover:scale-105 transition-transform">
              <CardBack size="lg" />
            </div>

            <button
              onClick={handleDrawCard}
              disabled={isShuffling}
              className="mt-8 px-8 py-3.5 rounded-xl font-serif text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {isShuffling ? "AWAKENING THE VOID..." : "DISCOVER MY CARD"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="font-serif text-xl text-amber-400 font-bold mb-1">
              CARD {selectedCard.romanNumber}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-amber-100 uppercase mb-1">
              {selectedCard.archetype}
            </h2>
            <p className="font-serif text-xl text-red-400 font-bold mb-6">
              {selectedCard.artist}
            </p>

            <div className="my-2">
              <CardArtwork card={selectedCard} size="lg" />
            </div>

            {/* Reading Card */}
            <div className="w-full max-w-xl bg-[#110f18] border border-amber-500/40 rounded-2xl p-6 text-left my-6 shadow-xl">
              <p className="font-serif text-base text-stone-200 mb-4 leading-relaxed">
                {selectedCard.archetypeExplanation}
              </p>
              <div className="bg-black/50 border-l-4 border-amber-400 p-3 rounded-r-lg mb-4">
                <span className="text-xs uppercase font-bold text-amber-400 block mb-1">Your message:</span>
                <p className="font-serif text-base text-white italic">&ldquo;{selectedCard.cardMessage}&rdquo;</p>
              </div>
              <div className="bg-red-950/30 border border-red-800/40 p-3 rounded-lg">
                <span className="text-xs uppercase font-bold text-red-400 block mb-1">🤘 Your challenge:</span>
                <p className="font-serif text-sm text-stone-200">{selectedCard.challenge}</p>
              </div>
            </div>

            {/* Vocal Coach Card */}
            <div className="w-full max-w-xl bg-[#1a0c14] border border-rose-500/40 rounded-2xl p-5 my-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src="https://storage.googleapis.com/producer-app-public/producer/ec5c5f33-88cf-4092-a088-32e0ff9dca42"
                alt="Vocal Coach"
                className="w-20 h-20 rounded-xl object-cover border border-amber-400"
              />
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-amber-200">
                  DISCOVER THE POWER OF YOUR VOICE
                </h3>
                <p className="text-xs text-stone-300 my-1">
                  Private 1-on-1 vocal coaching with Tomas Mazlumian.
                </p>
                <a
                  href={lessonsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 underline font-bold mt-1"
                >
                  <span>Explore Singing Lessons on Lessonface</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                onClick={handleDrawCard}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>DRAW ANOTHER CARD</span>
              </button>

              <button
                onClick={handleShare}
                className="px-5 py-3 rounded-xl bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE MY CARD</span>
              </button>
            </div>
            {shareText && <p className="text-xs text-amber-300 mt-2">{shareText}</p>}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-900/30 bg-[#09080d] py-4 text-center text-xs font-serif text-stone-500">
        ✦ ROCK TAROT • Transformative Rock Mythology • Music Freak
      </footer>
    </div>
  );
}
