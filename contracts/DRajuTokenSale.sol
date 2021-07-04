// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
import './DRaju.sol';

contract DRajuTokenSale {

    address admin;
    DRaju public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Buy(address buyer, uint256 numberOfTokens);

    constructor (DRaju _tokenContract, uint256 _tokenPrice) public {
        //Assign an admin
        admin = msg.sender;
        //Token Contract
        tokenContract = _tokenContract;
        //Token Price
        tokenPrice = _tokenPrice;
    } 

    function buyTokens(uint256 _numberOfTokens) public payable {
        //Verify buyer is sending right amount of eth
        require(_numberOfTokens*tokenPrice == msg.value);
        //Verify the token sale contract has sufficient tokens to sell
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        //Call transfer method from main contract, using balance of token sale contract
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Buy(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(msg.sender, tokenContract.balanceOf(address(this))));
    }
}