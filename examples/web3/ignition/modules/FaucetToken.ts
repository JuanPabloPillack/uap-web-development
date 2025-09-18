import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FaucetTokenModule", (m) => {
  const faucetToken = m.contract("FaucetToken", [
    "Faucet Token", // name
    "FAUCET", // symbol
  ]);

  return { faucetToken };
});
