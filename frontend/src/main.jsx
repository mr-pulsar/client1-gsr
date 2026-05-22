import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* If deployed to GitHub Pages (404 redirect), we may receive a ?p=encodedPath param.
          Replace the current history entry with that path so BrowserRouter picks it up. */}
      {(() => {
        try {
          const params = new URLSearchParams(window.location.search);
          const p = params.get('p');
          if (p) {
            const decoded = decodeURIComponent(p);
            window.history.replaceState({}, '', decoded);
          }
        } catch (e) {
          // ignore
        }
      })()}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);