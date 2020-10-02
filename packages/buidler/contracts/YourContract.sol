// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "@nomiclabs/buidler/console.sol";

import "./tokens/RawCipherToken.sol";




contract YourContract {
    using SafeMath for uint256;
    IERC20 token;

    address public owner;

    string public purpose = "🛠 Learning Web3";
    
    // Lending and staking rates... all percentages
    uint256 constant lendRate = 678;
    uint256 constant stakeRate = 400;
    uint256 constant accountRate = 125;
    uint256 constant rewardsRate = 1100;

    uint256 constant divider = 60 * 5;

    uint256 public totalLiquidity;
    uint256 totalReserves;

    uint256 public poolBalance;
    uint32 public reserveRatio; // = 1/3 * tokenSupply^3 / (tokenSupply^3 * tokenSupply) = 1/3

    mapping(address => uint256) public rewardBalance; // issuance of raw cipher token
    mapping(address => uint256) public accountBalance;
    mapping(address => uint256) public liquidity;
    mapping(address => uint256) public depositTime;
    mapping(address => uint256) public liquidityDepositTime;

    mapping(address => DepositTx) depositTransactions;

    address[] internal accountHolders;
    address[] internal liquidityProviders;
    //address[] internal stakeHolders;
    address[] internal borrowers;

    DepositTx[] public depositTxs;

    struct DepositTx {
        address user;
        uint256 amount;
        uint256 timestanp;
    }

    struct BorrowTx {
        address user;
        uint256 amount;
        uint256 timestanp;
    }

    constructor()
        public
    {
           
    }   

    event PaymentSent(address user, uint256 amount);
    event WithdrawMade(address user, uint256 amount);
    event DepositMade(address user, uint256 amount);
    event BorrowMade(address user, uint256 amount, uint256 rate);

    RawCipherToken rct;
    uint8 setTokenCount = 0;

    function setTokenAddress(address _tokenAddress) 
        external
    {
        require(setTokenCount == 0, "Token is already set");
        setTokenCount = 1;
        rct = RawCipherToken(_tokenAddress);
    }

    function setPoolAddress(address _tokenAddress) 
        external
    {
        
    }


    function getContractBalance() 
        public view returns(uint256) 
    {
        return address(this).balance;
    }

    function receivePayment(address payable recipient, uint256 amount) 
        external 
    {
        // make sure they have a balance to cover amount
        //require(msg.value == amount, "You did not send the proper amount of ether");
        require(accountBalance[recipient] >= amount, "Your balance is too low to make this withdraw");
        recipient.transfer(amount);
        // deduct the amount from the users balance
        accountBalance[msg.sender] = accountBalance[msg.sender] - amount;

        emit PaymentSent(recipient, amount);
    }

    function setPurpose(string memory newPurpose) 
        public payable 
    {
        require(msg.value >= 0.001 ether, "Not enough ether");
        purpose = newPurpose;
        console.log(msg.sender, "set purpose to", purpose);
    }

    // function withdrawAll () 
    //     public
    // {
    //     msg.sender.transfer(address(this).balance);
    // }

    function withdraw ()
        public
    {
        // Make sure the user has enough balance to cover withdraw
        require(accountBalance[msg.sender] >= 0, "You cannot withdraw more than you have!");
        uint256 amount =  accountBalance[msg.sender];
        uint256 timeLocked = block.timestamp - depositTime[msg.sender];
        console.log('locked value: ', amount, timeLocked);
        uint256 reward = (amount * timeLocked) / 500000;

        // deduct the amount from the users balance
        accountBalance[msg.sender] - amount;
        depositTime[msg.sender] = 0;
        // mint the users reward tokens
        rct.mintUserTokens(msg.sender, reward);
        
        // send the amount to the user from the contract
        //msg.sender.transfer(amount);

        emit WithdrawMade(msg.sender, amount);
    }


    function deposit ()
        public payable
    {
        require(depositTime[msg.sender] == 0, "You already made a deposit");
        depositTime[msg.sender] = block.timestamp;
        accountBalance[msg.sender] = accountBalance[msg.sender].add(msg.value);

        depositTransactions[msg.sender] = DepositTx(msg.sender, msg.value, block.timestamp);     

        emit DepositMade(msg.sender, msg.value);
    }


    function addLiquidity ()
        public payable
    {
        uint256 eth_reserve = address(this).balance.add(msg.value);
        uint256 token_reserve = rct.balanceOf(address(this));
        uint256 token_amount = (msg.value.mul(token_reserve) / eth_reserve).add(1);
        uint256 liquidity_minted = msg.value.mul(totalLiquidity) / eth_reserve;

        liquidity[msg.sender] = liquidity[msg.sender].add(msg.value);
        totalLiquidity = totalLiquidity.add(msg.value);
        liquidityDepositTime[msg.sender] = block.timestamp;
        depositTransactions[msg.sender] = DepositTx(msg.sender, msg.value, block.timestamp);  

    }


    function removeLiquidity (address provider, uint256 amount)
        public
    {        
        uint256 bal =  liquidity[msg.sender];
        uint256 timeLocked = block.timestamp.sub(liquidityDepositTime[msg.sender]);
        console.log('locked value: ', bal, timeLocked);
        uint256 reward = (bal * timeLocked) / 300000;

        liquidity[provider] = liquidity[provider].sub(amount);
        totalLiquidity = totalLiquidity.sub(amount);

        rct.mintUserTokens(msg.sender, reward);
        //msg.sender.transfer(amount);
    }


    // todo: need to calculate fees for the loans
    // function getLoan(address payable lendee, uint256 amount)
    //     public
    // {
    //     loanBalance[lendee] = loanBalance[lendee].add(amount);

    // }


    // function payLoan(address lendee, uint256 amount)
    //     public payable
    // {
    //     loanBalance[lendee] = loanBalance[lendee].sub(amount);

    // }

    // stake ether to earn rct
    // function stakeEther()
    //     public payable
    // {
    //     stakedBalance[msg.sender] = stakedBalance[msg.sender].add(msg.value);

    // }

    // returns all staked ether
    // function unstakeEther()
    //     public
    // {
    //     stakedBalance[msg.sender] = stakedBalance[msg.sender].sub(stakedBalance[msg.sender]);
    //     // pay rewards

    // }



    
    function claimRewards()
        public
    {
        rewardBalance[msg.sender] = rewardBalance[msg.sender].sub(rewardBalance[msg.sender]);
        rct.mintUserTokens(msg.sender, rewardBalance[msg.sender]);
    }


    function mintRewardTokens(uint256 amount, address user)
        internal
    {
        rewardBalance[user] = rewardBalance[user].sub(amount);
        rct.mintUserTokens(user, amount);
    }

    fallback() external payable {}
}
