
// Contracts
const TMEDeployer = artifacts.require("TMEDeployer")
const TMECrowdsale = artifacts.require("TMECrowdsale")
const TME = artifacts.require("TME")
const TMELocker = artifacts.require("TMELocker")

// Utils
const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}


const contrib = async (amt, dest, key) => {
  const val = web3.utils.toWei(amt, 'ether');
  // console.log(val)
  const tx = await web3.eth.accounts.signTransaction({
    to: dest,
    value: val.toString(),
    gas: 2000000
  }, key);
  // console.log(tx)
  // var serializedTx = tx.serialize();
  return web3.eth.sendSignedTransaction(tx.rawTransaction);
}

module.exports = async function(callback) {
  try {
    // Fetch accounts from wallet - these are unlocked
    const accounts = await web3.eth.getAccounts()
    const tmeLocker = await TMELocker.deployed();
    const tmeCrowdsale = await TMECrowdsale.deployed();
    const tmeToken = await TME.deployed();
    const treasuryAdd = await tmeLocker.treasury();

    console.log('TMECrowdsale fetched', tmeCrowdsale.address)
    console.log('TME fetched', tmeToken.address)
    console.log('TMELocker fetched', tmeLocker.address)
    console.log('treasuryAdd fetched', treasuryAdd)

    // assume TMELocker is already ready and deployed.
    r = await tmeLocker.isReadyForSale()
    console.log("tmeLocker ready: ", r)
    if (!r){
      await tmeLocker.getReadyForCrowdSale()
      for (var i = 0; i < 11; i+=1){
        batches = await tmeLocker.batches(i);
        console.log(batches.owner, batches.amount.toString(), batches.time.toString(), batches.spent)
      }
    }
    r = await tmeLocker.isReadyForSale()
    console.log("ready", r);
    await tmeCrowdsale.setStarted(true);
    console.log("started")
    return;
    
    if (r){
      var balCrowdsale = await tmeToken.balanceOf(tmeCrowdsale.address);
      console.log("balCrowdsale",balCrowdsale/1e18);
      
      var buyerEthBalance = await web3.eth.getBalance(accounts[0]);
      console.log("buyerEthBalance",buyerEthBalance/1e18)

      // var test_keys = process.env.TEST_KEYS.split(",")

      // send 1 ether
      // var receipt = await contrib("1", tmeCrowdsale.address, test_keys[0]);
      // var receipt = await contrib("1", tmeCrowdsale.address, test_keys[1]);
      // var receipt = await contrib("1", tmeCrowdsale.address, test_keys[2]);
      // var receipt = await contrib("1", tmeCrowdsale.address, test_keys[3]);
      // var receipt = await contrib("1", tmeCrowdsale.address, test_keys[4]);




      // test contribution of > 1 ether  
      var send = await web3.eth.sendTransaction({from:accounts[0], 
        to:tmeCrowdsale.address, value: 1000000000000000000});
      console.log("after contrib 1 eth");

      var balCrowdsale = await tmeToken.balanceOf(tmeCrowdsale.address);
      // var buyerBalance = await tmeToken.balanceOf(accounts[0]);
      var buyerEthBalance = await web3.eth.getBalance(accounts[0]);
      var tmeLockerEthBalance = await web3.eth.getBalance(tmeLocker.address);

      console.log("balCrowdsale",balCrowdsale/1e18)
      // console.log("buyerBalance",buyerBalance/1e18)
      console.log("buyerEthBalance",buyerEthBalance/1e18)
      console.log("tmeLockerEthBalance",tmeLockerEthBalance/1e18)


      // await tmeLocker.setPresaleEnded(true);
    }
  }
  catch(error) {
    console.log(error)
  }

  callback()
}
