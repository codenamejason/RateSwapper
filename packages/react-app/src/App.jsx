import { getDefaultProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button, Col, Menu, Row, Tabs } from "antd";
// import IpfsRouter from 'ipfs-react-router'
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Contract, Faucet, GasGauge, Header, Ramp } from "./components";
import { ETHERSCAN_KEY, INFURA_ID } from "./constants";
import { Transactor } from "./helpers";
import { useBalance, useContract, useContractLoader, useExchangePrice, useGasPrice, useUserProvider } from "./hooks";
import { AaveUI, CompoundUI, RateSwapUI } from "./views";
// import Portis from '@portis/web3';
//
// const portis = new Portis('43b018f6-e3f1-4d5e-a85b-021280e28777', 'mainnet');
// const web3Portis = new Web3(portis.provider);
// const portisAccount = web3Portis.eth.getAccounts()
//   .then((r) => console.log(r));
// console.log('Portis Account', portisAccount)

// Import the contract abi's
const abis = require("./contracts/compoundAbis");
const addresses = require("./constants/addresses");

const { TabPane } = Tabs;

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/"; // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
const mainnetForkProvider = "https://localhost:8545";
const kovanProvider = getDefaultProvider("kovan", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
const rinkebyProvider = getDefaultProvider("rinkeby", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
const ropstenProvider = getDefaultProvider("ropsten", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // "https://ropsten.infura.io/v3/5c19088a9f804202b4fe954c029de555";//for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

const App = () => {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); // 1 for xdai
  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); // 1000000000 for xdai
  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, ropstenProvider);
  const address = useUserAddress(userProvider);
  console.log("User Wallet Address: ", address);
  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);
  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(ropstenProvider, address);
  // console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...")
  // just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);
  // console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...")
  // Mainnet DAI contract to fetch balance
  const daiContract = useContract(mainnetProvider, addresses.DAI_ADDRESS_MAINNET, abis.DAI_TOKEN_ABI_MAINNET);
  // console.log('📝 DAI Contract Mainnet: ', daiContract);
  const [daiBalance, setDaiBalance] = useState(0);
  // Using the Poller hook to update our DAI balance
  // You can update the polling time by changing the 60000 (60 seconds).
  // usePoller(async () => {
  //   if(daiContract && address){
  //       const daiBal = await daiContract.balanceOf(address)
  //       setDaiBalance(daiBal);
  //   }
  // }, 500000, [daiContract]);
  console.log("💵 Your Mainnet DAI Balance: ", daiBalance ? formatEther(daiBalance) : "...");
  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(ropstenProvider);
  // console.log("📝 readContracts", readContracts)
  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  // console.log("🔐 writeContracts", writeContracts)

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // console.log("Location:: ", window.location.pathname)
  const [route, setRoute] = useState();
  useEffect(() => {
    console.log("SETTING ROUTE:: ", window.location.pathname);
    setRoute(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Contract Playground
            </Link>
          </Menu.Item>
          {/* <Menu.Item key="/hints">
            <Link onClick={()=>{setRoute("/hints")}} to="/hints">Hints</Link>
          </Menu.Item> */}
          {/* <Menu.Item key="/exampleui">
            <Link onClick={()=>{setRoute("/exampleui")}} to="/exampleui">ExampleUI</Link>
          </Menu.Item> */}
          {/* <Menu.Item key='/rateswap'>
            <Link onClick={ () => { setRoute('/rateswap') } } to='/rateswap'>Rate Swap</Link>
          </Menu.Item> */}
          <Menu.Item>
            <Link
              onClick={() => {
                setRoute("/farm");
              }}
              to="/farm"
            >
              Farm
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link
              onClick={() => {
                setRoute("/compound");
              }}
              to="/compound"
            >
              Compound
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link
              onClick={() => {
                setRoute("/aave");
              }}
              to="/aave"
            >
              Aave
            </Link>
          </Menu.Item>
          <Menu.Item key="/uniswap">
            <Link
              onClick={() => {
                setRoute("/uniswap");
              }}
              to="/uniswap"
            >
              Uniswap
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Contract
              name="YourContract"
              signer={userProvider.getSigner()}
              provider={ropstenProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            <Contract
              name="RawCipherToken"
              signer={userProvider.getSigner()}
              provider={ropstenProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            <Contract
              name="RawCipherLPToken"
              signer={userProvider.getSigner()}
              provider={ropstenProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/farm" />
          {/* <Route path="/hints">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route>
          <Route path="/exampleui">
            <ExampleUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
            />
          </Route> */}
          <Route path="/rateswap">
            <RateSwapUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              kovanProvider={kovanProvider}
              ropstenProvider={ropstenProvider}
            />
          </Route>
          <Route path="/compound">
            <CompoundUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              kovanProvider={kovanProvider}
              ropstenProvider={ropstenProvider}
            />
          </Route>
          <Route path="/aave">
            <AaveUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              kovanProvider={kovanProvider}
              ropstenProvider={ropstenProvider}
              mainnetForkProvider={mainnetForkProvider}
            />
          </Route>
          <Route path="/uniswap">
            <iframe
              src="https://app.uniswap.org/#/swap?use=v1?outputCurrency=0x22474D350EC2dA53D717E30b96e9a2B7628Ede5b"
              height="660px"
              width="100%"
              id="myId"
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
          kovanProvider={kovanProvider}
          ropstenProvider={ropstenProvider}
        />
        {/* <TokenBalance name={"RawCipherToken"} img={"🛠RCT"} address={address} contracts={readContracts} />
         <TokenBalance name={"RawCipherLPToken"} img={"🛠RCT LP"} address={address} contracts={readContracts} /> */}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                // window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
                alert("coming soon");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              true ? <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} /> : ""
            }
          </Col>
        </Row>
      </div>
    </div>
  );
};

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

export default App;
