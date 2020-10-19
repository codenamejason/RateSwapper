import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, Image, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Row, Col, Layout, Menu, Popconfirm, Modal } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { useUserAddress, useTokenBalance } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useCustomContractLoader, useContract, usePoller } from "./../hooks";
import { TokenBalance, Balance, Account, Faucet, Ramp, Contract, GasGauge, Address, Header } from "./../components";
import { Transactor } from "./../helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import gql from 'graphql-tag'
//import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useQuery } from '@apollo/react-hooks'
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { INFURA_ID, ETHERSCAN_KEY, CORS_PROXY_URI, BASE_OPTIONS, BASE_URI } from '../constants'
//import Biconomy from "@biconomy/mexa";
import { legos } from "@studydefi/money-legos";
import compoundLogo from '../images/compoundLogo.svg';
import compoundIcon from '../images/comp-icn.svg';

// Import the contract abi's
const abis = require('../contracts/compoundAbis');
const addresses = require('../constants/addresses');

const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } = require('@uniswap/sdk');
const Compound = require('@compound-finance/compound-js');
const compound = new Compound('ropsten');

const ethers = require("ethers");

// // Init with private key (server side)
// var compound = new Compound('https://mainnet.infura.io/v3/_your_project_id_', {
//   privateKey: '0x_your_private_key_', // preferably with environment variable
// });

// // Init with HD mnemonic (server side)
// var compound = new Compound('mainnet' {
//   mnemonic: 'clutch captain shoe...', // preferably with environment variable
// });

const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/1ad03ac212da4523b6c8337eace81a14'); // //('http://127.0.0.1:8545');

const mainnetWeb3 = new Web3('http://localhost:999');

const randomWallet = ethers.Wallet.createRandom();

console.log(`Mnemonic: ${randomWallet.mnemonic.phrase}`);
console.log(`Address: ${randomWallet.address}`);

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

console.log('Token Addresses Test ****', Compound.DAI, Compound.ETH, Compound.cETH);
// DAI, ETH, cETH

const cUsdtAddress = Compound.util.getAddress(Compound.cUSDT);
// Mainnet cUSDT address. Second parameter can be a network like 'ropsten'.
console.log('cUSDT Address $$$$$$$ ', cUsdtAddress)


const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329');//('0x6990a4ae6c48cf338b35a8c3fa9fe672399b737af69d436c05640124e21e8e2f');
const connectedWalletAddress = web3.eth.accounts.wallet[0].address;
console.log('Connected Wallet', connectedWalletAddress)

// Ropsten
const contractAddress = '0xbe839b6d93e3ea47effcca1f27841c917a8794f3';
const cethAbiJson = abis.CETH_TOKEN_ABI;

const compoundCEthContract = new web3.eth.Contract(cethAbiJson, contractAddress);
console.log('compoundCEthContract::Contract: => ', compoundCEthContract);

const daiContractAddress = addresses.DAI_ADDRESS_ROPSTEN;
const daiAbiJson = abis.DAI_TOKEN_ABI;
const daiContract = new web3.eth.Contract(daiAbiJson, daiContractAddress);

const compoundCDaiContractAddress = addresses.CDAI_ADDRESS_ROPSTEN;
const compoundCDaiAbiJson = abis.CDAI_TOKEN_ABI;
const compoundCDaiContract = new web3.eth.Contract(compoundCDaiAbiJson, compoundCDaiContractAddress);

const usdcContractAddress = addresses.USDC_ADDRESS_ROPSTEN;
const usdcAbiJson = abis.USDC_TOKEN_ABI;
const usdcContract = new web3.eth.Contract(usdcAbiJson, usdcContractAddress);

const compoundCUsdcContractAddress = addresses.CUSDC_ADDRESS_ROPSTEN;
const compoundCUsdcAbiJson = abis.CUSDC_TOKEN_ABI;
const compoundCUsdcContract = new web3.eth.Contract(compoundCUsdcAbiJson, compoundCUsdcContractAddress);


// const biconomyCethContract = new biconomyWeb3.eth.Contract(cethAbiJson, contractAddress);
// console.log('B:Contract: => ', biconomyCethContract);

// COMP Token Contract ABI - Ropsten
const compTokenAddress = '0x1fe16de955718cfab7a44605458ab023838c2793';
const compTokenAbi = abis.COMP_TOKEN_ABI;
const compTokenContract = new web3.eth.Contract(compTokenAbi, compTokenAddress);
console.log('COMP Token COntract => ', compTokenContract)

// MAKE GLOBAL
let _cTokenBalance = 0;

const { Content, Footer, Sider } = Layout;
/** Main Compound UI component */
const CompoundUI = ({address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, kovanProvider, ropstenProvider }) => {

  const cethContract = useContract(ropstenProvider, contractAddress, cethAbiJson);
  console.log('cethContract', cethContract)

  const compContract = useContract(ropstenProvider, compTokenAddress, compTokenAbi)
  console.log('comp contract: ', compContract)

  const cUsdcContract = useContract(ropstenProvider, addresses.CUSDC_ADDRESS_ROPSTEN, abis.CUSDC_TOKEN_ABI);


  //const cethBalance = useTokenBalance(cethContract, contractAddress)
  //useBalance(ropstenProvider, '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  //useTokenBalance(cethContract, '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  //console.log('cethBal', cethBalance.toNumber());

  //📟 Listen for broadcast events
  const compoundEvents = useEventListener(readContracts, "YourContract", "PoolDeposit", ropstenProvider, 1);
  console.log("📟 Deposit events:", compoundEvents)

  // const depositEthAndStakeEvents = useEventListener(readContracts, "YourContract", "DepositEthAndStake", ropstenProvider, 1);
  // console.log("📟 Deposit events:", depositEthAndStakeEvents)
  const [injectedProvider, setInjectedProvider] = useState();

  const [cethBalUser, setCethBalUser] = useState(0)
  const [compBal, setCompBal] = useState(0)
  const [cUsdcBal, setCUsdcBal] = useState(0)
  const [cDaiBal, setCDaiBal] = useState(0)
  const [ethDepositAmount, setEthDepositAmount] = useState(0)



  userProvider = useUserProvider(injectedProvider, ropstenProvider);
  //const connectedWalletAddress = useUserAddress(userProvider);
  console.log('User Wallet Address: ', connectedWalletAddress)
  //console.log('Built in burner wallet: ', address);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // usePoller(async () => {
  //   const cUsdtBal = await cUsdContract.balanceOf('0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');
  //   setCUsdcBal(cUsdtBal);
  //   console.log('CUSDC Balance ==>>>>>>', cUsdtBal);
  // }, 60000, [cUsdContract]);

  usePoller(async () => {
    if(compContract){
      const compAccrued = await compContract.balanceOf('0xa0df350d2637096571F7A701CBc1C5fdE30dF76A')
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

  (async function() {
    const cDaiData = await Compound.api.cToken({
      "addresses": Compound.util.getAddress(Compound.cDAI)
    });
  
    console.log('^^^^^^^ cDaiData ^^^^^^^^^', cDaiData.cToken[0].symbol); // JavaScript Object
  })().catch(console.error);

  // (async function() {
  //   const cUsdcMarketData = await Compound.api.marketHistory({
  //     "asset": Compound.util.getAddress(Compound.cUSDC),
  //     "min_block_timestamp": 1559339900,
  //     //"max_block_timestamp": 1598320674,
  //     "num_buckets": 10,
  //   });
  
  //   console.log('cUsdcMarketData', cUsdcMarketData); // JavaScript Object
  // })().catch(console.error);



  // The options object itself and all options are optional
  const trxOptions = {
    // mantissa,   // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
    // abi,        // Definition string or an ABI array from a solc build
    // provider,   // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
    // network,    // Ethers.js fallback network provider, "provider" has precedence over "network"
    // from,       // Address that the Ethereum transaction is send from
    // gasPrice,   // Ethers.js override `Compound._ethers.utils.parseUnits('10.0', 'gwei')`
    // gasLimit,   // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    // value,      // Number or string
    // data,       // Number or string
    // chainId,    // Number
    // nonce,      // Number
    // privateKey, // String, meant to be used with `Compound.eth.trx` (server side)
    // mnemonic,   // String, meant to be used with `Compound.eth.trx` (server side)
  };

  const userCethBal = async () => {
    const bal = await cethContract.balanceOf('0xa0df350d2637096571F7A701CBc1C5fdE30dF76A');//'0xa0df350d2637096571F7A701CBc1C5fdE30dF76A'
    setCethBalUser(bal.toNumber())
    return bal.toNumber();
  }
  //console.log('User CETH Bal: ', userCethBal().toNumber());

  const userCompBalNotClaimed = async () => {
    const compBalNotClaimed = Compound.comp.getCompAccrued(connectedWalletAddress, ropstenProvider);
    setCompBal(compBalNotClaimed)
    return compBalNotClaimed;
  }
  //console.log('User COMP Bal Not Claimed: ', userCompBalNotClaimed().toNumber())

  const userCompBal = async () => {
    const userCompBal = Compound.comp.getCompBalance(connectedWalletAddress, ropstenProvider);
    setCompBal(userCompBal)
    return userCompBal;
  }

  const getCompAccrued = async (account) => {
    const amt = await Compound.comp.getCompAccrued(account);
    console.log('COMP Accrued', amt);
  }

  const depositEthToCompound = async (account, amount) => {
    console.log(`Supplying ETH to the Compound Protocol...`);
    // Mint some cETH by supplying ETH tho the protocol
    await compoundCEthContract.methods.mint().send({
      from: account,
      gasLimit: web3.utils.toHex(250000),
      gasPrice: web3.utils.toHex(20000000000),
      value: web3.utils.toHex(web3.utils.toWei(amount, 'ether'))
    })
      .then(() => {console.log('cETH "Mint" operation successful.'); })
      .catch((err) => {
        console.error('ERROR::WITHDRAWFROMCOMPOUND::  ', err)
    });    

    const _balanceOfUnderlying = await compoundCEthContract.methods.balanceOfUnderlying(connectedWalletAddress).call();
    let balanceOfUnderlying = web3.utils.fromWei(_balanceOfUnderlying.toString());
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);
    
    _cTokenBalance = await compoundCEthContract.methods.balanceOf(connectedWalletAddress).call();
    let cTokenBalance = (_cTokenBalance / 1e8).toString();
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    let exchangeRateCurrent = await compoundCEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent);
  }

  const redeemCethFromCompound = async () => {  

    const _balanceOfUnderlying = await compoundCEthContract.methods.balanceOfUnderlying(connectedWalletAddress).call();
    let balanceOfUnderlying = web3.utils.fromWei(_balanceOfUnderlying.toString());
    console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);
    
    _cTokenBalance = await compoundCEthContract.methods.balanceOf(connectedWalletAddress).call();
    let cTokenBalance = (_cTokenBalance / 1e8).toString();
    console.log("My wallet's cETH Token Balance:", cTokenBalance);

    console.log('Redeeming the cETH for ETH...');

    console.log('Exchanging all cETH based on cToken amount...');
    await compoundCEthContract.methods.redeem(_cTokenBalance).send({
      from: connectedWalletAddress,
      gasLimit: web3.utils.toHex(400000),      // posted at compound.finance/developers#gas-costs
      gasPrice: web3.utils.toHex(90000000000), // use ethgasstation.info (mainnet only)
    });

    // console.log('Exchanging all cETH based on underlying ETH amount...');
    // let ethAmount = web3.utils.toWei(balanceOfUnderlying).toString()
    // await compoundCEthContract.methods.redeemUnderlying(ethAmount).send({
    //   from: connectedWalletAddress,
    //   gasLimit: web3.utils.toHex(400000),      // posted at compound.finance/developers#gas-costs
    //   gasPrice: web3.utils.toHex(90000000000), // use ethgasstation.info (mainnet only)
    // });

    let exchangeRateCurrent = await compoundCEthContract.methods.exchangeRateCurrent().call();
    exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
    console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent);
  }

  const depositDaiToCompound = async () => {
    const supplyRatePerBlockMantissa = await compoundCDaiContract.methods.
    supplyRatePerBlock().call();

      const interestPerEthThisBlock = supplyRatePerBlockMantissa / 1e18;
      console.log(`Each supplied DAI will increase by ${interestPerEthThisBlock}` +
        ` this block, based on the current interest rate.`)

      // Tell DAI contract to allow 10 DAI to be taken by Compound's contract
      await daiContract.methods.approve(
        compoundCDaiContractAddress, web3.utils.toBN(10e18)
      ).send({
        from: connectedWalletAddress,
        gasLimit: web3.utils.toHex(150000),     // posted at compound.finance/developers#gas-costs
        gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
      });

      console.log('DAI contract "Approve" operation successful.');
      console.log('Sending DAI to the Compound Protocol...');
      // Mint cDAI by supplying DAI to the Compound Protocol
      const dai = 10e18; // 10 DAI
      await compoundCDaiContract.methods.mint(web3.utils.toBN(dai)).send({
        from: connectedWalletAddress,
        gasLimit: web3.utils.toHex(600000),
        gasPrice: web3.utils.toHex(20000000000),
      });

      console.log('cDAI "Mint" operation successful.');
      const _balanceOfUnderlying = await compoundCDaiContract.methods
        .balanceOfUnderlying(connectedWalletAddress).call();
      let balanceOfUnderlying = web3.utils.fromWei(_balanceOfUnderlying).toString();
      console.log("DAI supplied to the Compound Protocol:", balanceOfUnderlying);

      const _cTokenBalance = await compoundCDaiContract.methods.
        balanceOf(connectedWalletAddress).call();
      let cTokenBalance = (_cTokenBalance / 1e8).toString();
      console.log("My wallet's cDAI Token Balance:", cTokenBalance);

      let exchangeRateCurrent = await compoundCDaiContract.methods.
        exchangeRateCurrent().call();
      exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
      console.log("Current exchange rate from cDAI to DAI:", exchangeRateCurrent);

      console.log('Redeeming the cDAI for DAI...');

      console.log('Exchanging all cDAI based on cToken amount...');
      await compoundCDaiContract.methods.redeem(cTokenBalance * 1e8).send({
        from: connectedWalletAddress,
        gasLimit: web3.utils.toHex(500000),      // posted at compound.finance/developers#gas-costs
        gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
      });

      // console.log('Exchanging all cDAI based on underlying DAI amount...');
      // let daiAmount = web3.utils.toWei(balanceOfUnderlying).toString();
      // await compoundCDaiContract.methods.redeemUnderlying(daiAmount).send({
      //   from: connectedWalletAddress,
      //   gasLimit: web3.utils.toHex(600000),      // posted at compound.finance/developers#gas-costs
      //   gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
      // });

      cTokenBalance = await compoundCDaiContract.methods.balanceOf(connectedWalletAddress).call();
      cTokenBalance = (cTokenBalance / 1e8).toString();
      console.log("My wallet's cDAI Token Balance:", cTokenBalance);

  }

  const redeemCDaiFromCompound = () => {

  }

  const withdrawUsdcFromCompound = () => {

  }

  const claimCompTokens = () => {


  }

  const borrowDai = async () => {
      //await compound.borrow(Compound.DAI, 1, { mantissa: true })
      const daiScaledUp = '1000000000000000000';
      const trxOptions = { mantissa: true, privateKey: '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329' };

      console.log('Borrowing 32 Dai...');
      const trx = await compound.borrow(Compound.DAI, daiScaledUp, trxOptions);

      console.log('Ethers.js transaction object', trx);

  }

  const usdcAddress = Compound.util.getAddress(Compound.USDC);
  const uniswapUsdcEth = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc';

  // (async function() {

  //   const bal = await Compound.eth.read(
  //     usdcAddress,
  //     'function balanceOf(address) returns (uint256)',
  //     [ uniswapUsdcEth ], // [optional] parameters
  //     {}  // [optional] call options, provider, network, plus ethers "overrides"
  //   );

  //   console.log('USDC Balance of Uniswap ETH-USDC', bal.toString());

  // })().catch(console.error);



  const depositToCompound2 = async (amount) => {

      console.log('Supplying ETH to the Compound protocol...');
      const trx = await compound.supply(Compound.ETH, amount);

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
                <h2>Earn COMP Tokens When you Deposit to Compound Protocol</h2>
                {/* <TokenBalance name={"RawCipherToken"} img={"🛠RCT"} address={address} contracts={readContracts} />
                <TokenBalance name={"RawCipherLPToken"} img={"🛠RCT LP"} address={address} contracts={readContracts} /> */}
                <h3>
                <Image src={compoundLogo} />&nbsp;&nbsp;
                <span>cDAI {0}</span>&nbsp;&nbsp;
                <span>cETH {cethBalUser}</span>&nbsp;&nbsp;
                <span>cUSDC {0}</span>&nbsp;&nbsp;
                <span>COMP {web3.utils.fromWei(compBal.toString())}</span>
                </h3>

                {/* <TokenBalance balance={cethBalUser} img={"cETH"} /> */}

                {/* <TokenBalance name={""} img={"cETH"} address={"0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72"} contracts={cethContract} /> */}
                {/* <TokenBalance name={""} img={"DAI"} address={"0x6B175474E89094C44Da98b954EedeAC495271d0F"} contracts={""} /> */}
            
            <div>
                <Divider />
                <Row gutter={[16, 16]}>
                <Col span={8} >
                    <label>Deposit ETH</label><br />
                    <Input 
                      id='ethDepositAmount'
                      prefix="Ξ"
                      suffix="ETH"                      
                      style={{ width: 200 }}
                      onChange={ event => setEthDepositAmount(event.target.value) } />
                    <br /><br />
                        <Button
                          onClick={() => {
                              // Modal here...


                              depositEthToCompound(connectedWalletAddress, ethDepositAmount)
                                .catch((err) => {
                                  console.error(err);
                              });
                          }}> 
                        <UploadOutlined /> Deposit ETH
                        </Button>
                    
                </Col>
                <Col span={8} >
                    <label>Deposit DAI</label><br />
                    <Input id='daiDepositAmount' prefix="D" suffix="DAI" style={{ width: 200 }} />
                    <br /><br />
                      <Button
                        onClick={() => {
                            depositDaiToCompound()
                              .catch((err) => {
                                console.error(err);
                            });
                        }}>
                      <UploadOutlined /> Deposit DAI
                      </Button>
                </Col>
                <Col span={8} >
                <label>Deposit USDC</label><br />
                    <Input id='rctDepositAmount' prefix="U" suffix="USDC" style={{ width: 200 }} />
                    <br /><br />
                    <Button
                      onClick={() => {

                      }}>
                    <UploadOutlined /> Deposit USDC
                    </Button>
                </Col>
                </Row>
                <Row gutter={[16, 16]}>
                <Col span={8} >
                <Button
                    onClick={() => {
                      redeemCethFromCompound()
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
                      redeemCDaiFromCompound()
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
                      withdrawUsdcFromCompound()
                      .catch((err) => {
                          console.error('ERROR::WITHDRAWFROMCOMPOUND::  ', err)
                      })
                    }}>
                     Withdraw & Claim COMP
                    </Button>
                </Col>
                </Row>
                {/* <Divider />
                <Button
                    onClick={async () => {
                        
                    }}
                >Price of ETH
                </Button> */}
                <Divider />
                <div>
                    <Row gutter={[16, 16]}>
                    <Col span={8} >
                        <Button
                        onClick={() => {

                        }}>
                        Borrow ETH
                        </Button>
                    </Col>
                    <Col span={8} >
                    <Button
                        onClick={() => {
                          borrowDai();
                        }}>
                        Borrow DAI
                        </Button>
                    </Col>
                    <Col span={8} >
                    <Button
                        onClick={() => {

                        }}>
                        Borrow USDC
                        </Button>
                    </Col>
                    </Row>
                </div>
                </div>

              </div>
              <Divider />
                <div>
                    <Row gutter={[16, 16]}>
                    <Col span={8} >
                        <Button
                          onClick={() => {

                          }}>
                        Buy ETH Cover
                        </Button>
                    </Col>
                    <Col span={8} >
                        <Button
                          onClick={() => {
                            
                          }}>
                        Buy DAI Cover
                        </Button>
                    </Col>
                    <Col span={8} >
                    <Button
                        onClick={() => {

                        }}>
                        Buy USDC Cover
                        </Button>
                    </Col>
                    </Row>
                </div>
            </Layout>
            <Divider />
            <Footer>
               {/* Events */}
              <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
                  <h2>Transaction History</h2>
                  <List
                  bordered
                  dataSource={compoundEvents}
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
              </div>
            </Footer>
        </Layout>
    )
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default CompoundUI