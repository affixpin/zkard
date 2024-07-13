import { atom } from "jotai";
import { SafeSmartAccountClient } from "@/lib/permissionless";

export const safeAtom = atom<SafeSmartAccountClient | undefined>(undefined);
