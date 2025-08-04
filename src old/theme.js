import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3F51B5', // Indigo 600
    },
    secondary: {
      main: '#FFC107', // Amber 500
    },
    success: {
      main: '#1DE9B6', // Teal A400
    },
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
});

export default theme;
