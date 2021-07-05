// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './ERC20Token.sol';

contract DappToken is ERC20Token {
  
  constructor () public ERC20Token("Decentralized Application Token", "dApp") {

  }
}
