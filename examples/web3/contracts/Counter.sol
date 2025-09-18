// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Counter {
    uint public x;
    address public owner;

    event Increment(uint by);

    constructor() {
        owner = msg.sender;
    }

    function inc() public {
        x++;
        emit Increment(1);
    }

    function incBy(uint by) public {
        require(msg.sender == owner, "incBy: only owner can increment");
        require(by > 0, "incBy: increment should be positive");
        x += by;
        emit Increment(by);
    }
}
