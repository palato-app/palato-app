import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Infra-level visitor/pageview counts only — PostHog stays the product-analytics
// sink (Decision #049). The /react export auto-tracks SPA route changes.
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth.tsx'
import { initAnalytics } from './lib/track.ts'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  </StrictMode>,
)