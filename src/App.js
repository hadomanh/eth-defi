import './App.css';
import React, { useState, useEffect } from 'react'
import getWeb3 from './utils/getWeb3';
import DaiToken from './abis/DaiToken.json'
import DappToken from './abis/DappToken.json'
import TokenFactory from './abis/TokenFactory.json'

function App () {

  const [web3, setWeb3] = useState(null)

  const [account, setAccount] = useState(null)
  const [daiToken, setDaiToken] = useState(null)
  const [dappToken, setDappToken] = useState(null)
  const [tokenFactory, setTokenFactory] = useState(null)

  const [daiTokenBalance, setDaiTokenBalance] = useState('0')
  const [dappTokenBalance, setDappTokenBalance] = useState('0')
  const [stakingBalance, setStakingBalance] = useState('0')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {

    const web3 = await getWeb3()
    setWeb3(web3)

    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    const networkId = await web3.eth.net.getId()

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      setDaiToken(daiToken)
      let daiTokenBalance = await daiToken.methods.balanceOf(accounts[0]).call()
      setDaiTokenBalance(daiTokenBalance.toString())
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      setDappToken(dappToken)
      let dappTokenBalance = await dappToken.methods.balanceOf(accounts[0]).call()
      setDappTokenBalance(dappTokenBalance.toString())
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    // Load TokenFactory
    const tokenFactoryData = TokenFactory.networks[networkId]
    if(tokenFactoryData) {
      const tokenFactory = new web3.eth.Contract(TokenFactory.abi, tokenFactoryData.address)
      setTokenFactory(tokenFactory)
      let stakingBalance = await tokenFactory.methods.stakingBalance(accounts[0]).call()
      setStakingBalance(stakingBalance.toString())
    } else {
      window.alert('TokenFactory contract not deployed to detected network.')
    }

    setLoading(false)
  }

  const stakeTokens = (amount) => {
    amount = JSON.stringify(amount)
    amount = web3.utils.toWei(amount, 'Ether')

    setLoading(true)

    daiToken.methods
      .approve(tokenFactory._address, amount)
      .send({ from: account })
      .on('transactionHash', (hash) => {
        tokenFactory.methods
          .stakeTokens(amount).send({ from: account })
          .on('transactionHash', (hash) => {
            setLoading(false)
          })
      })
  }

  const unstakeTokens = () => {
    setLoading(true)
    tokenFactory.methods
      .unstakeTokens()
      .send({ from: account })
      .on('transactionHash', (hash) => {
        setLoading(false)
      })
  }

  const getBalance = (balanceType) => {
    if (web3) {
      return web3.utils.fromWei(balanceType, 'Ether')
    }
    return '0'
  }
  
    return (
      <div className="App">
        <div className="container mt-5">
          {loading && <h5>Loading...</h5>}
          <h5>Ballance: {getBalance(daiTokenBalance)} DAI</h5>
          <h5>Staking Ballance: {getBalance(stakingBalance)} DAI</h5>
          <h5>Reward Ballance: {getBalance(dappTokenBalance)} DApp</h5>
          <div className="btn-group">
            <div className="btn btn-outline-primary" onClick={() => stakeTokens(100)}>Stake 100</div>
            <div className="btn btn-outline-danger" onClick={unstakeTokens}>Unstake</div>
          </div>
        </div>
      </div>
    );
  }

export default App;
