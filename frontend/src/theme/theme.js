import { createTheme } from '@mui/material/styles';

// Modern healthcare color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#4285F4', // Modern blue
      light: '#7EADFF',
      dark: '#2A56C6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#34A853', // Healthy green
      light: '#5FC878',
      dark: '#1E7E34',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EA4335', // Soft red for errors/alerts
      light: '#FF6B5B',
      dark: '#C62828',
    },
    warning: {
      main: '#FBBC05', // Warm amber
      light: '#FDD663',
      dark: '#F57C00',
    },
    info: {
      main: '#00B8D4', // Bright aqua blue
      light: '#6EFFE8',
      dark: '#0088A3',
    },
    success: {
      main: '#34A853', // Success green
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#F8FAFC', // Light background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#202124', // Dark grey for main text
      secondary: '#5F6368', // Medium grey for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // More modern to avoid ALL CAPS buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners for modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
        },
      },
    },
  },
});

export default theme; 