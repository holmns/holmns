import AboutMe from "@/components/aboutMe";
import Header from "@/components/header";
import MyWork from "@/components/myWork";
import NavBar from "@/components/navBar";

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
