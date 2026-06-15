export const smartMoneyIndexAbi = [
  {
    type: "event",
    name: "Committed",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "hash", type: "bytes32", indexed: false },
      { name: "confidence", type: "uint8", indexed: false },
      { name: "ts", type: "uint64", indexed: false },
    ],
  },
  {
    type: "function",
    name: "commitSignal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "confidence", type: "uint8" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "resolveSignal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "won_", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "publishIndex",
    stateMutability: "nonpayable",
    inputs: [
      { name: "day", type: "uint256" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getAccuracy",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
  },
] as const;
