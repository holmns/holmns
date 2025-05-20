import NavBar from "@/components/navBar";
import HeaderClient from "@/components/headerClient";
import AboutMe from "@/components/aboutMe";
import MyWork from "@/components/myWork";

export default function Home() {
  return (
    <div>
      <NavBar />
      <HeaderClient />
      <AboutMe />
      <MyWork />
    </div>
  );
}
