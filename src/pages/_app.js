import GlobalContextProvider from "@/state/context/GlobalContext";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <Head>
        <link rel="icon" href="/favicon/favicon.ico" />
        <title>PicBurst</title>
        {/* <meta
            name="viewport"
            content="width=device-width, initial-scale=.78, maximum-scale=1.0, user-scalable=no"
          /> */}
        <meta name="robots" content="noindex" />
        <meta
          name="description"
          content="A student-made Firebase-auth demo inspired by social media platforms. Not affiliated with Instagram."
        />
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
}
