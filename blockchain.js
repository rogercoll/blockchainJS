const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
//In Bitcoin de pow algorithm makes that only is made one new block every 10 minutes
//During this 10 m	inutes the transactions are added into a pending array for the following block

class Transaction{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
	calculateHash(){
		return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
	}
	signTransaction(signingKey){
		if (signingKey.getPublic('hex') !== this.fromAddress){
			throw new Error('You cannot sign transactions for other wallet');
		}
		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx,'base64');
		this.signature = sig.toDER('hex');
	}
	isValid(){
		if(this.fromAddress === null) return true;
		if(!this.signature || this.signature.length === 0){
			throw new Error('No signature in this transaction');
		}
		const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
		return publicKey.verify(this.calculateHash(),this.signature);
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

	hasValidTransactions(){
		for(const tx of this.transactions){
			if(!tx.isValid()){
				return false;
			}
		}
		return true;
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

	addTransaction(transaction){
		if(!transaction.fromAddress || !transaction.toAddress){
			throw new Error('Transaction must include some address');
		}
		if(!transaction.isValid()){
			throw new Error('Innvalid transaction');
		}

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
			if(!currentBlock.hasValidTransactions()){
				return false;
			}

		}
		return true;
	}

}


module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;