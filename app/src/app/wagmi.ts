import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
	appName: "zkard",
	projectId: "YOUR_PROJECT_ID",
	chains: [sepolia],
});
