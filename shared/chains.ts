import { defineChain } from "viem";

export const mantle = defineChain({
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mantle.xyz"] } },
  blockExplorers: {
    default: { name: "Mantle Explorer", url: "https://explorer.mantle.xyz" },
  },
});

export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.sepolia.mantle.xyz"] } },
  blockExplorers: {
    default: {
      name: "Mantle Sepolia Explorer",
      url: "https://explorer.sepolia.mantle.xyz",
    },
  },
  testnet: true,
});
