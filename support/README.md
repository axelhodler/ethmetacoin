# Interact via contract via pure Web3

Via browser where the client is served in the developer console get the ABI and the contract address

```javascript
var abi = MetaCoin.deployed().abi
var addr = MetaCoin.deployed().address
```

In the web3 console

```javascript
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var contract = web3.eth.contract(abi).at(addr); // abi is an array NOT a string
contract.getBalance.call('address').valueOf()
contract.sendCoin('recipientAddress', 100, {from: 'senderAddress'})
```
