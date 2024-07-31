# shutter-bridge

This repo locks underlying $SHU tokens on Ethereum and mints synthetic tokens in Optimsm Chain or
burn synthetic to unlock $SHU on the oposite direction.

#### What's inside?

- [Optimism Portal](https://docs.optimism.io/builders/app-developers/tutorials/cross-dom-bridge-erc20)
- [Proposal to deploy SHU on Optimism](https://shutternetwork.discourse.group/t/proposal-to-deploy-a-dex-pool-on-a-low-cost-chain-part-3/370)
- [Github Issue](https://github.com/blockful-io/shutter-bridge-op/issues/1)
- [Shutter Token on Ethereum Sepolia](https://sepolia.etherscan.io/token/0x94b713781143b8eb3c9e334c1523f067990c90b3)
- [Shutter Token on Optimism Sepolia](https://sepolia-optimism.etherscan.io/token/0x428225a7b4d4ab16f5548f6a4aafffd80e419e74)
- [Shutter Token on Ethereum](https://etherscan.io/token/0xe485e2f1bab389c08721b291f6b59780fec83fd7)
- [Shutter Token on Optimism](https://optimistic.etherscan.io/token/0xaf1d71bf947709315655514467d5158e5d3046d5)

## Getting Started

Start by installing the dependencies:

```bash
$ yarn
```

Then set the environment variables by copying the `.env.example` file and removing the `.example`
extension, then fill in the values:

- **RPC URLs:** You can try public RPCs but they might not work properly. Try using
  [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/) for this.
- **PRIVATE KEY:** The private key of the account that will be used to deploy the contracts.
- **ETHERSCAN KEY:** Optional but recommended. Used to verify the contracts on Etherscan. You will
  only need once in case you deploy your own SHU token.
- **SHUTTER TOKEN ADDRESS:** The address of the Shutter Token contract deployed on each chain.

**NOTE: Repair that you have testnet/mainnet tokens and one of them will be commented because the
scripts use the same file name.**

## Deploying the contracts

You can choose between deploying a new contract or use the existing contract that were previsouly
deployed by Blockful. The contract addresses were already set in the `.env.sample` file. you can
directly mint new tokens by calling the `mint` script.

### Deploy your own Shutter Token on Sepolia network by calling:

```bash
$ yarn deploy:l1 --network sepolia
```

The contract should be deployed on Sepolia. After deploying the Shutter Token, you need to set the
`SHUTTER_TOKEN_CONTRACT` in the `.env` file.

Optionally, you can verify the contract on Etherscan with:

```bash
$ npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

### For the deployment on the Optimism network, you need to call:

NOTE: Can only be used after the Sepolia contract has been deployed and `.env` filled.

```bash
$ yarn deploy:l2 --network op_sepolia
```

Fetch the contract address logged on the terminal then change the value for the
`BRIDGED_SHUTTER_TOKEN_CONTRACT` in the `.env` file.

## Bridging tokens from Ethereum to Optimism

Before bridging the tokens:

- Make sure that you have both token contracts correctly set in the `.env` file. The Shutter Token
  on Ethereum and the bridged Shutter Token on Optimism.
- Make sure that you have the right `l1StandardBridge` address uncommented in the `bridgeToL2.ts`
  script. The address should be the one that corresponds to the network you are bridging from.
- We already wrote the addresses in the `.env` file for both testnet and mainnet in advance. Make
  sure the right one is uncommented.

You can bridge tokens from L1 to L2 by calling the `bridgeToL2.ts` script. Your tokens will be
approved from being transferred by the bridge, then your tokens will be locked on one side and
minted on the other side.

```bash
$ yarn bridge:to:l2 --network sepolia
```

**NOTE: You will enconter the following error/warning in the block explorer:**

- "Although one or more Error Occurred [execution reverted] Contract Execution Completed"

This will happen 100% of the times because the $SHU token doesn't implement ERC165 and the OP Portal
tests for this interfaceId. This is merely a visual issue but the bridge will work as expected.

## Bridging tokens from Optimism to Ethereum

**[NOTE FROM OP](https://docs.optimism.io/builders/app-developers/tutorials/cross-dom-bridge-erc20):
The final step to withdrawing tokens from L2 to L1 is to relay the withdrawal on L1. This can only
happen after the fault proof period has elapsed. On OP Mainnet, this takes 7 days. We're currently
testing fault proofs on OP Sepolia, so withdrawal times reflect Mainnet times.**

Before bridging the tokens:

- Make sure that you have both token contracts correctly set in the `.env` file. The Shutter Token
  on Ethereum and the bridged Shutter Token on Optimism.
- Make sure that you are on the desired set of networks between testnet and mainnet. You can switch
  them by commenting and uncommenting in the `.env` file and the respective scripts.
- In the `proveWithdraw.ts` and `withdrawToL1.ts` scripts at L25 and L26, make sure that the
  `l1ChainId` and `l2ChainId` represents your desired networks.

There is two ways of proving the withdrawal:

- Using a hybrid approach
- Using the OP SDK

### Using a hybrid approach

Before bridging the tokens, make sure that you have a valid bridged ERC20 set in
`BRIDGED_SHUTTER_TOKEN_CONTRACT` in the `.env` file.

You can bridge tokens by calling the `bridgeToL2.ts` script directly in the ERC677 token contract.
This will burn the tokens on one side and unlock them on the other side.

```bash
$ yarn bridge:to:l1 --network op_sepolia
```

Get the resulting transaction hash on the terminal or any other tx hash that represented the burn of
the synthetic assets on OP and place on the `withdrawHash` variable inside the `proveWithdraw.ts`
script then run with:

```bash
$ yarn prove
```

### Using the OP SDK

You can use the OP SDK to prove the withdrawal. The SDK will automatically withdraw the tokens and
prove the withdrawal.

```bash
$ yarn withdraw:to:l1
```

## Minting more tokens on L1

You can mint more tokens on L1 Ethereum or Sepolia by calling the `mint` script. But you cant mint
more tokens on the OP network. The tokens are minted on the Ethereum network and then bridged to the
OP network. You will receive 1000e18 tokens per mint.

```bash
$ yarn mint --network sepolia
```

## License

This project is licensed under MIT.
