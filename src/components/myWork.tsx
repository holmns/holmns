"use client";

import { useState } from "react";

export default function MyWork() {
  const [category, setCategory] = useState(0);
  const workCategories = [
    { name: "Photography", icon: "📷" },
    { name: "Videography", icon: "🎥" },
    { name: "Programming", icon: "💻" },
  ];

  return (
    <section id="my-work" className="flex flex-col justify-center items-center py-20">
      <h1 className="text-6xl font-bold text-light">My Work</h1>
      <Selector category={category} setCategory={setCategory} workCategories={workCategories} />
    </section>
  );
}

type selectorProps = {
  category: number;
  setCategory: (index: number) => void;
  workCategories: { name: string; icon: string }[];
};

function Selector({ category, setCategory, workCategories }: selectorProps) {
  return (
    <div className="flex flex-row gap-10 md:gap-16 lg:gap-30 mt-15">
      {workCategories.map((workCategory, index) => (
        <button
          onClick={() => setCategory(index)}
          key={index}
          className={`
              transition-all duration-300 group
              ${
                category !== index
                  ? "blur-[2px] opacity-50"
                  : "opacity-100 text-shadow-[0_0_100px_rgba(255,255,255,0.5)]"
              }
              hover:blur-none hover:scale-110
            `}
        >
          <div className="text-6xl">{workCategory.icon}</div>
          <div className={`transition-all duration-300 text-2xl`}>{workCategory.name}</div>
        </button>
      ))}
    </div>
  );
}

// function Technologies() {
//   return (

//   )
// }
