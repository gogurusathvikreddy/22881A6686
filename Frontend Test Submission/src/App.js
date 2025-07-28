// In src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import ShortenerPage from './pages/ShortenerPage';
import StatsPage from './pages/StatsPage';
import Log from './utils/logger'; // Import the logger

// This component will handle the redirection logic
const RedirectHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const links = JSON.parse(localStorage.getItem('shortLinks') || '[]');
    const link = links.find(l => l.shortcode === shortcode);

    if (link) {
      // Check if the link has expired
      const now = new Date();
      const expiryTime = new Date(link.expiryTime);
      
      if (now > expiryTime) {
        Log('error', 'redirect', `Shortcode ${shortcode} has expired`);
        navigate('/'); // Redirect to home if expired
        return;
      }

      // Update click count and track click data
      const updatedLinks = links.map(l => {
        if (l.shortcode === shortcode) {
          const clickData = {
            timestamp: new Date().toISOString(),
            source: document.referrer || 'direct',
            location: window.location.origin
          };
          return {
            ...l,
            clicks: (l.clicks || 0) + 1,
            clickData: [...(l.clickData || []), clickData]
          };
        }
        return l;
      });
      localStorage.setItem('shortLinks', JSON.stringify(updatedLinks));

      // Log the click event!
      Log('info', 'redirect', `Redirecting shortcode ${shortcode} to ${link.longUrl}`);
      window.location.href = link.longUrl;
    } else {
      Log('error', 'redirect', `Shortcode not found: ${shortcode}`);
      navigate('/'); // Redirect to home if not found
    }
  }, [shortcode, navigate]);

  return <div>Redirecting...</div>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/:shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
