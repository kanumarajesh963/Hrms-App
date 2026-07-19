import { createTheme } from "@mui/material/styles";

// MUI theme mapped onto the app's existing design tokens (ink/amber/teal)
// so MUI components (forms, dialogs) look native alongside hand-styled parts.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#16241f" },
    secondary: { main: "#c77d24" },
    success: { main: "#0f6e5c" },
    error: { main: "#b3432b" },
    background: { default: "#f6f4ef", paper: "#ffffff" },
    text: { primary: "#16241f", secondary: "#6f6b5e" },
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 10 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, background: "#f6f4ef" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
});

export default theme;
