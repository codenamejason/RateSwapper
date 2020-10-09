pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./RawCipherLPToken.sol";
import "./RawCipherToken.sol";

contract YourContract is Ownable {
  using SafeMath for uint256;
  IERC20 token;
  
  uint256 public poolBalance;

  address[] public stakers;
  // token > address
  mapping(address => mapping(address => uint256)) public stakingBalance;
  mapping(address => uint256) public uniqueTokensStaked;
  mapping(address => address) public tokenPriceFeedMapping;
  address[] allowedTokens;
  mapping(address => uint256) balances;
  mapping(address => uint256) rewardBalance;

  //event SetPurpose(address sender, string purpose);
  event PoolDeposit(address accountHolder, uint256 amount);

  //string public purpose = "🛠 Programming Unstoppable Money";

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

  constructor()
    public
  {
    
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

  // function setPurpose(string memory newPurpose) public {
  //   purpose = newPurpose;
  //   console.log(msg.sender,"set purpose to",purpose);
  //   emit SetPurpose(msg.sender, purpose);
  // }

  function depositEthAndStake()
    public
    payable
  {
    // first lets split the value in half
    uint256 poolDeposit = msg.value / 2;
    uint256 forTokenPurchase = msg.value - poolDeposit;

    balances[msg.sender] = balances[msg.sender] + poolDeposit;
    poolBalance = poolBalance + poolDeposit;

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
