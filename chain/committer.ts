import {
  createWalletClient,
  createPublicClient,
  http,
  keccak256,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepolia } from "../shared/chains.ts";
import { config } from "../shared/config.ts";
import { smartMoneyIndexAbi } from "./abi.ts";

// Commits pending signals on-chain and resolves matured ones.
// Deploy chain = Mantle Sepolia testnet (matches DEPLOYER_PK funding).

function clients() {
  if (!config.deployerPk) throw new Error("DEPLOYER_PK missing");
  if (!config.smartMoneyIndexAddr)
    throw new Error("SMART_MONEY_INDEX_ADDR missing (deploy contract first)");
  const account = privateKeyToAccount(config.deployerPk);
  const transport = http(config.mantleTestnetRpc);
  return {
    account,
    wallet: createWalletClient({ account, chain: mantleSepolia, transport }),
    pub: createPublicClient({ chain: mantleSepolia, transport }),
    addr: config.smartMoneyIndexAddr,
  };
}

export function hashSignal(payload: unknown): `0x${string}` {
  return keccak256(toHex(JSON.stringify(payload)));
}

/** Commit one signal hash on-chain. Returns tx hash. */
export async function commitSignal(
  payload: unknown,
  confidence: number
): Promise<`0x${string}`> {
  const { wallet, pub, addr } = clients();
  const hash = hashSignal(payload);
  const txHash = await wallet.writeContract({
    address: addr,
    abi: smartMoneyIndexAbi,
    functionName: "commitSignal",
    args: [hash, Math.max(0, Math.min(100, Math.round(confidence)))],
  });
  await pub.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/** Resolve a signal on-chain (won/lost). Returns tx hash. */
export async function resolveSignal(
  onchainId: bigint,
  won: boolean
): Promise<`0x${string}`> {
  const { wallet, pub, addr } = clients();
  const txHash = await wallet.writeContract({
    address: addr,
    abi: smartMoneyIndexAbi,
    functionName: "resolveSignal",
    args: [onchainId, won],
  });
  await pub.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
