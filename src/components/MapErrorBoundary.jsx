import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Map Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is the common DOM removal error
    const isDOMError = error.message && (
      error.message.includes("removeChild") || 
      error.message.includes("not a child of this node") ||
      error.message.includes("Node")
    );

    this.setState({
      error: error,
      errorInfo: errorInfo,
      isDOMError: isDOMError
    });
  }

  handleRetry = () => {
    // Reset error state to retry
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isDOMError: false 
    });
    
    // Optionally refresh the page for DOM-related errors
    if (this.state.isDOMError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { isDOMError } = this.state;
      
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error">
                Map Error Detected
              </Typography>
            </Box>
            
            {isDOMError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  A DOM synchronization issue occurred with the Google Maps component. 
                  This is usually harmless and can be resolved by refreshing the page.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  An unexpected error occurred while rendering the map component.
                </Typography>
              </Alert>
            )}

            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              {isDOMError 
                ? "The map component experienced a DOM node conflict. This sometimes happens when Google Maps tries to manage DOM elements that React is also tracking."
                : "Please try refreshing the page or contact support if this error persists."
              }
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                color={isDOMError ? "warning" : "primary"}
              >
                {isDOMError ? "Refresh Page" : "Try Again"}
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="error">
                  Development Details:
                </Typography>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', mt: 1, display: 'block' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
