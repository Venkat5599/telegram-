import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07080a",
        panel: "#0e1013",
        line: "#1c2127",
        mute: "#8a93a0",
        acid: "#65f0c0", // mantle-ish mint
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
