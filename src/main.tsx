import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Both families ship one @font-face per unicode-range, so a visitor reading the
// English version never downloads the Cyrillic subset and vice versa.
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";

import "./index.css";
import { App } from "./App";

// `.reveal` only hides itself under `.js`. Without scripting the page renders
// as plain, fully visible content rather than a column of empty sections.
document.documentElement.classList.add("js");

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
