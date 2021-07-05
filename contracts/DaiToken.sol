// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './ERC20Token.sol';

contract DaiToken is ERC20Token {
  
  constructor () public ERC20Token("Mock DAI Token", "mDAI") {

  }
}
