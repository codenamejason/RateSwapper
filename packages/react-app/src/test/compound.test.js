

test("supply 10 ETH (i.e. mint cETH)", async () => {
    const cEtherContract = new ethers.Contract(
      compound.cEther.address,
      compound.cEther.abi,
      wallet,
    );
  
    const before = await cEtherContract.balanceOf(wallet.address);
    const cEthBefore = parseFloat(fromWei(before, 8));
  
    // we supply ETH by minting cETH
    await cEtherContract.mint({
      gasLimit: 1500000,
      value: ethers.utils.parseEther("10"),
    });
  
    const after = await cEtherContract.balanceOf(wallet.address);
    const cEthAfter = parseFloat(fromWei(after, 8));
  
    expect(cEthBefore).toBe(0);
    expect(cEthAfter).toBeGreaterThan(0);
});

test("borrow 20 DAI", async () => {
    const cDaiContract = new ethers.Contract(
      compound.cDAI.address,
      compound.cDAI.abi,
      wallet,
    );
  
    const before = await daiContract.balanceOf(wallet.address);
  
    await cDaiContract.borrow(
      ethers.utils.parseUnits("20", erc20.dai.decimals),
      { gasLimit: 1500000 },
    );
  
    const after = await daiContract.balanceOf(wallet.address);
  
    const daiGained = parseFloat(fromWei(after.sub(before)));
    expect(daiGained).toBe(20);
});

test("get supply/borrow balances for DAI", async () => {
    const cDaiContract = new ethers.Contract(
      compound.cDAI.address,
      compound.cDAI.abi,
      wallet,
    );
  
    const [
      _,
      cTokenBalance,
      borrowBalance,
      exchangeRateMantissa,
    ] = await cDaiContract.getAccountSnapshot(wallet.address);
  
    const expScale = new BigNumber(10).pow(18);
    const supplied = cTokenBalance.mul(exchangeRateMantissa).div(expScale);
  
    expect(parseFloat(fromWei(supplied))).toBeCloseTo(5);
    expect(parseFloat(fromWei(borrowBalance))).toBeCloseTo(20);
});

test("withdraw 1 ETH from collateral", async () => {
    const cEtherContract = new ethers.Contract(
      compound.cEther.address,
      compound.cEther.abi,
      wallet,
    );
  
    const ethBefore = await wallet.getBalance();
  
    // withdraw 1 Ether
    await cEtherContract.redeemUnderlying(ethers.utils.parseEther("1"), {
      gasLimit: 1500000,
    });
  
    const ethAfter = await wallet.getBalance();
  
    const ethGained = parseFloat(fromWei(ethAfter.sub(ethBefore)));
    expect(ethGained).toBeCloseTo(1);
});

