import AuthProvider from '../components/AuthProvider'
import { ReactNode } from 'react'
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="content-wrapper">
            {children}
          </div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}