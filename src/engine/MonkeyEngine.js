const Web3 = require("web3");

export default class MonkeyEngine {
  constructor(rpcUrl, privateKey, gasPrice, script) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    this.senderPk = privateKey;
    this.sender = this.web3.eth.accounts.privateKeyToAccount(
      privateKey
    ).address;
    this.gasPrice = gasPrice;
    this.script = script;
  }

  parse() {
    let lines = this.script.split("\n");
    let lc = lines.length;

    this.params = [];
    this.env = {};
    for (let i = 0; i < lc; i++) {
      if (lines[i].startsWith("PARAM")) {
        const p = lines[i].split(" ")[1];
        this.params.push(p);
        this.env[p] = lines[++i];
      }
    }
  }

  async run(onProgress) {
    let lines = this.script.split("\n");
    let lc = lines.length;

    for (let i = 0; i < lc; i++) {
      if (lines[i].startsWith("DEPLOY")) {
        const p = lines[i].split(" ")[1];
        const bytecode = lines[++i];
        const abi = eval(lines[++i]);
        const params = eval(lines[++i]);
        let [address] = await this.deployContract(bytecode, abi, params);
        this.env[p] = address;
        onProgress(p, address);
      }
    }
  }

  async sendTx(txObject) {
    const to = txObject._parent.options.address;
    const data = txObject.encodeABI();
    const from = this.sender;
    const gas = 5000000;
    const gasPrice = this.gasPrice;
    const nonce = await this.web3.eth.getTransactionCount(this.sender);
    const chainId = await this.web3.eth.net.getId();
    const tx = { from, to, nonce, data, gas, chainId, gasPrice };
    const signedTx = await this.web3.eth.accounts.signTransaction(
      tx,
      this.senderPk
    );
    return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction, {
      from: this.sender
    });
  }

  async deployContract(bytecode, abi, ctorArgs) {
    const contract = new this.web3.eth.Contract(abi);
    const deploy = contract.deploy({
      data: "0x" + bytecode,
      arguments: ctorArgs
    });
    const tx = await this.sendTx(deploy);
    contract.options.address = tx.contractAddress;
    return [tx.contractAddress, contract];
  }
}
