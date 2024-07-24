// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShutterToken is ERC20 {
  constructor() ERC20("Shutter Token", "SHU") {}

  function mint(address to) public {
    _mint(to, 1000e18);
  }
}
