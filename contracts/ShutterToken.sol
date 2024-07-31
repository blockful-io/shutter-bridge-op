// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.22 <0.9.0;

import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title Shutter Token contract - Modified by Blockful
/// @author Daniel Dimitrov - @compojoom, Fred Lührs - @fredo
contract ShutterToken is ERC20Votes, Pausable, Ownable {
  /// @dev Will mint 1 billion tokens to the owner
  constructor(
    address owner
  ) ERC20("Shutter Token", "SHU") EIP712("ShutterToken", "1.0.0") Ownable(owner) {
    mint();
  }

  function _maxSupply() internal pure override returns (uint256) {
    return 1_000_000_000 ether;
  }

  function mint() public {
    _mint(msg.sender, 1000 ether);
  }
}
