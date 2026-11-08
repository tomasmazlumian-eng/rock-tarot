export interface TarotCard {
  id: string;
  number: number;
  romanNumber: string;
  archetype: string;
  artist: string;
  band: string;
  inspiredBy?: string;
  imageUrl?: string;
  subtitle: string;
  quote: string;
  archetypepersonalReflection: string;
  cardMessage: string;
  challenge: string;
  interpretation: string;
  symbolism: string[];
  keywords: string[];
  accentColor: string;
  category: "awakening" | "power" | "transformation" | "transcendence";
  [key: string]: any;
}

export interface UserRegistration {
  name: string;
consent: boolean;
  registeredAt: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  experienceType: "random" | "chosen";
  cardNumber: number;
  romanNumber: string;
  archetype: string;
  artist: string;
  band: string;
  submissionDate: string;
  | "sent" | "simulated" | "failed";emailSentToUser: boolean;
}

export interface FutureDeck {
  id: string;
  title: string;
  description: string;
  artistsPreview: string[];
  cardCount: number;
}
