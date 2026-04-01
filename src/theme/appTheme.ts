import { createTheme } from '@mui/material/styles';
import { LN, gradients } from './branding';

export const appTheme = createTheme({
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  palette: {
    mode: 'light',
    primary: {
      main: LN.green.main,
      light: '#66BB6A',
      dark: LN.green.dark,
      contrastText: '#fff',
    },
    secondary: {
      main: LN.orange.main,
      light: LN.orange.light,
      dark: LN.orange.dark,
      contrastText: '#fff',
    },
    background: {
      default: '#f3f6f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            minHeight: 44,
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
          },
        }),
        containedPrimary: {
          background: gradients.ctaPrimary,
          boxShadow: `0 6px 20px rgba(67, 160, 71, 0.35)`,
          '&:hover': {
            background: gradients.ctaPrimaryHover,
            boxShadow: `0 8px 26px rgba(67, 160, 71, 0.42)`,
          },
        },
        containedSecondary: {
          background: gradients.ctaSecondary,
          boxShadow: `0 6px 20px rgba(239, 108, 0, 0.3)`,
          '&:hover': {
            background: gradients.ctaSecondaryHover,
            boxShadow: `0 8px 26px rgba(239, 108, 0, 0.38)`,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down('md')]: {
            padding: 10,
          },
        }),
      },
    },
  },
});
