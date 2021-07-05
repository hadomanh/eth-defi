import './App.css';
import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from './abis/DaiToken.json'
import DappToken from './abis/DappToken.json'
import TokenFactory from './abis/TokenFactory.json'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFactory: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    // Load TokenFactory
    const tokenFactoryData = TokenFactory.networks[networkId]
    if(tokenFactoryData) {
      const tokenFactory = new web3.eth.Contract(TokenFactory.abi, tokenFactoryData.address)
      this.setState({ tokenFactory })
      let stakingBalance = await tokenFactory.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFactory contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    amount = JSON.stringify(amount)
    amount = window.web3.utils.toWei(amount, 'Ether')

    this.setState({ loading: true })

    this.state.daiToken.methods
      .approve(this.state.tokenFactory._address, amount)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.state.tokenFactory.methods
          .stakeTokens(amount).send({ from: this.state.account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false })
          })
      })
  }

  unstakeTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFactory.methods
      .unstakeTokens()
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
  }
  
  render() {
    return (
      <div className="App">
        <div className="container mt-5">
          {this.state.loading && <h5>Loading...</h5>}
          <h5>Ballance: {window.web3.utils.fromWei(this.state.daiTokenBalance, 'Ether')} DAI</h5>
          <h5>Staking Ballance: {window.web3.utils.fromWei(this.state.stakingBalance, 'Ether')} DAI</h5>
          <h5>Reward Ballance: {window.web3.utils.fromWei(this.state.dappTokenBalance, 'Ether')} DApp</h5>
          <div className="btn-group">
            <div className="btn btn-outline-primary" onClick={() => this.stakeTokens(100)}>Stake 100</div>
            <div className="btn btn-outline-danger" onClick={this.unstakeTokens}>Unstake</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
