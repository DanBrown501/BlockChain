pragma solidity ^0.8.2;

contract ERC1155 {

    // event TransferSingle()
    // event TransferBatch()
    // event ApprovalForAll
    // event URI()

    // Mapping from TokenID to account balanes
    mapping(uint256 => mapping(address => uint256)) internal _balances;

    //Gets the balance of an accounts tokens
    function balanceOf(address account, uint256 id) public view returns(uint256) {
        require(account != address(0), "Address is zero");
        return _balances[id][account];
    }
    // Gets the balance of multiple accounts tokens
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view returns (uint256[] memory){

    }
    // function setApprovalForAll()
    // function isApprovedForAll()
    // function safeTransferFrom()
    // function safeBatchTransferFrom()
    // function supportsInterface()



}