import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-row h-[650px] bg-light items-center justify-center ">
      <div className="mr-[40%] flex flex-col justify-start">
        <p className="text-7xl font-bold text-dark ">Holmes</p>
        <p className="text-4xl mt-[-10px] text-dark">Nawat Suangburanakul</p>
        <div className="flex flex-row gap-3 mt-2">
          <a href="https://github.com/homns" target="_blank">
            <Image
              src="/icons/github-logo.svg"
              alt="github-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
          <a href="https://discord.com/users/520760336908025866" target="_blank">
            <Image
              src="/icons/discord-logo.svg"
              alt="discord-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
          <a href="https://www.instagram.com/_homns_/" target="_blank">
            <Image
              src="/icons/instagram-logo.svg"
              alt="instagram-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
