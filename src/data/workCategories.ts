import { TechId } from "./techMap";

export type WorkCategoryType = {
  name: string;
  icon: string;
  tech: TechId[];
  projects: ProjectType[];
};

export type ProjectType = {
  name: string;
  desc: string;
  image: string;
  link: string;
  tech: TechId[];
};

export const workCategories: WorkCategoryType[] = [
  {
    name: "Photography",
    icon: "📷",
    tech: ["photoshop", "lightroom"],
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
    tech: [
      "html",
      "css",
      "js",
      "ts",
      "react",
      "reactNative",
      "next",
      "tailwind",
      "swift",
      "firebase",
      "python",
      "tensorflow",
      "git",
    ],
    projects: [
      {
        name: "T-lub",
        desc: "Share Hidden Gems",
        image: "/project-images/tlub.jpeg",
        link: "https://apps.apple.com/th/app/t-lub/id6670796341?l=en",
        tech: ["swift", "ts", "firebase"],
      },
      {
        name: "Questerrain",
        desc: "Eco quest gamified. (In development)",
        image: "/project-images/questerrain.jpg",
        link: "",
        tech: ["reactNative", "ts", "tailwind", "firebase"],
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
