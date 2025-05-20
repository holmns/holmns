import AboutMe from "@/components/aboutMe";
import MyWork from "@/components/myWork";
import NavBar from "@/components/navBar";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/header"), { ssr: false });

export default function Home() {
  return (
    <div>
      <NavBar />
      <Header />
      <AboutMe />
      <MyWork />
    </div>
  );
}
