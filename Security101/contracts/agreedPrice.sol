// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgreedPrice is Ownable {
    //giving this contract an owner
    uint256 public price;


    constructor(uint256 _price) {
        //msg.sender is seen as the address that deploys the contract
        price = _price;
    }


    function updatePrice(uint256 _price) external onlyOwner {
        //require the address of the executor of the function be the owner. If not, throw error.
         price = _price;
    }

        //This is an issue because updatePrice is mutable and subject to attack
    //  function updatePrice(uint256 _price) external {
    //       price = _price;
    //  }

    //My way of fixing the issue of updatePrice being mutable and subject to attack

    // function updatePrice(uint256 _price) internal {
    //     price = _price;
    // }
}