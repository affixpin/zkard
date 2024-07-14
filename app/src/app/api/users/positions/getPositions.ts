import { createPublicClient, formatUnits, getContract, http } from "viem";
import { usersDB } from "../db";

const link = {
  getProxyUSD: async (address: `0x${string}`) => {
    const usdcAddress = "0xf8fb3713d459d7c1018bd0a49d19b4c44290ebe5";

    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ] as const;

    const providerURL = "https://ethereum-sepolia-rpc.publicnode.com";
    const client = createPublicClient({
      transport: http(providerURL),
    });
    const contract = getContract({
      address: usdcAddress,
      abi,
      client,
    });

    const balance = await contract.read.balanceOf([address]);

    const balanceFloat = parseFloat(formatUnits(balance, 18));
    return balanceFloat;
  },
  id: "Sepolia LINK",
  logoURL: "https://cryptologos.cc/logos/chainlink-link-logo.png",
};

const cirle = {
  getProxyUSD: async (address: `0x${string}`) => {
    const usdcAddress = "0xda9d4f9b69ac6c22e444ed9af0cfc043b7a7f53f";

    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ] as const;

    const providerURL = "https://ethereum-sepolia-rpc.publicnode.com";
    const client = createPublicClient({
      transport: http(providerURL),
    });
    const contract = getContract({
      address: usdcAddress,
      abi,
      client,
    });

    const balance = await contract.read.balanceOf([address]);

    const balanceFloat = parseFloat(formatUnits(balance, 6));
    return balanceFloat;
  },
  id: "Sepolia Circle USDC",
  logoURL:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/2048px-Circle_USDC_Logo.svg.png",
};

const wbtc = {
  getProxyUSD: async (address: `0x${string}`) => {
    const usdcAddress = "0x29f2d40b0605204364af54ec677bd022da425d03";

    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ] as const;

    const providerURL = "https://ethereum-sepolia-rpc.publicnode.com";
    const client = createPublicClient({
      transport: http(providerURL),
    });
    const contract = getContract({
      address: usdcAddress,
      abi,
      client,
    });

    const balance = await contract.read.balanceOf([address]);
    const balanceFloat = parseFloat(formatUnits(balance, 6));
    return balanceFloat;
  },
  id: "Sepolia WBTC",
  logoURL:
    "https://img.bitgetimg.com/multiLang/coinPriceLogo/25608447a790af93320543724174878a1701537690449.png",
};

const positionConfigs = [link, cirle, wbtc];

export async function getPositions(userId: string) {
  const db = await usersDB();
  const user = db.data.users.find((user) => user.id === userId);

  return Promise.all(
    positionConfigs.map(async (config) => {
      const balance = user?.defiAddress
        ? await config.getProxyUSD(user.defiAddress)
        : 0;

      return {
        enabled: Boolean(user?.positions?.[config.id]),
        balance,
        id: config.id,
        logoURL: config.logoURL,
      };
    })
  );
}
