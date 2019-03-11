const{Blockchain,Transaction} = require('./blockchain')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');



const myKey = ec.keyFromPrivate('508d09773ce5cf5dbf6a59daf3aba394175a68ca7ed7906ebf393007495b566e');
const myWallet = myKey.getPublic('hex');

let chainTest = new Blockchain()

const tx1 = new Transaction(myWallet,'publickeyfromanother',10);
tx1.signTransaction(myKey);
chainTest.addTransaction(tx1);


console.log("Starting to mine...");
chainTest.minePendingTransactions(myWallet);
console.log("Balance of " + myWallet + " is: " + chainTest.getBalanceOfAddress(myWallet));
console.log("Starting to mine...");
chainTest.minePendingTransactions(myWallet);
console.log("Balance of " + myWallet + " is: " + chainTest.getBalanceOfAddress(myWallet));
console.log(JSON.stringify(chainTest,null,4))