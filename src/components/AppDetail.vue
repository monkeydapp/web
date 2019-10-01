<template>
  <!-- <form action> -->
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Login</p>
    </header>
    <section class="modal-card-body">
      <b-field
        v-for="(item, index) in items"
        v-bind:key="index"
        :label="item"
        label-position="on-border"
      >
        <b-input type="text" v-model="env[item]" :placeholder="item" required></b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Close</button>
      <button class="button is-primary" @click="deploy()">Login</button>
    </footer>
  </div>
  <!-- </form> -->
</template>

<script>
const Web3 = require("web3");
const rpcUrl = "http://127.0.0.1:7545";
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const gasPrice = 0;
const chainId = 5777;

const senderPk =
  "cc90ad96b5bac509225d6d429e030428b90777c73c6b958826933d489b6c8f9b";
const sender = web3.eth.accounts.privateKeyToAccount(senderPk).address;

async function sendTx(txObject) {
  const to = txObject._parent.options.address;
  const data = txObject.encodeABI();
  const from = sender;
  const gas = 5000000;
  const nonce = await web3.eth.getTransactionCount(sender);
  const tx = { from, to, nonce, data, gas, chainId, gasPrice };
  const signedTx = await web3.eth.accounts.signTransaction(tx, senderPk);
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction, {
    from: sender
  });
}

async function deployContract(bytecode, abi, ctorArgs) {
  const contract = new web3.eth.Contract(abi);
  const deploy = contract.deploy({
    data: "0x" + bytecode,
    arguments: ctorArgs
  });
  const tx = await sendTx(deploy);
  contract.options.address = tx.contractAddress;
  return [tx.contractAddress, contract];
}

class MonkeyEngine {
  constructor(script) {
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

  async deploy() {
    let lines = this.script.split("\n");
    let lc = lines.length;

    for (let i = 0; i < lc; i++) {
      if (lines[i].startsWith("DEPLOY")) {
        const p = lines[i].split(" ")[1];
        const bytecode = lines[++i];
        const abi = eval(lines[++i]);
        const params = eval(lines[++i]);
        let [address, contract] = await deployContract(bytecode, abi, params);
        this.env[p] = address;
        console.log(`${p} contract address: ${address}`);
      }
    }
  }
}

export default {
  data() {
    return {
      items: [],
      env: {},
      me: null
    };
  },
  created() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.$axios.get("/hub/monkeyfile").then(response => {
        this.me = new MonkeyEngine(response.data);
        this.me.parse();
        this.items = this.me.params;
        this.env = this.me.env;
      });
    },
    async deploy() {
      // let [kncAddress, kncContract] = await deployContract(bytecode, abi, []);
      // console.log("KyberNetworkCrystal: ", kncAddress);
      // this.$axios.get("/hub/erc20/monkeyfile").then(response => {
      //   new MonkeyEngine(response.data).parse();
      // });
      await this.me.deploy();
    }
  }
};
</script>
