pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./RawCipherLPToken.sol";
import "./RawCipherToken.sol";

interface Erc20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

interface CErc20 {
    function balanceOf(address owner) external view returns (uint);
    function mint(uint256) external returns (uint256);
    function redeem(uint) external returns (uint);
    function redeemUnderlying(uint) external returns (uint);
    function borrowBalanceCurrent(address account) external returns (uint);
    function borrow(uint borrowAmount) external returns (uint);
    function repayBorrow(uint repayAmount) external returns (uint);
}

interface Comptroller {
    function enterMarkets(address[] calldata)
        external
        returns (uint256[] memory);

    function claimComp(address holder) external;
}

contract YourContract {
  using SafeMath for uint256;
  IERC20 token;  
  uint256 public poolBalance;
  address[] public stakers;
  address payable public owner;

  // token > address
  mapping(address => mapping(address => uint256)) public stakingBalance;
  mapping(address => uint256) public uniqueTokensStaked;
  mapping(address => address) public tokenPriceFeedMapping;
  address[] allowedTokens;
  mapping(address => uint256) balances;
  mapping(address => uint256) rewardBalance;

  // Mainnet Dai
  // https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#readContract
  address daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  Erc20 dai = Erc20(daiAddress);

  // Mainnet cDai
  // https://etherscan.io/address/0x5d3a536e4d6dbd6114cc1ead35777bab948e3643#readProxyContract
  address cDaiAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
  CErc20 cDai = CErc20(cDaiAddress);

  // Mainnet Comptroller
  // https://etherscan.io/address/0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b#readProxyContract
  address comptrollerAddress = 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B;
  Comptroller comptroller = Comptroller(comptrollerAddress);

  // COMP ERC-20 token
  // https://etherscan.io/token/0xc00e94cb662c3520282e6f5717214004a7f26888
  Erc20 compToken = Erc20(0xc00e94Cb662C3520282E6f5717214004A7f26888);

  // STRUCTS
  struct Farmer {
    address payable addr;

  }

  struct Deposit {
    address id;
    string depType;
    uint256 datetime;
    uint256 amount;
    string tokenDeposited;
  }


  // EVENTS
  event PoolDeposit(address accountHolder, uint256 amount);
  event BoughtRct(address user, uint256 amount, uint256 datetime);
  event SoldRct(address user, uint256 amount, uint256 datetime);
  event DepositEthAndStake(address user, uint256 amount, uint256 datetime, Deposit deposit, Farmer farmer);
  event DepositDaiAndStake(address user, uint256 amount, uint256 datetime);
  event DepositLPTokens(address user, uint256 amount, uint256 datetime);


  RawCipherToken rct;
  RawCipherLPToken rclpt;

  uint8 setRctCount = 0;
  uint8 setRclptTokenCount = 0;

  function setTokenAddress(address _tokenAddress) 
      external
  {
      require(setRctCount == 0, "Token is already set");
      setRctCount = 1;
      rct = RawCipherToken(_tokenAddress);
  }

  function setLPTokenAddress(address _tokenAddress) 
      external
  {
      require(setRclptTokenCount == 0, "Token is already set");
      setRclptTokenCount = 1;
      rclpt = RawCipherLPToken(_tokenAddress);
  }

  constructor(address payable _owner)
    public
  {
    owner = _owner;// 0xa0df350d2637096571F7A701CBc1C5fdE30dF76A;
  }

  function mintRCTTokens(address user, uint256 amount)
    external
  {
    rewardBalance[user] = rewardBalance[user].sub(amount);
    rct.mintTokens(user, amount);
  }

  function getContractBalance() 
    public view returns(uint256) 
  {
    return address(this).balance;
  }


  function depositEthAndStake()
    public
    payable
  {
    // first lets split the value in half
    uint256 poolDeposit = msg.value / 2;
    uint256 forTokenPurchase = msg.value - poolDeposit;

    balances[msg.sender] = balances[msg.sender] + poolDeposit;
    poolBalance = poolBalance + poolDeposit;

    Deposit memory deposit = Deposit(msg.sender, "Deposit Ether And Stake", msg.value, block.timestamp, "ETH");
    Farmer memory farmer = Farmer(msg.sender);

    emit DepositEthAndStake(msg.sender, msg.value, block.timestamp, deposit, farmer);
    emit PoolDeposit(msg.sender, poolDeposit);

    // now use the other half to buy rct tokens and stake them
    // forTokenPurchase is an amount in ETH, we need to figure out what the price of RCT is???
    // ToDo: use Uniswap LP and use swapExactEthForTokens()
    //rct.mintTokens(msg.sender, forTokenPurchase);

  }

  function withdrawRct(uint256 amount) 
    public
  {
    require(amount <= balances[msg.sender], "not enough balanace");
    
    
    //msg.sender.transfer(amount);    
  }

  function withdrawBalance() 
    public
  {
    

  }

  // fallback function can accept msg.data as an argument. Then, it returns any payload provided with the call.
  fallback() external payable {}
}
