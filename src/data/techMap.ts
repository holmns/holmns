export const techMap = {
  lightroom: { name: "Lightroom", path: "/tech-icons/lightroom.png" },
  photoshop: { name: "Photoshop", path: "/tech-icons/photoshop.png" },
  davinci: { name: "Davinci Resolve", path: "/tech-icons/davinci-resolve.png" },
  premiere: { name: "Premiere Pro", path: "/tech-icons/premiere-pro.png" },
  after: { name: "After Effects", path: "/tech-icons/after-effects.png" },
  blender: { name: "Blender", path: "/tech-icons/blender.png" },
  html: { name: "HTML", path: "/tech-icons/html.png" },
  css: { name: "CSS", path: "/tech-icons/css.png" },
  js: { name: "Javascript", path: "/tech-icons/javascript.png" },
  ts: { name: "Typescript", path: "/tech-icons/typescript.png" },
  react: { name: "React.js", path: "/tech-icons/react.png" },
  reactNative: { name: "React Native", path: "/tech-icons/react.png" },
  next: { name: "Next.js", path: "/tech-icons/nextjs.png" },
  tailwind: { name: "Tailwind", path: "/tech-icons/tailwindcss.png" },
  swift: { name: "Swift", path: "/tech-icons/swift.png" },
  firebase: { name: "Firebase", path: "/tech-icons/firebase.png" },
  python: { name: "Python", path: "/tech-icons/python.png" },
  tensorflow: { name: "Tensorflow", path: "/tech-icons/tensorflow.png" },
} as const;

export type TechId = keyof typeof techMap;
export type TechItem = (typeof techMap)[TechId];
