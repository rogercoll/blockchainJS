const SHA256 = require('crypto-js/sha256')

class Block{
	constructor(index, timestamp, data, previousHash =''){
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
	}

	calculateHash(){
		return SHA256(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash).toString();
	}
}


class Blockchain{
	constructor(){
		this.chain = [this.createGenesisBlock()];
	}

	createGenesisBlock(){
		//Genesis is the first block of the chain, ens el inventem
		return new Block(0,"09/03/2018","Genesis Block","0");
	}

	getLatestBlock(){
		return this.chain[this.chain.length -1];
	}
	
	addBlock(newBlock){
		newBlock.previousHash = this.getLatestBlock().hash;
		newBlock.hash = newBlock.calculateHash();
		this.chain.push(newBlock);
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
chainTest.addBlock(new Block(1,"10/03/2019",{id: "403", vote: "PP"}))
chainTest.addBlock(new Block(2,"10/03/2019",{id: "432", vote: "Podemos"}))

console.log(JSON.stringify(chainTest,null,4));
console.log(chainTest.isChainValid());
//Lets try to modify(temper) the blockchain
chainTest.chain[1].data = {id: "403", vote:"PSOE"};
console.log(chainTest.isChainValid());
chainTest.chain[1].hash = chainTest.chain[1].calculateHash();
console.log(chainTest.isChainValid());
