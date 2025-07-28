// In src/pages/StatsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import Log from '../utils/logger';

const StatsPage = () => {
  const [links, setLinks] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    expiredLinks: 0
  });

  useEffect(() => {
    const loadStats = () => {
      try {
        const storedLinks = JSON.parse(localStorage.getItem('shortLinks') || '[]');
        const now = new Date();
        
        // Calculate statistics
        let totalClicks = 0;
        let activeLinks = 0;
        let expiredLinks = 0;
        
        const processedLinks = storedLinks.map(link => {
          const isExpired = now > new Date(link.expiryTime);
          totalClicks += link.clicks || 0;
          
          if (isExpired) {
            expiredLinks++;
          } else {
            activeLinks++;
          }
          
          return {
            ...link,
            isExpired,
            shortUrl: `${window.location.origin}/${link.shortcode}`
          };
        });
        
        // Sort by creation time (newest first)
        processedLinks.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));
        
        setLinks(processedLinks);
        setTotalStats({
          totalLinks: storedLinks.length,
          totalClicks,
          activeLinks,
          expiredLinks
        });
        
        Log('info', 'page', 'Statistics page loaded with data');
      } catch (error) {
        Log('error', 'page', `Error loading statistics: ${error.message}`);
      }
    };
    
    loadStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status chip for link
  const getStatusChip = (link) => {
    if (link.isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  // Calculate time remaining
  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Log('info', 'component', 'Short URL copied to clipboard');
    }).catch(err => {
      Log('error', 'component', `Failed to copy to clipboard: ${err.message}`);
    });
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Statistics
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Back to Shortener
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics Dashboard
        </Typography>

        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {totalStats.totalLinks}
                </Typography>
                <Typography variant="subtitle1">
                  Total URLs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {totalStats.activeLinks}
                </Typography>
                <Typography variant="subtitle1">
                  Active URLs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {totalStats.expiredLinks}
                </Typography>
                <Typography variant="subtitle1">
                  Expired URLs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {totalStats.totalClicks}
                </Typography>
                <Typography variant="subtitle1">
                  Total Clicks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Links List */}
        {links.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            <Typography variant="h6">No shortened URLs found</Typography>
            <Typography variant="body2">
              <Link to="/" style={{ textDecoration: 'none' }}>
                Create your first short URL
              </Link>
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {links.map((link, index) => (
              <Grid item xs={12} key={link.shortcode}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                          /{link.shortcode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {link.longUrl}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                          {link.clicks || 0} clicks
                        </Typography>
                        {getStatusChip(link)}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* URL Details */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              URL Details
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Short URL:</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                                >
                                  {link.shortUrl}
                                </Typography>
                                <Button 
                                  size="small" 
                                  onClick={() => copyToClipboard(link.shortUrl)}
                                >
                                  Copy
                                </Button>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Original URL:</Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ wordBreak: 'break-all' }}
                              >
                                {link.longUrl}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Created:</Typography>
                              <Typography variant="body2">
                                {formatDate(link.creationTime)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Expires:</Typography>
                              <Typography variant="body2">
                                {formatDate(link.expiryTime)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getTimeRemaining(link.expiryTime)}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2">Validity Period:</Typography>
                              <Typography variant="body2">
                                {link.validityMinutes} minutes
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Click Analytics */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Click Analytics
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h4" color="primary">
                                {link.clicks || 0}
                              </Typography>
                              <Typography variant="subtitle2">
                                Total Clicks
                              </Typography>
                            </Box>
                            
                            {link.clickData && link.clickData.length > 0 ? (
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Timestamp</TableCell>
                                      <TableCell>Source</TableCell>
                                      <TableCell>Location</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {link.clickData
                                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                      .slice(0, 5) // Show last 5 clicks
                                      .map((click, clickIndex) => (
                                      <TableRow key={clickIndex}>
                                        <TableCell>
                                          <Typography variant="caption">
                                            {formatDate(click.timestamp)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="caption">
                                            {click.source || 'Direct'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="caption">
                                            {click.location}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                No clicks recorded yet
                              </Alert>
                            )}
                            
                            {link.clickData && link.clickData.length > 5 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Showing latest 5 of {link.clickData.length} clicks
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}

        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
            size="large"
          >
            Create New Short URL
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default StatsPage; 