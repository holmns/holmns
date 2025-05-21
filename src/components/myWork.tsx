"use client";

import { techMap } from "@/data/techMap";
import { workCategories, WorkCategoryType } from "@/data/workCategories";
import Image from "next/image";
import { useState } from "react";

export default function MyWork() {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <section id="my-work" className="flex flex-col justify-center items-center py-20">
      <h1 className="text-6xl font-bold text-light">My Work</h1>
      <Selector
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        workCategories={workCategories}
      />
      <TechStack selectedCategory={selectedCategory} workCategories={workCategories} />
      <Projects selectedCategory={selectedCategory} workCategories={workCategories} />
    </section>
  );
}

type selectorProps = {
  selectedCategory: number;
  setSelectedCategory: (index: number) => void;
  workCategories: WorkCategoryType[];
};

function Selector({ selectedCategory, setSelectedCategory, workCategories }: selectorProps) {
  return (
    <div className="flex flex-row gap-10 md:gap-16 lg:gap-30 mt-15">
      {workCategories.map((workCategory, index) => (
        <button
          onClick={() => setSelectedCategory(index)}
          key={index}
          className={`
              transition-all duration-300 group
              ${
                selectedCategory !== index
                  ? "blur-[2px] opacity-50"
                  : "opacity-100 text-shadow-[0_0_100px_rgba(255,255,255,0.5)]"
              }
              hover:blur-none hover:scale-110
            `}
        >
          <div className="text-4xl md:text-5xl lg:text-6xl">{workCategory.icon}</div>
          <div className={`transition-all duration-300 text-lg md:text-xl lg:text-2xl`}>{workCategory.name}</div>
        </button>
      ))}
    </div>
  );
}

type techStackProps = {
  selectedCategory: number;
  workCategories: WorkCategoryType[];
};

function TechStack({ selectedCategory, workCategories }: techStackProps) {
  return (
    <div className="flex flex-col justify-center items-center mt-20">
      <p className="font-bold text-3xl">Tech Stack</p>
      <div className="flex flex-row flex-wrap items-center justify-center p-10 m-10 gap-10 bg-white/5 rounded-4xl mt-10 border border-white/10">
        {workCategories[selectedCategory].tech.map((tech, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center w-20 h-20 bg-white/5 rounded-xl border border-white/0 hover:border-white/10 transition-all duration-300"
          >
            <div className="relative group w-full h-full">
              <Image
                src={techMap[tech].path}
                alt={techMap[tech].name}
                width={100}
                height={100}
                className="w-full h-full p-5 box-border object-contain"
              />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[130%] mt-2 px-2 py-1 text-xs whitespace-nowrap text-white bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {techMap[tech].name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Projects({ selectedCategory, workCategories }: techStackProps) {
  return (
    <div className="flex flex-col w-full items-center justify-center mt-20 px-10">
      <p className="font-bold text-3xl">Projects</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 w-full max-w-6xl">
        {workCategories[selectedCategory].projects.map((project, index) => (
          <a
            href={project.link}
            target="_blank"
            key={index}
            className="block bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="w-full h-40 relative mb-4 rounded-t-lg overflow-hidden">
              <Image src={project.image} alt={project.name} fill className="object-cover" />
            </div>
            <p className="text-xl font-semibold">{project.name}</p>
            <p className="text-sm mt-1">{project.desc}</p>
            <div className="flex flex-row flex-wrap items-center justify-start gap-2 mt-2">
              {project.tech.map((tech, index) => (
                <p key={index} className="text-xs bg-white/5 rounded-full px-2 py-1">
                  {techMap[tech].name}
                </p>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
