import { TechId } from "./techMap";

export type WorkCategoryType = {
  name: string;
  icon: string;
  tech: TechId[];
  projects: { name: string; desc: string; image: string; link: string; tech: TechId[] }[];
};

export const workCategories: WorkCategoryType[] = [
  {
    name: "Photography",
    icon: "📷",
    tech: ["lightroom", "photoshop"],
    projects: [],
  },
  {
    name: "Videography",
    icon: "🎥",
    tech: ["davinci", "premiere", "after", "blender"],
    projects: [],
  },
  {
    name: "Programming",
    icon: "💻",
    tech: ["html", "css", "js", "ts", "react", "reactNative", "tailwind", "swift", "firebase", "python", "tensorflow"],
    projects: [
      {
        name: "T-lub",
        desc: "Share Hidden Gems",
        image: "/project-images/tlub.jpeg",
        link: "https://apps.apple.com/th/app/t-lub/id6670796341?l=en",
        tech: ["swift", "firebase"],
      },
      {
        name: "Heart Sound Classification",
        desc: "Deep Learning Model for Stethoscope-Recorded Heart Sounds Abnormality Detection",
        image: "/project-images/heart-ai.jpeg",
        link: "",
        tech: ["python", "tensorflow"],
      },
    ],
  },
];
