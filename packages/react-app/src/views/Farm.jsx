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
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { INFURA_ID, ETHERSCAN_KEY, CORS_PROXY_URI, BASE_OPTIONS, BASE_URI } from '../constants'
//import Biconomy from "@biconomy/mexa";
import { legos } from "@studydefi/money-legos";
import compoundLogo from '../images/compoundLogo.svg';
import compoundIcon from '../images/comp-icn.svg';
import daiIcon from '../images/MCDDai_32.png';
import udscIcon from '../images/usdc-logo-2.png';

// Import the contract abi's
const abis = require('../contracts/compoundAbis');
const addresses = require('../constants/addresses');
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } = require('@uniswap/sdk');
const Compound = require('@compound-finance/compound-js');
const compound = new Compound('ropsten');
const ethers = require("ethers");

const { Content, Footer, Sider } = Layout;
const Farm =  ({address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, kovanProvider, ropstenProvider }) => {


    return (
        <Layout>
            <Layout>

            </Layout>
            <Footer>

            </Footer>
        </Layout>
    )
}

export default Farm;