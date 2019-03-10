const SHA256 = require('crypto-js/sha256')

//In Bitcoin de pow algorithm makes that only is made one new block every 10 minutes
//During this 10 minutes the transactions are added into a pending array for the following block

class Transaction{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
} 

class Block{
	constructor(timestamp, transactions, previousHash =''){
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		//Variable only used for Proof-of-work algorithm
		this.nonce = 0;
	}

	calculateHash(){
		return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce).toString();
	}

	//Proof-of-work
	mineBlock(difficulty){
		while(this.hash.substring(0,difficulty) !== Array(difficulty +1).join("0")){
			++this.nonce;
			this.hash = this.calculateHash()
		}
		
		console.log("Mined block: " + this.hash);
	}
}


class Blockchain{
	constructor(){
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGenesisBlock(){
		//Genesis is the first block of the chain, ens el inventem
		return new Block("09/03/2018","Genesis Block","0");
	}

	getLatestBlock(){
		return this.chain[this.chain.length -1];
	}
	
	addBlock(newBlock){
		newBlock.previousHash = this.getLatestBlock().hash;
		newBlock.mineBlock(this.difficulty);
		this.chain.push(newBlock);
	}

	minePendingTransactions(miningRewardAddress){
		let block = new Block(Date.now(),this.pendingTransactions);
		block.mineBlock(this.difficulty);
		console.log("Block mined successfully!");
		this.chain.push(block);
		this.pendingTransactions = [
			new Transaction(null,miningRewardAddress,this.miningReward)
		]
		
	}

	createTransaction(transaction){
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address){
		let balance = 0;
		for(const block of this.chain){
			for(const trans of block.transactions){
				if(trans.fromAddress === address){
					balance -= trans.amount;
				}
				if(trans.toAddress === address){
					balance += trans.amount;
				}
			}
		}
		return balance;
	}

	isChainValid(){
		for(let i = 1; i < this.chain.length; i++){
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];
			if(currentBlock.hash !== currentBlock.calculateHash()){
				return false;
			}
			if(currentBlock.previousHash !== previousBlock.hash){
				return false;
			}

		}
		return true;
	}

}


let chainTest = new Blockchain()
/*
console.log("Mining block 1...");
chainTest.addBlock(new Block(1,"10/03/2019",{id: "403", vote: "PP"}));
console.log("Mining block 2...");
chainTest.addBlock(new Block(2,"10/03/2019",{id: "432", vote: "Podemos"}));

console.log(JSON.stringify(chainTest,null,4));
console.log(chainTest.isChainValid());
//Lets try to modify(temper) the blockchain
chainTest.chain[1].data = {id: "403", vote:"PSOE"};
console.log(chainTest.isChainValid());
chainTest.chain[1].hash = chainTest.chain[1].calculateHash();
console.log(chainTest.isChainValid());
*/

chainTest.createTransaction(new Transaction('address1','address2',100));
chainTest.createTransaction(new Transaction('address2','address1',5));

console.log("Time to wake up the miner");
chainTest.minePendingTransactions('roger31');
console.log('Roger Balance: ' + chainTest.getBalanceOfAddress('roger31'));

console.log("Time to wake up the miner");
chainTest.minePendingTransactions('roger31');
console.log('Roger Balance: ' + chainTest.getBalanceOfAddress('roger31'));

