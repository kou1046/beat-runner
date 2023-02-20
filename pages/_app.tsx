import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header className="container mx-auto bg-gradient-to-r from-cyan-200 to-blue-400 p-10 text-center">
        <h1>Beat Runner</h1>
        <h2>走る，もしくはクリックしてビートを刻もう．</h2>
      </header>
      <Component {...pageProps} />
    </>
  );
}
