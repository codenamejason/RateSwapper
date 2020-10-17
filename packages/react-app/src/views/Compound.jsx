import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, Image, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Row, Col, Layout, Menu, Popconfirm } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { useUserAddress, useTokenBalance } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useCustomContractLoader, usePoller } from "./../hooks";
import { TokenBalance, Balance, Account, Faucet, Ramp, Contract, GasGauge, Address, Header } from "./../components";
import { Transactor } from "./../helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import gql from 'graphql-tag'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useQuery } from '@apollo/react-hooks'
import { EtherscanProvider } from "@ethersproject/providers";
//import Biconomy from "@biconomy/mexa";
import { legos } from "@studydefi/money-legos";
import compoundLogo from '../images/compoundLogo.svg';

const { ChainId, Fetcher, WETH, Route } = require('@uniswap/sdk');
const Compound = require('@compound-finance/compound-js');

const Web3 = require('web3');
const web3 = new Web3('https://rinkeby.infura.io/v3/1ad03ac212da4523b6c8337eace81a14'); // //('http://127.0.0.1:8545');

// Biconomy Initialization
// let options = {
// apiKey: '_a1vIlfCz.49a8bba2-29e8-471e-afea-bcfaf8aeeea5',
// strictMode: true
// };
// const biconomy = new Biconomy(window.ethereum, options);
// const biconomyWeb3 = new Web3(biconomy);


// export const client = new ApolloClient({
//     link: new HttpLink({
//     uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
//     }),
//     fetchOptions: {
//     mode: 'no-cors'
//     },
//     cache: new InMemoryCache()
// })

// const DAI_QUERY = gql`
// query tokens($tokenAddress: Bytes!) {
//     tokens(where: { id: $tokenAddress }) {
//     derivedETH
//     totalLiquidity
//     }
// }
// `

// const ETH_PRICE_QUERY = gql`
// query bundles {
//     bundles(where: { id: "1" }) {
//     ethPrice
//     }
// }
// `

// const chainId = ChainId.ROPSTEN;
// const daiTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// const init = async () => {
//   const dai = await Fetcher.fetchTokenData(chainId, daiTokenAddress);
//   const weth = WETH[chainId];
//   const pair = await Fetcher.fetchPairData(dai, weth);

//   const route = new Route([pair], weth);
//   console.log(route.midPrice.toSignificant(6));
// }



const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x6990a4ae6c48cf338b35a8c3fa9fe672399b737af69d436c05640124e21e8e2f');
const myWalletAddress = web3.eth.accounts.wallet[0].address;
console.log('Connected Walelt', myWalletAddress)

// Ropsten
const contractAddress = '0xbe839b6d93e3ea47effcca1f27841c917a8794f3';
const cethAbiJson = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"mint","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"reserveFactorMantissa","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"}],"name":"borrowBalanceCurrent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"exchangeRateStored","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pendingAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOfUnderlying","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getCash","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newComptroller","type":"address"}],"name":"_setComptroller","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalBorrows","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"repayBorrow","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"comptroller","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reduceAmount","type":"uint256"}],"name":"_reduceReserves","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"initialExchangeRateMantissa","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"accrualBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"totalBorrowsCurrent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"redeemAmount","type":"uint256"}],"name":"redeemUnderlying","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalReserves","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"borrowBalanceStored","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"accrueInterest","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"borrowIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"borrower","type":"address"},{"name":"cTokenCollateral","type":"address"}],"name":"liquidateBorrow","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"supplyRatePerBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"liquidator","type":"address"},{"name":"borrower","type":"address"},{"name":"seizeTokens","type":"uint256"}],"name":"seize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newPendingAdmin","type":"address"}],"name":"_setPendingAdmin","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"exchangeRateCurrent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getAccountSnapshot","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"borrowAmount","type":"uint256"}],"name":"borrow","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"redeemTokens","type":"uint256"}],"name":"redeem","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"borrower","type":"address"}],"name":"repayBorrowBehalf","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"_acceptAdmin","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newInterestRateModel","type":"address"}],"name":"_setInterestRateModel","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"interestRateModel","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"borrowRatePerBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newReserveFactorMantissa","type":"uint256"}],"name":"_setReserveFactor","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isCToken","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"comptroller_","type":"address"},{"name":"interestRateModel_","type":"address"},{"name":"initialExchangeRateMantissa_","type":"uint256"},{"name":"name_","type":"string"},{"name":"symbol_","type":"string"},{"name":"decimals_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"interestAccumulated","type":"uint256"},{"indexed":false,"name":"borrowIndex","type":"uint256"},{"indexed":false,"name":"totalBorrows","type":"uint256"}],"name":"AccrueInterest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"minter","type":"address"},{"indexed":false,"name":"mintAmount","type":"uint256"},{"indexed":false,"name":"mintTokens","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"redeemer","type":"address"},{"indexed":false,"name":"redeemAmount","type":"uint256"},{"indexed":false,"name":"redeemTokens","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"borrower","type":"address"},{"indexed":false,"name":"borrowAmount","type":"uint256"},{"indexed":false,"name":"accountBorrows","type":"uint256"},{"indexed":false,"name":"totalBorrows","type":"uint256"}],"name":"Borrow","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"payer","type":"address"},{"indexed":false,"name":"borrower","type":"address"},{"indexed":false,"name":"repayAmount","type":"uint256"},{"indexed":false,"name":"accountBorrows","type":"uint256"},{"indexed":false,"name":"totalBorrows","type":"uint256"}],"name":"RepayBorrow","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"liquidator","type":"address"},{"indexed":false,"name":"borrower","type":"address"},{"indexed":false,"name":"repayAmount","type":"uint256"},{"indexed":false,"name":"cTokenCollateral","type":"address"},{"indexed":false,"name":"seizeTokens","type":"uint256"}],"name":"LiquidateBorrow","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldPendingAdmin","type":"address"},{"indexed":false,"name":"newPendingAdmin","type":"address"}],"name":"NewPendingAdmin","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldAdmin","type":"address"},{"indexed":false,"name":"newAdmin","type":"address"}],"name":"NewAdmin","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldComptroller","type":"address"},{"indexed":false,"name":"newComptroller","type":"address"}],"name":"NewComptroller","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldInterestRateModel","type":"address"},{"indexed":false,"name":"newInterestRateModel","type":"address"}],"name":"NewMarketInterestRateModel","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldReserveFactorMantissa","type":"uint256"},{"indexed":false,"name":"newReserveFactorMantissa","type":"uint256"}],"name":"NewReserveFactor","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"admin","type":"address"},{"indexed":false,"name":"reduceAmount","type":"uint256"},{"indexed":false,"name":"newTotalReserves","type":"uint256"}],"name":"ReservesReduced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"error","type":"uint256"},{"indexed":false,"name":"info","type":"uint256"},{"indexed":false,"name":"detail","type":"uint256"}],"name":"Failure","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Approval","type":"event"}];

const compoundCEthContract = new web3.eth.Contract(cethAbiJson, contractAddress);
console.log('A:Contract: => ', compoundCEthContract);

// const biconomyCethContract = new biconomyWeb3.eth.Contract(cethAbiJson, contractAddress);
// console.log('B:Contract: => ', biconomyCethContract);

// COMP Token Contract ABI - Ropsten
const compTokenAddress = '0x1fe16de955718cfab7a44605458ab023838c2793';
const compTokenAbi = [{"inputs":[{"internalType":"address","name":"account","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DELEGATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint32","name":"","type":"uint32"}],"name":"checkpoints","outputs":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint96","name":"votes","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getCurrentVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPriorVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
const compTokenContract = new web3.eth.Contract(compTokenAbi, compTokenAddress);
console.log('COMP Token COntract => ', compTokenContract)

let _cTokenBalance = 0;




const { Content, Footer, Sider } = Layout;

const CompoundUI = ({address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, kovanProvider, ropstenProvider }) => {

  const cethContract = useCustomContractLoader(ropstenProvider, contractAddress, cethAbiJson);
  console.log('cethContract', cethContract)

  const compContract = useCustomContractLoader(ropstenProvider, compTokenAddress, compTokenAbi)
  console.log('comp contract: ', compContract)

  //const cethBalance = useTokenBalance(cethContract, contractAddress)
  //useBalance(ropstenProvider, '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  //useTokenBalance(cethContract, '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  //console.log('cethBal', cethBalance.toNumber());

  //📟 Listen for broadcast events
  // const poolDepositEvents = useEventListener(readContracts, "YourContract", "PoolDeposit", ropstenProvider, 1);
  // console.log("📟 Deposit events:", poolDepositEvents)

  // const depositEthAndStakeEvents = useEventListener(readContracts, "YourContract", "DepositEthAndStake", ropstenProvider, 1);
  // console.log("📟 Deposit events:", depositEthAndStakeEvents)


  const [cethBalUser, setCethBalUser] = useState(0)
  const [compBal, setCompBal] = useState(0)

  usePoller(async () => {
    if(compContract){
      const compAccrued = await compContract.balanceOf(myWalletAddress)
      setCompBal(compAccrued.toString())
      console.log('###### COMP Balance #####  ', compBal)
    }
  }, 60000, [compContract])

  usePoller(async () => {
    if(cethContract) {
      const bal = await cethContract.balanceOf('0xa0df350d2637096571F7A701CBc1C5fdE30dF76A')//'0xa0df350d2637096571F7A701CBc1C5fdE30dF76A'
      setCethBalUser(bal.toNumber());
      console.log('^^^^^^^^^ cETH BAL ^^^^^^^^^^^^^', bal.toNumber());
    }
  }, 60000, [cethContract]);

  const userCethBal = async () => {
    const bal = await cethContract.balanceOf(myWalletAddress);//'0xa0df350d2637096571F7A701CBc1C5fdE30dF76A'
    setCethBalUser(bal.toNumber())
    return bal.toNumber();
  }

  const userCompBalNotClaimed = async () => {
    const compBalNotClaimed = Compound.comp.getCompAccrued(myWalletAddress, ropstenProvider);
    setCompBal(compBalNotClaimed)
    return compBalNotClaimed;
  }

  const userCompBal = async () => {
    const userCompBal = Compound.comp.getCompBalance(myWalletAddress, ropstenProvider);
    setCompBal(userCompBal)
    return userCompBal;
  }

  const depositToCompound = async (account, amount) => {
    console.log(`Supplying ETH to the Compound Protocol...`);
    // Mint some cETH by supplying ETH tho the protocol
    await compoundCEthContract.methods.mint().send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(250000),
      gasPrice: web3.utils.toHex(20000000000),
      value: web3.utils.toHex(web3.utils.toWei(amount, 'ether'))
    })
      .then(() => {console.log('cETH "Mint" operation successful.'); });
    

    const _balanceOfUnderlying = await compoundCEthContract.methods.balanceOfUnderlying(myWalletAddress).call();
    let balanceOfUnderlying = web3.utils.fromWei(_balanceOfUnderlying.toString());
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);
    
    _cTokenBalance = await compoundCEthContract.methods.balanceOf(myWalletAddress).call();
    let cTokenBalance = (_cTokenBalance / 1e8).toString();
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    let exchangeRateCurrent = await compoundCEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent);
  }

  const withdrawEthFromCompound = async () => {  

    const _balanceOfUnderlying = await compoundCEthContract.methods.balanceOfUnderlying(myWalletAddress).call();
    let balanceOfUnderlying = web3.utils.fromWei(_balanceOfUnderlying.toString());
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);
    
    _cTokenBalance = await compoundCEthContract.methods.balanceOf(myWalletAddress).call();
    let cTokenBalance = (_cTokenBalance / 1e8).toString();
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    console.log('Redeeming the cETH for ETH...');

    console.log('Exchanging all cETH based on cToken amount...');
    await compoundCEthContract.methods.redeem(_cTokenBalance).send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(150000),      // posted at compound.finance/developers#gas-costs
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    console.log('Exchanging all cETH based on underlying ETH amount...');
    let ethAmount = web3.utils.toWei(balanceOfUnderlying).toString()
    await compoundCEthContract.methods.redeemUnderlying(ethAmount).send({
      from: myWalletAddress,
      gasLimit: web3.utils.toHex(150000),      // posted at compound.finance/developers#gas-costs
      gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    });

    let exchangeRateCurrent = await compoundCEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent);
  }

  const depositDaiToCompound = () => {

  }

  const withdrawDaiFromCompound = () => {

  }

  const claimCompTokens = () => {


  }
  

  // const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY)
  // const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
  //   variables: {
  //     tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  //   }
  // });
  // console.table(ethPriceData)

  // const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
  // console.log(daiPriceInEth);
  // const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
  // console.log(daiTotalLiquidity);
  // const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice
  // console.log(ethPriceInUSD)

    return (
        <Layout>
            <Layout>
                <div>
                <h2>Earn RCT Tokens When you Deposit</h2>
                <TokenBalance name={"RawCipherToken"} img={"🛠RCT"} address={address} contracts={readContracts} />
                <TokenBalance name={"RawCipherLPToken"} img={"🛠RCT LP"} address={address} contracts={readContracts} />
                <h4>
                <span>cETH {cethBalUser}</span>&nbsp;&nbsp;
                <Image src={compoundLogo} />&nbsp;&nbsp;
                <span>COMP {web3.utils.fromWei(compBal.toString())}</span>
                </h4>

                {/* <TokenBalance balance={cethBalUser} img={"cETH"} /> */}

                {/* <TokenBalance name={""} img={"cETH"} address={"0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72"} contracts={cethContract} /> */}
                {/* <TokenBalance name={""} img={"DAI"} address={"0x6B175474E89094C44Da98b954EedeAC495271d0F"} contracts={""} /> */}
            
            <div>
                <Divider />
                <Row gutter={[16, 16]}>
                <Col span={8} >
                    <label>Deposit ETH</label><br />
                    <Input id='ethDepositAmount' prefix="Ξ" suffix="ETH" style={{ width: 200 }} />
                    <br /><br />
                    <Popconfirm title='Are you sure you want to make an ETH deposit?' okText='Send Tx' cancelText='Go Back'>
                        <Button
                        onClick={() => {
                            depositToCompound(myWalletAddress, '.1').catch((err) => {
                            console.error(err);
                            });
                        }}>
                        <UploadOutlined /> Deposit ETH
                        </Button>
                    </Popconfirm>
                    
                </Col>
                <Col span={8} >
                    <label>Deposit DAI</label><br />
                    <Input id='daiDepositAmount' prefix="D" suffix="DAI" style={{ width: 200 }} />
                    <br /><br />
                    <Popconfirm title='Are you sure you want to make a DAI deposit?' okText='Send Tx' cancelText='Go Back'>
                        <Button
                        onClick={() => {
                            depositDaiToCompound().catch((err) => {
                            console.error(err);
                            });
                        }}>
                        <UploadOutlined /> Deposit DAI
                        </Button>
                    </Popconfirm>
                </Col>
                <Col span={8} >
                <label>Deposit RCT</label><br />
                    <Input id='rctDepositAmount' prefix="R" suffix="RCT" style={{ width: 200 }} />
                    <br /><br />
                    <Button
                    onClick={() => {

                    }}>
                    <UploadOutlined /> Deposit to LP
                    </Button>
                </Col>
                </Row>
                <Row gutter={[16, 16]}>
                <Col span={8} >
                <Button
                    onClick={() => {
                        withdrawEthFromCompound()
                        .catch((err) => {
                            console.error('ERROR::WITHDRAWFROMCOMPOUND::  ', err)
                        })
                    }}>
                    Withdraw & Claim COMP
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                        withdrawDaiFromCompound()
                        .catch((err) => {
                            console.error('ERROR::WITHDRAWFROMCOMPOUND::  ', err)
                        })
                    }}>
                    Withdraw & Claim COMP
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                       
                    }}>
                    Unstake & Claim Rewards
                    </Button>
                </Col>
                </Row>
                <Divider />
                <Button
                    onClick={async () => {
                        
                    }}
                >Price of ETH
                </Button>
                <Divider />
                <div>
                    <Row gutter={[16, 16]}>
                    <Col span={8} >
                        <Button
                        onClick={() => {

                        }}>
                        Buy RCT
                        </Button>
                    </Col>
                    <Col span={8} >
                    <Button
                        onClick={() => {

                        }}>
                        ToDo
                        </Button>
                    </Col>
                    <Col span={8} >
                    <Button
                        onClick={() => {

                        }}>
                        Get ETH/RCT LP tokens
                        </Button>
                    </Col>
                    </Row>
                </div>
                </div>
                </div>
            </Layout>
            <Divider />
            <Footer>
               {/* Events */}
              {/* <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
                  <h2>Events:</h2>
                  <List
                  bordered
                  dataSource={poolDepositEvents}
                  renderItem={item => (
                      <List.Item>
                      <Address
                          value={item[0]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                          /> =>
                      {item[1].toString()}
                      </List.Item>
                  )}
                  />
              </div> */}
            </Footer>
        </Layout>
    )
}

export default CompoundUI