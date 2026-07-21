import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SnackbarProvider } from "notistack";
import { ThemeModeProvider } from "./context/ThemeModeContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeModeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3500}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <App />
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeModeProvider>
  </StrictMode>
);
