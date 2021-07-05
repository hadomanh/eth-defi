/* global artifacts */
const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFactory = artifacts.require('TokenFactory')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  // Deploy TokenFactory
  await deployer.deploy(TokenFactory, dappToken.address, daiToken.address)
  const tokenFactory = await TokenFactory.deployed()

  // Transfer all tokens to TokenFactory (1 million)
  await dappToken.transfer(tokenFactory.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
