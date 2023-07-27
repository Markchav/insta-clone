import GlobalContextProvider from '@/state/context/GlobalContext'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
    			<Head>
				<link rel='icon' href='/favicon/favicon.ico' />
        <title>Instagram</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
			    </Head>
      <Toaster/>
      <Component {...pageProps} />
    </GlobalContextProvider>
  )
  
}
