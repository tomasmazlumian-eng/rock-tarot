import React, { useState, useEffect, useRef } from "react";
import { TarotCard, UserRegistration, Submission } from "./types";
import { TAROT_DECK } from "./cardsData";
import { CardArtwork, CardBack } from "./cardArt";
import {
  toggleAmbientSound,
  playShuffleSound,
  playCardFlipSound,
  playRevealChime
} from "./audioEffects";
import {
  getSubmissions,
  processSubmissionEmails,
  fetchCloudSubmissions,
  exportSubmissionsToCSV,
  OWNER_EMAIL
} from "./emailService";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  RefreshCw,
  Download,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Award,
  ExternalLink,
  Copy
} from "lucide-react";

type ViewState = "landing" | "shuffle" | "reveal" | "admin";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [user, setUser] = useState<UserRegistration | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  // Selected card & reveal state
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Shuffle animation sequence state
  const [shuffleStep, setShuffleStep] = useState<number>(1);

  // Feedback & share
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isCardZoomed, setIsCardZoomed] = useState(false);

  // Daily limit countdown state
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  // Submissions state
  const [submissionsList, setSubmissionsList] = useState<Submission[]>(() => getSubmissions());
  const [adminSearch, setAdminSearch] = useState("");

  // Creator Console State
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminLockModal, setShowAdminLockModal] = useState(false);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState("");
  const [adminPasscodeError, setAdminPasscodeError] = useState<string | null>(null);

  const DAILY_CARD_LIMIT = 3;
  const lessonsUrl = "https://www.lessonface.com/TomyMaz";
  const creatorCode = "2020";

  // Touch swipe handling to slide between daily cards
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const goToNextTodayCard = () => {
    if (!user || !selectedCard) return;
    const status = checkDailyDrawStatus(user.email);
    if (status.cardIds.length <= 1) return;
    let nextIdx = status.cardIds.indexOf(selectedCard.id) + 1;
    if (nextIdx >= status.cardIds.length) nextIdx = 0;
    const found = TAROT_DECK.find((c) => c.id === status.cardIds[nextIdx]);
    if (found) {
      setSelectedCard(found);
      if (soundEnabled) playCardFlipSound();
    }
  };

  const goToPrevTodayCard = () => {
    if (!user || !selectedCard) return;
    const status = checkDailyDrawStatus(user.email);
    if (status.cardIds.length <= 1) return;
    let prevIdx = status.cardIds.indexOf(selectedCard.id) - 1;
    if (prevIdx < 0) prevIdx = status.cardIds.length - 1;
    const found = TAROT_DECK.find((c) => c.id === status.cardIds[prevIdx]);
    if (found) {
      setSelectedCard(found);
      if (soundEnabled) playCardFlipSound();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        goToNextTodayCard();
      } else {
        goToPrevTodayCard();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== "reveal") return;
      if (e.key === "ArrowLeft") goToPrevTodayCard();
      if (e.key === "ArrowRight") goToNextTodayCard();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, user, selectedCard]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDailyDrawForEmail = (email: string) => {
    try {
      const key = `rock_tarot_daily_${email.toLowerCase().trim()}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      const parsed = JSON.parse(data);
      const today = new Date().toISOString().split("T")[0];
      if (parsed.date !== today) return null;
      const cardIds: string[] = Array.isArray(parsed.cardIds)
        ? parsed.cardIds
        : parsed.cardId
        ? [parsed.cardId]
        : [];
      return { cardIds, date: parsed.date };
    } catch {
      return null;
    }
  };

  const recordDailyDrawForEmail = (email: string, cardId: string) => {
    try {
       const recordDailyDrawForEmail = (email: string,=> {Key = "rock_tarot_daily_" + cleanEmail;
      const todayStr = new Date().toISOString().split("T")[0];
      const existing = getDailyDrawForEmail(email);
      const list = existing ? existing.cardIds : [];
      list.push(cardId);
      const payload = {date: todayStr };));
    } catch (e) {
      // ignore
    }
  };
  const checkDailyDrawStatus = (email: string) => {
    const record = getDailyDrawForEmail(email);
    if (!record) {
      return { canDraw: true, count: 0, remaining: DAILY_CARD_LIMIT, cardIds: [] };
    }
    const count = record.cardIds.length;
    return {
      canDraw: count < DAILY_CARD_LIMIT,
      count,
      remaining: Math.max(0, DAILY_CARD_LIMIT - count),
      cardIds: record.cardIds
    };
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("rock_tarot_current_user");
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedCardId = localStorage.getItem("rock_tarot_claimed_card_id");
      if (savedCardId) {
        const found = TAROT_DECK.find((c) => c.id === savedCardId);
        if (found) setSelectedCard(found);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    toggleAmbientSound(next);
  };

  const handleSwitchSeeker = () => {
    try {
      localStorage.removeItem("rock_tarot_current_user");
      localStorage.removeItem("rock_tarot_claimed_card_id");
    } catch {
      // ignore
    }
    setUser(null);
    setSelectedCard(null);
    setCardFlipped(false);
    setCurrentView("landing");
  };

  const syncDailyDrawsFromCloud = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) return { count: 0, canDraw: true, cardIds: [] };

    try {
      const cloud = await fetchCloudSubmissions();
      if (!cloud || cloud.length === 0) {
        const local = checkDailyDrawStatus(normalizedEmail);
        return { count: local.count, cancardIds: local.cardIds }; Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      const cloudCardIds: string[] = [];

      cloud.forEach((entry, idx) => {
        if (!entry.email) return;
        if (entry.email.toLowerCase().trim() === normalizedEmail) {
          let isEntryToday = false;
          if (!entry.submissionDate) {
            isEntryToday = true;
          } else {
            const parsed = new Date(entry.submissionDate);
            if (!isNaN(parsed.getTime())) {
              const sameDay =
                parsed.getFullYear() === currentYear &&
                parsed.getMonth() === currentMonth &&
                parsed.getDate() === currentDate;
              const withinHours = Math.abs(now.getTime() - parsed.getTime()) < 24 * 60 * 60 * 1000;
              isEntryToday = sameDay || withinHours;
            } else {
              const str = String(entry.submissionDate);
              isEntryToday = str.includes(String(currentYear)) || str.includes(String(currentDate));
            }
          }

          if (isEntryToday) {
            const target = (entry.archetype || "").toLowerCase().trim();
            const match = TAROT_DECK.find(
              (c) =>
                c.archetype.toLowerCase() === target ||
                `${c.romanNumber} - ${c.archetype}`.toLowerCase() === target ||
                target.includes(c.archetype.toLowerCase())
            );
            const cardIdToAdd = match ? match.id : (TAROT_DECK[idx % TAROT_DECK.length]?.id || `claimed-${idx}`);
            if (!cloudCardIds.includes(cardIdToAdd)) {
              cloudCardIds.push(cardIdToAdd);
            }
          }
        }
      });

      if (cloudCardIds.length > 0) {
        const local = getDailyDrawForEmail(normalizedEmail);
        const existingIds = local ? local.cardIds : [];
        const mergedIds = Array.from(new Set([...existingIds, ...cloudCardIds]));
        const todayStr = new Date().toISOString().split("T")[0];
        const key = `rock_tarot_daily_${normalizedEmail}`;
        localStorage.setItem(
          key,
          JSON.stringify({ carddate: todayStr, timestamp: Date.now() }) = mergedIds.length;
        return { count, canDraw: count < DAILY_CARD_LIMIT, card}; error", err);
    }

    const localStatus = checkDailyDrawStatus(normalizedEmail);
    return { count: localStatus.count, canDraw: localStatus.canDraw, cardIds: localStatus.cardIds };
  };

  const handleStartDiscovery = async () => {
    if (!user) {
      setShowRegModal(true);
    } else {
      await syncDailyDrawsFromCloud(user.email);
      const status = checkDailyDrawStatus(user.email);
      if (!status.canDraw && status.cardIds.length > 0) {
        const lastCardId = status.cardIds[status.cardIds.length - 1];
        const existing = TAROT_DECK.find((c) => c.id === lastCardId);
        if (existing) {
          setSelectedCard(existing);
          setCardFlipped(true);
          setCurrentView("reveal");
          return;
        }
      }
      startRandomDestiny(user);
    }
  };

  const handleRegisterSuccess = async (regUser: UserRegistration) => {
    setUser(regUser);
    localStorage.setItem("rock_tarot_current_user", JSON.stringify(regUser));
    setShowRegModal(false);

    const syncResult = await syncDailyDrawsFromCloud(regUser.email);
    if (!syncResult.canDraw && syncResult.cardIds.length > 0) {
      const lastCardId = syncResult.cardIds[syncResult.cardIds.length - 1];
      const existing = TAROT_DECK.find((c) => c.id === lastCardId);
      if (existing) {
        setSelectedCard(existing);
        setCardFlipped(true);
        setCurrentView("reveal");
        return;
      }
    }

    startRandomDestiny(regUser);
  };

  const startRandomDestiny = (activeUser?: UserRegistration) => {
    const currentUser = activeUser || user;
    if (!currentUser) {
      setShowRegModal(true);
      return;
    }

    const status = checkDailyDrawStatus(currentUser.email);
    if (!status.canDraw) {
      if (status.cardIds.length > 0) {
        const lastCardId = status.cardIds[status.cardIds.length - 1];
        const existing = TAROT_DECK.find((c) => c.id === lastCardId);
        if (existing) {
          setSelectedCard(existing);
          setCardFlipped(true);
          setCurrentView("reveal");
        }
      }
      return;
    }

    setCurrentView("shuffle");
    setCardFlipped(false);
    setShuffleStep(1);

    const availableCards = TAROT_DECK.filter((c) => !status.cardIds.includes(c.id));
    const pool = availableCards.length > 0 ?const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    setSelectedCard(chosen);

    if (soundEnabled) playShuffleSound();

    setTimeout(() => {
      setShuffleStep(2);
      if (soundEnabled) playShuffleSound();
    }, 1200);

    setTimeout(() => {
      setShuffleStep(3);
    }, 2400);

    setTimeout(() => {
      setShuffleStep(4);
      if (soundEnabled) playCardFlipSound();
      setCardFlipped(true);
    }, 3600);

    setTimeout(() => {
      setShuffleStep(5);
      if (soundEnabled) playRevealChime();
      finalizeCardSelection(chosen, currentUser);
    }, 4800);
  };

  const finalizeCardSelection = async (
    card: TarotCard,
    activeUser: UserRegistration
  ) => {
    setSelectedCard(card);
    setCardFlipped(true);
    setCurrentView("reveal");

    try {
      localStorage.setItem("rock_tarot_claimed_card_id", card.id);
      recordDailyDrawForEmail(activeUser.email, card.id);
    } catch {
      // ignore
    }

    const submission: Submission = {
      id: "sub-" + Date.now(),
      name: activeUser.name,
      experienceType: "random",
      cardNumber: card.number,
archetype: card.archetype,
      artist: card.artist,
      band: card.band,
      submissionDate: new Date().toISOString(),
      emailemailSentToOwner: false,
      emailSentToUser: false
    };

    await processSubmissionEmails(submission, card);
    setSubmissionsList(getSubmissions());
  };

  const safeCopyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // fallback
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch {
      // fallback
    }
  };

  const handleShareCard = async () => {
    if (!selectedCard) return;
    const shareText = `✦ ROCK TAROT ✦\nI drew ${selectedCard.romanNumber} — ${selectedCard.archetype} (${selectedCard.artist})!\n"Which Rock Tarot card are you? Discover your rock soul."`;
    if (navigator.share) {
      try {
        await navigator.share({
          Tarot: ${selectedCard.archetype}`, window.location.href
        });
        return;
      } catch {
        // user canceled
      }
    }
    await safeCopyToClipboard(shareText);
    setShareFeedback("Copied to clipboard!");
    setTimeout(() => setShareFeedback(null), 4000);
  };

  const generateAndDownloadCardImage = (card: TarotCard) => {
    if (card.imageUrl) {
      const link = document.createElement("a");
      link.href = card.imageUrl;
      link.download = `RockTarot_${card.romanNumber}_${card.archetype}.png`;
      link.target = "_blank";
      link.click();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070609] text-stone-100 flex flex-col font-sans selection:bg-red-950 selection:text-amber-200 relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-950/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-indigo-950/15 rounded-full blur-3xl" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-30 w-full border-b border-amber-900/30 bg-[#09080d]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full border border-amber-500/60 bg-red-950/40 flex items-center justify-center text-amber-400 group-hover:border-amber-300 transition-colors shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <span className="font-serif font-bold text-xs">✦</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.25em] text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
              ROCK TAROT
            </span>
            <span className="text-[9px] tracking-widest text-amber-500/70 uppercase">
              22 Major Arcana
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2<button
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute audio" : "Enable audio"}
            className={`p-2 rounded-lg text-xs border transition-all flex items-center gap-1 ${
              soundEnabled
                ? "bg-red-950/40 text-amber-300 border-amber-500/50"
                : "bg-black/30 text-stone-400 border-stone-800}`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {user && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (selectedCard) {
                    setCurrentView("reveal");
                  } else {
                    startRandomDestiny();
                  }
                }}
                className="text-xs bg-red-950/30 border border-red-800/40 hover:border-amber-500/50 px-2.5 py-1.5 rounded-lg text-amber-200 flex items-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline truncate max-w-[120px]">{user.name}</span>
                <span className="md:hidden">Card</span>
              </button>

              <button
                onClick={handleSwitchSeeker}
                title="Log out and switch seeker"
                className="text-xs bg-black/50 border border-stone-800 hover:border-amber-500/50 hover:text-amber-200 text-stone-400 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3 h-3 text-stone-400" />
                <span className="hidden sm:inline">Switch Seeker</span>
                <span className="sm:hidden">Switch</span>
              </button>
            </div>
          )}

          {currentView === "admin" && (
            <button
              onClick={() => setCurrentView("landing")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-serif bg-amber-950/40 text-amber-300 border border-amber-500 hover:brightness-110 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-8 py-8">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === "landing" && (
          <div className="w-full max-w-5xl flex flex-col items-center text-center my-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs tracking-widest font-serif mb-6 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>COLLECTIBLE 22-CARD ROCK MYTHOLOGY</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100 to-amber-400 max-w-4xl leading-[1.1] mb-5">
              DISCOVER YOUR ROCK SOUL
            </h1>

            <p className="font-serif text-lg sm:text-2xl text-amber-200/90 italic max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              “Every soul has a song. Every journey has a card. Discover which rock legend is waiting for you.”
            </p>

            <div
              onClick={handleStartDiscovery}
              className="relative my-4 cursor-pointer group select-none transform transition-transform duration-500 hover:scale-105"
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-red-600/30 via-amber-500/25 to-red-600/30 rounded-3xl blur-2xl group-hover:opacity-100 opacity-60 transition-opacity" />
              <div className="relative">
                <CardBack size="lg" />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-red-700 text-stone-900 font-serif font-bold text-xs px-4 py-1.5 rounded-full shadow-lg border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                Click to Awaken
              </div>
            </div>

            <div className="flex flex-col items-center justify-center mt-12 w-full max-w-sm gap-3">
              <button
                onClick={handleStartDiscovery}
                className="w-full px-10 py-4 rounded-xl font-serif text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2.5 border border-amber-200"
              >
                <span>DISCOVER MY CARD</span>
                <ChevronRight className="w-4 h-4 text-stone-950 stroke-[3]" />
              </button>

              {user && (
                <button
                  onClick={handleSwitchSeeker}
                  className="text-xs font-serif text-stone-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors pt-1"
                >
                  <span>SeekclassName="text-amber-200">{user.name}</strong></span></span>
                  <span className="underline text-amber-400/90 font-medium">Switch Seeker / Log Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: SHUFFLE ANIMATION */}
        {currentView === "shuffle" && selectedCard && (
          <div className="w-full max-w-xl flex flex-col items-center text-center my-auto py-12">
            <div className="text-xs font-serif tracking-[0.2em] text-amber-400 uppercase mb-4">
              {shuffleStep === 1 && "Phase I: The Tarot Deck Shuffles..."}
              {shuffleStep === 2 && "Phase II: Mysterious Energy Awakes..."}
              {shuffleStep === 3 && "Phase III: A Card Emerges From the Void..."}
              {shuffleStep === 4 && "Phase IV: The Veil Inverts..."}
              {shuffleStep === 5 && "Phase V: Your Rock Soul is Revealed!"}
            </div>

            <div className="relative my-8">
              {!cardFlipped ? (
                <CardBack size="xl" />
              ) : (
                <CardArtwork card={selectedCard} size="xl" showDetails={false} />
              )}
            </div>

            <p className="font-serif text-sm text-stone-400 max-w-md italic">
              The veil parts to reveal your archetype...
            </p>
          </div>
        )}

        {/* VIEW 3: FULL CARD REVEAL */}
        {currentView === "reveal" && selectedCard && (
          <div className="w-full max-w-4xl flex flex-col items-center my-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-red-950/30 text-amber-300 text-xs tracking-widest font-serif mb-4">
              <span>✦ YOUR ROCK TAROT ARCHETYPE ✦</span>
            </div>

            <div className="mb-6">
              <span className="font-serif text-xl sm:text-2xl text-amber-400 font-bold tracking-widest">
                CARD {selectedCard.romanNumber}
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-bold text-amber-100 tracking-tight uppercase">
                {selectedCard.archetype}
              </h2>
              <div className="text-xl sm:text-2xl font-serif text-red-400 font-bold mt-1">
                {selectedCard.artist}
              </div>
            </div>

            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative my-4 flex items-center justify-center w-full max-w-sm sm:max-w-md mx-auto"
            >
              {user && (() => {
                const status = checkDailyDrawStatus(user.email);
                if (status.cardIds.length > 1) {
                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevTodayCard();
                      }}
                      className="absolute -left-2 sm:-left-6 z-20 p-2 sm:p-2.5 rounded-full bg-black/85 border border-amber-500/50 text-amber-300 shadow-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  );
                }
                return null;
              })()}

              <div
                onClick={() => setIsCardZoomed((prev) => !prev)}
                className={`relative group cursor-pointer select-none transform transition-all duration-500 ${
                  isCardZoomed ? "scale-105 sm:scale-110" : ""
                }`}
              >
                <CardArtwork card={selectedCard} size="lg" showDetails={true} />
              </div>

              {user && (() => {
                const status = checkDailyDrawStatus(user.email);
                if (status.cardIds.length > 1) {
                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextTodayCard();
                      }}
                      className="absolute -right-2 sm:-right-6 z-20 p-2 sm:p-2.5 rounded-full bg-black/85 border border-amber-500/50 text-amber-300 shadow-xl"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  );
                }
                return null;
              })()}
            </div>

            {/* Reading Box */}
            <div className="w-full max-w-2xl bg-[#110f18]/95 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-left my-6 shadow-2xl relative">
              <div className="mb-4">
                <p className="font-serif text-lg sm:text-xl text-amber-100 font-bold">
                  Your card is <span className="text-amber-400">{selectedCard.archetype}</span>.
                </p>
                <p className="font-serif text-sm sm:text-base text-stone-300 leading-relaxed mt-2">
                  {selectedCard.archetypeExplanation}
                </p>
              </div>

              <div className="mb-5 py-3 border-y border-amber-900/30">
                <p className="font-serif text-sm sm:text-base text-amber-200/90 italic leading-relaxed">
                  {selectedCard.personalReflection}
                </p>
              </div>

              <div className="mb-4 bg-black/40 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <span className="text-xs uppercase tracking-widest font-serif font-bold text-amber-400 block mb-1">
                  Your message:
                </span>
                <p className="font-serif text-base sm:text-lg text-white font-medium italic">
                  &ldquo;{selectedCard.cardMessage}&rdquo;
                </p>
              </div>

              <div className="mb-6 bg-red-950/30 border border-red-800/40 p-4 rounded-xl">
                <span className="text-xs uppercase tracking-wider font-serif font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
                  <span>🤘</span>
                  <span>Your challenge:</span>
                </span>
                <p className="font-serif text-sm text-stone-200">
                  {selectedCard.challenge}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-stone-800">
                {selectedCard.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-black/60 border border-amber-500/20 text-amber-300 font-serif"
                  >
                    ✦ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Daily Limit Controls */}
            {user && (() => {
              const status = checkDailyDrawStatus(user.email);
              if (status.canDraw) {
                return (
                  <div className="flex flex-col items-center gap-2 mb-4 w-full max-w-md">
                    <button
                      onClick={() => startRandomDestiny()}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 text-stone-950 font-serif font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                      <span>
                        DRAW NEXT CARD ({status.remaining} OF 3 LEFT TODAY)
                      </span>
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 rounded-xl border border-amber-800/50 bg-[#0e0c14]/95 shadow-lg mb-4 max-w-md w-full">
                    <span className="text-xs font-serif text-stone-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Daily Limit Reached (3/3 drawn)</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-1 rounded bg-black/80 border border-amber-500/40">
                      Resets in: {timeUntilReset}
                    </span>
                  </div>
                );
              }
            })()}

            {/* Vocal Coaching Invitation */}
            <div className="w-full max-w-2xl bg-gradient-to-r from-[#1a0c14] via-[#120a17] to-[#170e13] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-7 my-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-black">
                    <img
                      src="https://storage.googleapis.com/producer-app-public/producer/ec5c5f33-88cf-4092-a088-32e0ff9dca42"
                      alt="Vocal Coach"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-200 mb-1.5">
                    DISCOVER THE POWER OF YOUR VOICE
                  </h3>
                  <p className="font-serif text-xs text-stone-300 leading-relaxed mb-4">
                    Whether you want to master clean rock vocals, healthy distortion &amp; screams, or find your authentic sound, let&apos;s train together 1-on-1.
                  </p>
                  <a
                    href={lessonsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest shadow-lg"
                  >
                    <span>Explore Singing Lessons</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl w-full">
              <button
                onClick={handleShareCard}
                className="px-5 py-3 rounded-xl bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE MY CARD</span>
              </button>

              <button
                onClick={() => generateAndDownloadCardImage(selectedCard)}
                className="px-4 py-3 rounded-xl bg-[#14121a] text-amber-200 font-serif font-bold text-xs uppercase tracking-widest border border-amber-500/40 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>DOWNLOAD ART (PNG)</span>
              </button>
            </div>
            {shareFeedback && <p className="text-xs text-amber-300 mt-2">{shareFeedback}</p>}
          </div>
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === "admin" && (
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
              <div>
                <h2 className="font-serif text-3xl font-bold text-amber-100">
                  ADMIN DASHBOARD
                </h2>
                <p className="text-xs text-stone-400 font-serif">
                  Connected to: {OWNER_EMAIL}
                </p>
              </div>

              <button
                onClick={() => setCurrentView("landing")}
                className="px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 text-xs font-serif hover:text-white"
              >
                Back to Site
              </button>
            </div>

            <div className="w-full space-y-6">
              {/* Submissions Table with CSV Export */}
              <div className="bg-[#100e17] border border-stone-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-800 mb-4">
                  <input
                    type="text"
                    placeholder="Filter by name, email..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="px-3 py-1.5 bg-black/60 border border-stone-700 rounded-lg text-xs text-stone-200 font-serif"
                  />
                  <button
                    onClick={exportSubmissionsToCSV}
                    className="px-4 py-2 bg-amber-600 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT CONTACTS (CSV)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-serif">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Card</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {submissionsList.map((sub) => (
                        <tr key={sub.id}>
                          <td className="py-2 px-3 text-stone-400">{new Date(sub.submissionDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3 font-bold text-stone-200">{sub.name}</td>
                          <td className="py-2 px-3 text-sky-400">{sub.email}</td>
                          <td className="py-2 px-3 text-amber-300">{sub.archetype}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <RegistrationModalView
          onClose={() => setShowRegModal(false)}
          onSuccess={handleRegisterSuccess}
          onSyncCheck={syncDailyDrawsFromCloud}
        />
      )}

      {/* ADMIN PASSCODE MODAL */}
      {showAdminLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#120f1a] border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-2xl">
            <button
              onClick={() => setShowAdminLockModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="font-serif text-xl font-bold text-amber-100 mb-2">CREATOR ACCESS</h3>
            <p className="text-xs text-stone-400 font-serif mb-4">Enter passcode (Default: 2020)</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPasscodeInput.trim() === creatorCode) {
                  setAdminUnlocked(true);
                  setShowAdminLockModal(false);
                  setCurrentView("admin");
                } else {
                  setAdminPasscodeError("Incorrect passcode.");
                }
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="2020"
                value={adminPasscodeInput}
                onChange={(e) => setAdminPasscodeInput(e.target.value)}
                className="w-full px-4 py-2 bg-black/70 border border-stone-700 rounded-xl text-center text-amber-300 font-mono text-base focus:border-amber-400"
              />
              {adminPasscodeError && <p className="text-xs text-red-400">{adminPasscodeError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl"
              >
                UNLOCK
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-amber-900/30 bg-[#09080d] py-6 px-4 text-center text-xs font-serif text-stone-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span>✦ ROCK TAROT • Transformative Rock Mythology</span>
          <button
            onClick={() => {
              if (adminUnlocked) setCurrentView("admin");
              else setShowAdminLockModal(true);
            }}
            className="text-[11px] text-stone-500 hover:text-amber-300 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Music Freak</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

function RegistrationModalView({
  onClose,
  onSuccess,
  onSyncCheck
}: {
  onClose: () => void;
  onSuccess: (user: UserRegistration) => void;
  onSyncCheck: (email: string) => Promise<{ count: number; canDraw: boolean; cardIds: string[] }>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name to proceed.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!consent) {
      setError("Please confirm consent to receive updates and singing lesson news.");
      return;
    }

    setIsChecking(true);
    try {
      await onSyncCheck(email.trim().toLowerCase());
    } catch {
      // safe fallback
    } finally {
      setIsChecking(false);
    }

    onSuccess({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      consent: true,
      registeredAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#181522] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white">✕</button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-red-950/40 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-amber-100">ENTER THE SANCTUM</h3>
          <p className="font-serif text-xs text-stone-400 mt-1">
            Before your card is unsealed, register your details to awaken your rock archetype.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-serif text-emerald-400">
            <span>✓ 100% Free • No passwords or payments required</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-serif uppercase tracking-wider text-amber-300/80 mb-1">
              Your First Name or Nickname *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Elena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-black/60 border border-stone-700 rounded-xl text-stone-100 text-sm font-serif focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-serif uppercase tracking-wider text-amber-300/80 mb-1">
              Email Address (for occasional updates) *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. elena@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black/60 border border-stone-700 rounded-xl text-stone-100 text-sm font-serif focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-serif text-stone-300 select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-stone-700 bg-black text-amber-500"
              />
              <span className="leading-tight">
                I agree to receive occasional music updates, rock insights, and promotions or news for singing lessons.
              </span>
            </label>
          </div>

          {error && <p className="text-xs text-red-400 text-center font-serif">{error}</p>}

          <button
            type="submit"
            disabled={isChecking}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>CONNECTING WITH THE STARS...</span>
              </>
            ) : (
              <span>CONFIRM &amp; AWAKEN DESTINY</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
