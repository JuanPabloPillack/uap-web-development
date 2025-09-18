import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("FaucetToken", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  async function deployFaucetToken() {
    const [owner, user1, user2] = await viem.getWalletClients();

    const faucetToken = await viem.deployContract("FaucetToken", [
      "Faucet Token",
      "FAUCET",
    ]);

    return {
      faucetToken,
      owner,
      user1,
      user2,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { faucetToken, owner } = await deployFaucetToken();
      assert.equal(await faucetToken.read.owner(), owner.account.address);
    });

    it("Should have correct name and symbol", async function () {
      const { faucetToken } = await deployFaucetToken();
      assert.equal(await faucetToken.read.name(), "Faucet Token");
      assert.equal(await faucetToken.read.symbol(), "FAUCET");
    });

    it("Should start with zero total supply", async function () {
      const { faucetToken } = await deployFaucetToken();
      assert.equal(await faucetToken.read.totalSupply(), 0n);
    });
  });

  describe("Faucet Functionality", function () {
    it("Should allow a user to claim tokens once", async function () {
      const { faucetToken, user1 } = await deployFaucetToken();

      // User claims tokens
      await faucetToken.write.claimTokens([], { account: user1.account });

      // Check user balance
      const userBalance = await faucetToken.read.balanceOf([
        user1.account.address,
      ]);
      const faucetAmount = await faucetToken.read.getFaucetAmount();
      assert.equal(userBalance, faucetAmount);

      // Check total supply increased
      const totalSupply = await faucetToken.read.totalSupply();
      assert.equal(totalSupply, faucetAmount);

      // Check user marked as claimed
      assert.equal(
        await faucetToken.read.hasAddressClaimed([user1.account.address]),
        true
      );

      // Check user was added to faucet users array
      const faucetUsers = await faucetToken.read.getFaucetUsers();
      assert.equal((faucetUsers as any[]).length, 1);
      assert.equal((faucetUsers as any[])[0], user1.account.address);
    });

    it("Should not allow a user to claim tokens twice", async function () {
      const { faucetToken, user1 } = await deployFaucetToken();

      // First claim
      await faucetToken.write.claimTokens([], { account: user1.account });

      // Second claim should fail
      try {
        await faucetToken.write.claimTokens([], { account: user1.account });
        assert.fail("Expected claim to be rejected");
      } catch (error) {
        assert.ok(
          (error as Error).message.includes(
            "FaucetToken: Address has already claimed tokens"
          )
        );
      }
    });

    it("Should allow multiple users to claim tokens", async function () {
      const { faucetToken, user1, user2 } = await deployFaucetToken();

      // Both users claim tokens
      await faucetToken.write.claimTokens([], { account: user1.account });
      await faucetToken.write.claimTokens([], { account: user2.account });

      // Check both users have correct balance
      const user1Balance = await faucetToken.read.balanceOf([
        user1.account.address,
      ]);
      const user2Balance = await faucetToken.read.balanceOf([
        user2.account.address,
      ]);
      const faucetAmount = await faucetToken.read.getFaucetAmount();

      assert.equal(user1Balance, faucetAmount);
      assert.equal(user2Balance, faucetAmount);

      // Check total supply is correct
      const totalSupply = await faucetToken.read.totalSupply();
      assert.equal(totalSupply, (faucetAmount as bigint) * 2n);

      // Check both users were added to faucet users array
      const faucetUsers = await faucetToken.read.getFaucetUsers();
      assert.equal((faucetUsers as any[]).length, 2);
      assert.ok((faucetUsers as any[]).includes(user1.account.address));
      assert.ok((faucetUsers as any[]).includes(user2.account.address));
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to mint tokens to any address", async function () {
      const { faucetToken, owner, user1 } = await deployFaucetToken();

      // Owner mints tokens to user
      const mintAmount = 500n * 10n ** 18n;
      await faucetToken.write.mint([user1.account.address, mintAmount], {
        account: owner.account,
      });

      // Check user balance
      const userBalance = await faucetToken.read.balanceOf([
        user1.account.address,
      ]);
      assert.equal(userBalance, mintAmount);
    });

    it("Should allow owner to reset claim status", async function () {
      const { faucetToken, owner, user1 } = await deployFaucetToken();

      // User claims tokens
      await faucetToken.write.claimTokens([], { account: user1.account });
      assert.equal(
        await faucetToken.read.hasAddressClaimed([user1.account.address]),
        true
      );

      // Owner resets claim status
      await faucetToken.write.resetClaimStatus([user1.account.address], {
        account: owner.account,
      });
      assert.equal(
        await faucetToken.read.hasAddressClaimed([user1.account.address]),
        false
      );

      // User can claim again
      await faucetToken.write.claimTokens([], { account: user1.account });
      const userBalance = await faucetToken.read.balanceOf([
        user1.account.address,
      ]);
      const faucetAmount = await faucetToken.read.getFaucetAmount();
      assert.equal(userBalance, (faucetAmount as bigint) * 2n);
    });

    it("Should not allow non-owner to call owner functions", async function () {
      const { faucetToken, user1, user2 } = await deployFaucetToken();

      // Non-owner tries to mint
      try {
        await faucetToken.write.mint([user1.account.address, 1000n], {
          account: user1.account,
        });
        assert.fail("Expected mint to be rejected");
      } catch (error) {
        assert.ok(
          (error as Error).message.includes("Ownable: caller is not the owner")
        );
      }

      // Non-owner tries to reset claim status
      try {
        await faucetToken.write.resetClaimStatus([user1.account.address], {
          account: user1.account,
        });
        assert.fail("Expected resetClaimStatus to be rejected");
      } catch (error) {
        assert.ok(
          (error as Error).message.includes("Ownable: caller is not the owner")
        );
      }
    });
  });

  describe("Constants", function () {
    it("Should have correct faucet amount", async function () {
      const { faucetToken } = await deployFaucetToken();
      const faucetAmount = await faucetToken.read.getFaucetAmount();
      assert.equal(faucetAmount, 1_000_000n * 10n ** 18n);
    });
  });
});
