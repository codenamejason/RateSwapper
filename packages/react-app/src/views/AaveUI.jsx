import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, List, Divider, Input, Image, Card, DatePicker, Slider, Switch, Progress, Spin, Row, Col, Layout, Menu } from "antd";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { useUserAddress, useTokenBalance } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, useContract, usePoller, useCustomContractLoader } from "./../hooks";
import { TokenBalance, Balance, Account, Faucet, Ramp, Contract, GasGauge, Address, Header } from "./../components";
import { Transactor } from "./../helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { EtherscanProvider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import Biconomy from "@biconomy/mexa";
import { legos } from "@studydefi/money-legos";
import aaveLogo from '../images/aave.svg';
import aaveLittleBox from '../images/aave-little-box.png';
import daiIcon from '../images/MCDDai_32.png';
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { INFURA_ID, ETHERSCAN_KEY, CORS_PROXY_URI, BASE_OPTIONS, BASE_URI } from '../constants'

const ethers = require("ethers");

// Import the contract abi's
const abis = require('../contracts/compoundAbis');
const addresses = require('../constants/addresses');

const { ChainId, Fetcher, WETH, Route } = require('@uniswap/sdk');

const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/1ad03ac212da4523b6c8337eace81a14'); // //('http://127.0.0.1:8545');

const Compound = require('@compound-finance/compound-js');

// Biconomy Initialization
let options = {
apiKey: '_a1vIlfCz.49a8bba2-29e8-471e-afea-bcfaf8aeeea5',
strictMode: true
};

const biconomy = new Biconomy(window.ethereum, options);
const biconomyWeb3 = new Web3(biconomy);

const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329');
const myWalletAddress = web3.eth.accounts.wallet[0].address;
console.log('Connected Walelt', myWalletAddress)




const { Content, Footer, Sider } = Layout;

const AaveUI = ({ address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, kovanProvider, ropstenProvider, mainnetForkProvider }) => {
    // state variables
    const [injectedProvider, setInjectedProvider] = useState();

    const [aDaiBalUser, setADaiBalUser] = useState(0)
    const [aEthBalUser, setAEthBalUser] = useState(0)
    const [aUsdcBalUser, setAUsdcBalUser] = useState(0)
    const [aaveBalUser, setAaveBalUser] = useState(0)
    const [aaveBalUnlcaimed, setAaveBalUnlcaimed] = useState(0)

    const daiTokenAbi = abis.DAI_TOKEN_ABI;
    const lendingPoolAddressesProviderAbi = abis.LENDING_POOL_ADDRESS_PROVIDER_ABI;
    const lendingPoolAbi = abis.LENDING_POOL_ABI;

    const useAsCollateral = true
    
    
    userProvider = useUserProvider(injectedProvider, ropstenProvider);

    const loadWeb3Modal = useCallback(async () => {
        const provider = await Web3Modal.connect();
        setInjectedProvider(new Web3Provider(provider));
      }, [setInjectedProvider]);
    
    useEffect(() => {
        if (Web3Modal.cachedProvider) {
          loadWeb3Modal();
        }
      }, [loadWeb3Modal]);

    // AAVE Functions against contracts
    const depositEth = async (account, amount) => {
        

    }

    const depositDai = async (account, amount) => {
        const daiAmountInWei = web3.utils.toWei(amount, 'ether').toString();
        const daiTokenAddress = addresses.DAI_ADDRESS_ROPSTEN_AAVE;
        const referralCode = '0';
        const userAddress = account;

        const lpAddressProviderAddress = addresses.LENDING_POOL_ADDRESS_PROVIDER_ADDRESS_ROPSTEN;
        const lpAddressProviderContract = new web3.eth.Contract(lendingPoolAddressesProviderAbi, lpAddressProviderAddress);
        console.log(lpAddressProviderContract);

        // Get the latest lending pool address
        const lpCoreAddress = await lpAddressProviderContract.methods
            .getLendingPoolCore()
            .call()
            .catch((e) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
        });
        console.log(`LPCoreAddress: ${lpCoreAddress}`);

        // Approve the LendingPoolCore address with the DAI contract
        const daiContract = new web3.eth.Contract(abis.DAI_TOKEN_ABI, daiTokenAddress);
        await daiContract.methods
            .approve(
                lpCoreAddress,
                daiAmountInWei
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(150000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error approving DAI allowance: ${e.message}`);
        });
        console.log(`Approval successful`);

        // Get the latest LendingPool contract address
        const lpAddress = await lpAddressProviderContract.methods
            .getLendingPool()
            .call()
            .catch((e) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
        });
        console.log(`LPAddress: ${lpAddress}`);

        console.log(`Setting DAI to use as collateral`)
        // Make the deposit transaction via LendingPool contract
        const lpContract = new web3.eth.Contract(abis.LENDING_POOL_ABI, lpAddress)
        // Set user reserve as collateral
        await lpContract.methods
            .setUserUseReserveAsCollateral(
                addresses.DAI_ADDRESS_ROPSTEN_AAVE,
                useAsCollateral
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(400000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(90000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error setting user reserve as collateral in the LendingPool contract: ${e.message}`)
        });
        console.log(`Executing deposit`)
        await lpContract.methods
            .deposit(
                addresses.DAI_ADDRESS_ROPSTEN_AAVE,
                daiAmountInWei,
                referralCode
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(400000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(90000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error depositing to the LendingPool contract: ${e.message}`)
        })
    }

    const depositUSDC = async (account, amount) => {
        const usdcAmountInWei = (amount / 1e6).toString();
        const usdcTokenAddress = addresses.USDC_ADDRESS_ROPSTEN_AAVE;
        const referralCode = '0';
        const userAddress = account;

        const lpAddressProviderAddress = addresses.LENDING_POOL_ADDRESS_PROVIDER_ADDRESS_ROPSTEN;
        const lpAddressProviderContract = new web3.eth.Contract(lendingPoolAddressesProviderAbi, lpAddressProviderAddress);
        console.log(lpAddressProviderContract);

        // Get the latest lending pool address
        const lpCoreAddress = await lpAddressProviderContract.methods
            .getLendingPoolCore()
            .call()
            .catch((e) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
        });
        console.log(`LPCoreAddress: ${lpCoreAddress}`);

        // Approve the LendingPoolCore address with the DAI contract
        const usdcContract = new web3.eth.Contract(abis.USDC_TOKEN_ABI, usdcTokenAddress);
        await usdcContract.methods
            .approve(
                lpCoreAddress,
                amount
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(150000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error approving USDC allowance: ${e.message}`);
        });
        console.log(`Approval successful`);

        // Get the latest LendingPool contract address
        const lpAddress = await lpAddressProviderContract.methods
            .getLendingPool()
            .call()
            .catch((e) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
        });
        console.log(`LPAddress: ${lpAddress}`);

        console.log(`Setting USDC to use as collateral`)
        // Make the deposit transaction via LendingPool contract
        const lpContract = new web3.eth.Contract(abis.LENDING_POOL_ABI, lpAddress)
        // Set user reserve as collateral
        await lpContract.methods
            .setUserUseReserveAsCollateral(
                addresses.USDC_ADDRESS_ROPSTEN_AAVE,
                useAsCollateral
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(150000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error setting user reserve as collateral in the LendingPool contract: ${e.message}`)
        });


        await lpContract.methods
            .deposit(
                addresses.USDC_ADDRESS_ROPSTEN_AAVE,
                amount,
                referralCode
            )
            .send({
                from: account,
                gasLimit: web3.utils.toHex(150000),     // posted at compound.finance/developers#gas-costs
                gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
              })
            .catch((e) => {
                throw Error(`Error depositing to the LendingPool contract: ${e.message}`)
        })
    }

    const depositUSDT = async (account, amount) => {

    }

    const borrowEth = async () => {

    }

    const borrowDai = async () => {
        const daiAddress = addresses.DAI_ADDRESS_ROPSTEN;


    }

    const borrowUsdc = async () => {
        
    }

    



    return (
        <Layout>
            {/* Header Section and Balances at-a-glance */}
                <h2>Earn AAVE Tokens When you Deposit to Aave Protocol</h2>
                {/* <TokenBalance name={"RawCipherToken"} img={"🛠RCT"} address={address} contracts={readContracts} />
                <TokenBalance name={"RawCipherLPToken"} img={"🛠RCT LP"} address={address} contracts={readContracts} /> */}
                <h3>
                    <Image src={aaveLittleBox} width='50px' height='50px' />&nbsp;&nbsp;
                    <span>aDAI {(0 / 1e18).toString()}</span>&nbsp;&nbsp;
                    <span>aETH {(0 / 1e8).toString()}</span>&nbsp;&nbsp;
                    <span>aUSDC {(0 / 1e8).toString()}</span>&nbsp;&nbsp;
                    <span>aUSDT {(0 / 1e8).toString()}</span>
                </h3>
                {/* <TokenBalance balance={cethBalUser} img={"cETH"} /> */}
                {/* <TokenBalance name={""} img={"cETH"} address={"0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72"} contracts={cethContract} /> */}
                {/* <TokenBalance name={""} img={"DAI"} address={"0x6B175474E89094C44Da98b954EedeAC495271d0F"} contracts={""} /> */}
            <Layout>
            <Divider />
            <Row gutter={[16, 16]}>
                <Col span={8} >
                    <label>Deposit ETH</label><br />
                    <Input 
                      id='ethDepositAmount'
                      prefix="Ξ"
                      suffix="ETH"                      
                      style={{ width: 200 }}
                      onChange={ event => console.log(event.target.value) } />
                    <br /><br />
                        <Button
                          onClick={() => {
                              // Modal here...


                          }}> 
                        <UploadOutlined /> Deposit ETH
                        </Button>
                    
                </Col>
                <Col span={8} >
                    <label>Deposit DAI</label><br />
                    <Input 
                      id='daiDepositAmount' 
                      prefix={<Image src={daiIcon} height='20px' width='20px'/>} 
                      suffix="DAI" 
                      style={{ width: 200 }}
                      onChange={ event => console.log(event.target.value) } />
                    <br /><br />
                      <Button
                        onClick={() => {
                          // Modal here ...

                          depositDai(address, '1')
                            .catch((err) => console.error(err))

                        }}>
                      <UploadOutlined /> Deposit DAI 
                      </Button>
                </Col>
                <Col span={8} >
                <label>Deposit USDC</label><br />
                    <Input 
                      id='usdcDepositAmount' 
                      prefix='$' 
                      suffix="USDC" 
                      style={{ width: 200 }} 
                      onChange={ event => console.log(event.target.value) }
                    />
                    <br /><br />
                    <Button
                      onClick={() => {
                        depositUSDC(address, '1')
                            .catch((err) => console.error(err))
                      }}>
                    <UploadOutlined /> Deposit USDC
                    </Button>
                </Col>
                </Row>
                <Row gutter={[16, 16]}>
                <Col span={8} >
                <Button
                    onClick={() => {
                     
                    }}>
                    Redeem aTokens &nbsp; <Image src={aaveLittleBox} height='20px' width='20px' />
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                     
                    }}>
                    Redeem aTokens &nbsp; <Image src={aaveLittleBox} height='20px' width='20px' />
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                  
                    }}>
                     Redeem aTokens &nbsp; <Image src={aaveLittleBox} height='20px' width='20px' />
                    </Button>
                </Col>
                </Row>
                <Divider />
                 <Row gutter={[16, 16]}>
                <Col span={8} >
                <Button
                    onClick={() => {
                     borrowEth()
                        .catch((err) => console.error(err))
                    }}>
                    Borrow ETH
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                     borrowDai()
                        .catch((err) => console.error(err))
                    }}>
                    Borrow DAI
                    </Button>
                </Col>
                <Col span={8} >
                <Button
                    onClick={() => {
                        borrowUsdc()
                            .catch((err) => console.error(err))
                    }}>
                     Borrow USDC
                    </Button>
                </Col>
                </Row>
            </Layout>
            <Divider />
            <Footer>
                <Image src={aaveLogo} />
            </Footer>
        </Layout>
    )
}

export default AaveUI;