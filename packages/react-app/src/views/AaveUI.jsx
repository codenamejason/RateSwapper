import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Row, Col, Layout, Menu } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SyncOutlined } from '@ant-design/icons';
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
import Biconomy from "@biconomy/mexa";
import { legos } from "@studydefi/money-legos";

const { ChainId, Fetcher, WETH, Route } = require('@uniswap/sdk');

const Web3 = require('web3');
const web3 = new Web3('https://kovan.infura.io/v3/1ad03ac212da4523b6c8337eace81a14'); // //('http://127.0.0.1:8545');


const Compound = require('@compound-finance/compound-js');



// Biconomy Initialization
let options = {
apiKey: '_a1vIlfCz.49a8bba2-29e8-471e-afea-bcfaf8aeeea5',
strictMode: true
};

const biconomy = new Biconomy(window.ethereum, options);
const biconomyWeb3 = new Web3(biconomy);


export const client = new ApolloClient({
    link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    }),
    fetchOptions: {
    mode: 'no-cors'
    },
    cache: new InMemoryCache()
})

const DAI_QUERY = gql`
query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
    derivedETH
    totalLiquidity
    }
}
`

const ETH_PRICE_QUERY = gql`
query bundles {
    bundles(where: { id: "1" }) {
    ethPrice
    }
}
`

const chainId = ChainId.MAINNET;
const daiTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const init = async () => {
const dai = await Fetcher.fetchTokenData(chainId, daiTokenAddress);
const weth = WETH[chainId];
const pair = await Fetcher.fetchPairData(dai, weth);

const route = new Route([pair], weth);
console.log(route.midPrice.toSignificant(6));
}

const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329');
const myWalletAddress = web3.eth.accounts.wallet[0].address;
console.log('Connected Walelt', myWalletAddress)


const { Content, Footer, Sider } = Layout;

const AaveUI = ({address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, kovanProvider }) => {
    return (
        <Layout>
            <Layout>

            </Layout>
            <Footer>

            </Footer>
        </Layout>
    )
}

export default AaveUI;