import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import App from './App.jsx'
import 'highlight.js/styles/github-dark.css'; 
// or try: 'highlight.js/styles/atom-one-dark.css', 'monokai-sublime.css', etc.


createRoot(document.getElementById('root')).render(
  
    <App />
  
)
