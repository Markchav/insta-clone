import GlobalContextProvider from '@/state/context/GlobalContext'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <Toaster/>
      <Component {...pageProps} />
    </GlobalContextProvider>
  )
  
}
