import { TechId } from "./techMap";

export const site = {
  brand: "HOLMNS",
  name: "Nawat Suangburanakul",
  alias: "Holmes",
  email: "nawathome@gmail.com",
  location: "Thailand",
  timezone: "GMT+7",
} as const;

export const socials = [
  { label: "GitHub", handle: "@homns", href: "https://github.com/homns" },
  { label: "Instagram", handle: "@holmns_", href: "https://www.instagram.com/holmns_/" },
  { label: "Discord", handle: "holmns", href: "https://discord.com/users/520760336908025866" },
] as const;

export const navLinks = [
  { label: "About", href: "#about", index: "01" },
  { label: "Craft", href: "#craft", index: "02" },
  { label: "Work", href: "#work", index: "03" },
  { label: "Contact", href: "#contact", index: "04" },
] as const;

export type Craft = {
  index: string;
  title: string;
  blurb: string;
  tech: TechId[];
};

export const crafts: Craft[] = [
  {
    index: "01",
    title: "Photography",
    blurb: "Street, portrait and travel frames — shot with intent, graded with patience.",
    tech: ["lightroom", "photoshop"],
  },
  {
    index: "02",
    title: "Videography",
    blurb: "Films and edits carried from raw footage to final frame — cut, graded, composited.",
    tech: ["davinci", "premiere", "after", "blender"],
  },
  {
    index: "03",
    title: "Programming",
    blurb: "Apps, web and applied AI — from native iOS to deep-learning models.",
    tech: ["swift", "ts", "js", "react", "reactNative", "next", "tailwind", "firebase", "python", "tensorflow", "git", "html", "css"],
  },
];

export type Project = {
  index: string;
  title: string;
  tagline: string;
  desc: string;
  image: string;
  link?: string;
  status: "live" | "in development" | "research";
  tech: TechId[];
};

export const projects: Project[] = [
  {
    index: "01",
    title: "T-lub",
    tagline: "Share hidden gems",
    desc: "An iOS app for discovering and sharing hidden gems across Thailand — built natively in Swift, shipped on the App Store.",
    image: "/project-images/tlub.jpeg",
    link: "https://apps.apple.com/th/app/t-lub/id6670796341?l=en",
    status: "live",
    tech: ["swift", "ts", "firebase"],
  },
  {
    index: "02",
    title: "Thype",
    tagline: "Type Thai in Roman letters",
    desc: "A Thai transliteration input method for macOS and iOS — type phonetically in Roman script and it becomes Thai in real time, ranked by a 4.6M-pair bigram language model.",
    image: "/project-images/thype.jpg",
    status: "in development",
    tech: ["swift", "python"],
  },
  {
    index: "03",
    title: "SwiftTab",
    tagline: "MRU tab switching for Safari",
    desc: "A native macOS app and Safari extension that brings most-recently-used tab switching — heads-up display, fuzzy tab search and fully customizable shortcuts.",
    image: "/project-images/swifttab.jpg",
    status: "in development",
    tech: ["swift", "ts", "react"],
  },
];
