import { createTheme } from "@mui/material/styles";

// Palettes mirror the CSS custom properties in index.css so hand-styled
// parts (using var(--x)) and MUI components always stay in sync.
const PALETTES = {
  light: {
    ink: "#16241f",
    muted: "#6f6b5e",
    bg: "#f6f4ef",
    surface: "#ffffff",
    amber: "#c77d24",
    teal: "#0f6e5c",
    danger: "#b3432b",
  },
  dark: {
    ink: "#f2efe7",
    muted: "#9a9587",
    bg: "#14181a",
    surface: "#1c2220",
    amber: "#e2a55a",
    teal: "#39b096",
    danger: "#e2775c",
  },
};

export function buildTheme(mode = "light") {
  const c = PALETTES[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: c.ink },
      secondary: { main: c.amber },
      success: { main: c.teal },
      error: { main: c.danger },
      background: { default: c.bg, paper: c.surface },
      text: { primary: c.ink, secondary: c.muted },
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
          root: { borderRadius: 10, background: "var(--bg)" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, backgroundColor: "var(--surface)" },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: { backgroundColor: "var(--surface)" },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { backgroundColor: "var(--surface)" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
    },
  });
}

export default buildTheme("light");
