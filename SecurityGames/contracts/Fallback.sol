// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract Fallback {

  using SafeMath for uint256;
  mapping(address => uint) public contributions;
  address payable public owner;
// state variable owner and contributions are set. current owner is the sender of the contract and it's total
// contributions is set as well.
  constructor() public {
    owner = msg.sender;
    contributions[msg.sender] = 1000 * (1 ether);
  }
// modifier set so that only the owner can call certain functions
  modifier onlyOwner {
        require(
            msg.sender == owner,
            "caller is not the owner"
        );
        _;
    }
// public function that can receive ether
  function contribute() public payable {
// initial value needs to be zero in order to call the function
    require(msg.value < 0.001 ether);
// the value the caller sends is added to the caller's data
    contributions[msg.sender] += msg.value;
// if value of caller is greater than owner, the caller becomes the new owner
    if(contributions[msg.sender] > contributions[owner]) {
      owner = msg.sender;
    }
  }
// this function returns the contributions of the owner
  function getContribution() public view returns (uint) {
    return contributions[msg.sender];
  }
// only the owner can withdraw the funds
  function withdraw() public onlyOwner {
// transfers the balance to the owner's address
    owner.transfer(address(this).balance);
  }
// can be called from outside the contract to receive the contributions
  receive() external payable {
// requires some amount of ether to be available to be received.
    require(msg.value > 0 && contributions[msg.sender] > 0);
// makes the sender of eth the new owner
    owner = msg.sender;
  }
}