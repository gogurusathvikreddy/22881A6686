// In src/pages/ShortenerPage.js
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  AppBar,
  Toolbar,
  Chip,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import Log from '../utils/logger'; // Adjust path if needed

const ShortenerPage = () => {
  const [urls, setUrls] = useState(Array(5).fill({
    longUrl: '',
    customShortcode: '',
    validityMinutes: 30,
    isProcessing: false,
    result: null,
    error: null
  }));

  // Generate a random shortcode
  const generateShortcode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Check if shortcode is unique
  const isShortcodeUnique = (shortcode) => {
    const existingLinks = JSON.parse(localStorage.getItem('shortLinks') || '[]');
    return !existingLinks.some(link => link.shortcode === shortcode);
  };

  // Validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Update specific URL entry
  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value, error: null };
    setUrls(newUrls);
  };

  // Handle shortening a single URL
  const handleShortenSingle = async (index) => {
    const urlData = urls[index];
    
    // Reset states
    const newUrls = [...urls];
    newUrls[index] = { ...urlData, isProcessing: true, error: null, result: null };
    setUrls(newUrls);

    // Validation
    if (!urlData.longUrl.trim()) {
      Log('error', 'component', `URL ${index + 1}: User tried to shorten an empty URL`);
      newUrls[index] = { ...urlData, isProcessing: false, error: 'URL is required' };
      setUrls(newUrls);
      return;
    }

    if (!isValidUrl(urlData.longUrl)) {
      Log('error', 'component', `URL ${index + 1}: Invalid URL format`);
      newUrls[index] = { ...urlData, isProcessing: false, error: 'Invalid URL format' };
      setUrls(newUrls);
      return;
    }

    if (urlData.validityMinutes <= 0) {
      Log('error', 'component', `URL ${index + 1}: Invalid validity period`);
      newUrls[index] = { ...urlData, isProcessing: false, error: 'Validity must be greater than 0' };
      setUrls(newUrls);
      return;
    }

    try {
      // Generate or use custom shortcode
      let shortcode = urlData.customShortcode.trim();
      if (!shortcode) {
        // Generate unique shortcode
        do {
          shortcode = generateShortcode();
        } while (!isShortcodeUnique(shortcode));
      } else {
        // Check if custom shortcode is unique
        if (!isShortcodeUnique(shortcode)) {
          Log('error', 'component', `URL ${index + 1}: Custom shortcode already exists`);
          newUrls[index] = { ...urlData, isProcessing: false, error: 'Shortcode already exists' };
          setUrls(newUrls);
          return;
        }
      }

      // Create the shortened URL data
      const now = new Date();
      const expiryTime = new Date(now.getTime() + urlData.validityMinutes * 60000);
      
      const shortLinkData = {
        shortcode,
        longUrl: urlData.longUrl,
        creationTime: now.toISOString(),
        expiryTime: expiryTime.toISOString(),
        validityMinutes: urlData.validityMinutes,
        clicks: 0,
        clickData: []
      };

      // Save to localStorage
      const existingLinks = JSON.parse(localStorage.getItem('shortLinks') || '[]');
      existingLinks.push(shortLinkData);
      localStorage.setItem('shortLinks', JSON.stringify(existingLinks));

      // Success
      Log('info', 'component', `URL ${index + 1}: Successfully shortened ${urlData.longUrl} to ${shortcode}`);
      newUrls[index] = { 
        ...urlData, 
        isProcessing: false, 
        result: {
          shortcode,
          shortUrl: `${window.location.origin}/${shortcode}`,
          expiryTime: expiryTime.toISOString()
        }
      };
      setUrls(newUrls);

    } catch (error) {
      Log('error', 'component', `URL ${index + 1}: Error shortening URL - ${error.message}`);
      newUrls[index] = { ...urlData, isProcessing: false, error: 'Failed to shorten URL' };
      setUrls(newUrls);
    }
  };

  // Handle shortening all valid URLs
  const handleShortenAll = async () => {
    Log('info', 'component', 'User initiated bulk URL shortening');
    
    // Process all URLs with content
    const promises = urls.map((urlData, index) => {
      if (urlData.longUrl.trim()) {
        return handleShortenSingle(index);
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  };

  // Clear a specific URL entry
  const clearUrl = (index) => {
    const newUrls = [...urls];
    newUrls[index] = {
      longUrl: '',
      customShortcode: '',
      validityMinutes: 30,
      isProcessing: false,
      result: null,
      error: null
    };
    setUrls(newUrls);
  };

  // Clear all URL entries
  const clearAll = () => {
    setUrls(Array(5).fill({
      longUrl: '',
      customShortcode: '',
      validityMinutes: 30,
      isProcessing: false,
      result: null,
      error: null
    }));
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }}>
      <AppBar position="static" sx={{ mb: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/stats">
            View Statistics
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', px: 2, py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Shorten Your URLs
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Shorten up to 5 URLs simultaneously with custom expiry times
          </Typography>
        </Box>

        <Box sx={{ width: '100%' }}>
          {urls.map((urlData, index) => (
            <Box key={index} sx={{ width: '100%', mb: 3 }}>
              <Card variant="outlined" sx={{ width: '100%', mx: 0 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      URL #{index + 1}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="Enter Long URL"
                        variant="outlined"
                        value={urlData.longUrl}
                        onChange={(e) => updateUrl(index, 'longUrl', e.target.value)}
                        placeholder="https://example.com/very/long/url"
                        error={!!urlData.error && urlData.error.includes('URL')}
                        sx={{ '& .MuiInputBase-root': { fontSize: '1.1rem' } }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                          fullWidth
                          label="Custom Shortcode (Optional)"
                          variant="outlined"
                          value={urlData.customShortcode}
                          onChange={(e) => updateUrl(index, 'customShortcode', e.target.value)}
                          placeholder="mycode123"
                          helperText="Leave empty for auto-generation"
                          sx={{ '& .MuiInputBase-root': { fontSize: '1.1rem' } }}
                        />
                        
                        <TextField
                          fullWidth
                          label="Validity Period (Minutes)"
                          type="number"
                          variant="outlined"
                          value={urlData.validityMinutes}
                          onChange={(e) => updateUrl(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                          inputProps={{ min: 1, max: 10080 }} // Max 1 week
                          helperText="Default: 30 minutes"
                          sx={{ '& .MuiInputBase-root': { fontSize: '1.1rem' } }}
                        />
                      </Box>
                    </Box>

                  {urlData.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {urlData.error}
                    </Alert>
                  )}

                  {urlData.result && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Short URL Created:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {urlData.result.shortUrl}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Expires: {new Date(urlData.result.expiryTime).toLocaleString()}
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleShortenSingle(index)}
                      disabled={urlData.isProcessing || !urlData.longUrl.trim()}
                      size="small"
                    >
                      {urlData.isProcessing ? 'Processing...' : 'Shorten'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => clearUrl(index)}
                      size="small"
                    >
                      Clear
                    </Button>

                    {urlData.result && (
                      <Chip 
                        label="✓ Shortened" 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleShortenAll}
            disabled={urls.every(url => !url.longUrl.trim())}
          >
            Shorten All URLs
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={clearAll}
          >
            Clear All
          </Button>
          
          <Button
            variant="outlined"
            component={Link}
            to="/stats"
            size="large"
          >
            View Statistics
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ShortenerPage; 