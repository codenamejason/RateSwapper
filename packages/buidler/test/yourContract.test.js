const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Rate Swap", function () {
  let yourContract;

  describe("YourContract", function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await ethers.getContractFactory("YourContract");

      yourContract = await YourContract.deploy();
    });

    // describe("getContractBalance()", function () {
    //   it("Should return the balance of the contract, 0", async function () {
    //     const value = '0.01';

    //     //await yourContract.getContractBalance;
    //     expect(await yourContract.getContractBalance()).to.equal(value);
    //   });
    // });
  });
});
