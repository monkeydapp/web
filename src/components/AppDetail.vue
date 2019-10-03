<template>
  <div class="card" style="height: 100%">
    <div class="card-content">
      <article class="media">
        <figure class="media-left">
          <p class="image is-128x128">
            <img src="/hub/uniswap/card.jpg" />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h3>Uniswap</h3>

            <p>
              Uniswap is a protocol for automated token exchange on Ethereum.
              A simple smart contract interface for swapping ERC20 tokens
              A formalized model for pooling liquidity reserves
              An open source frontend interface for traders and liquidity providers
              A commitment to free and decentralized asset exchange
            </p>
          </div>
        </div>
        <div class="media-right">
          <b-button type="is-text" size="is-large" icon-left="heart" @click="onViewClick"></b-button>
        </div>
      </article>
    </div>
    <div style="position:relative">
      <b-tabs type="is-boxed" v-model="activeTab">
        <b-tab-item label="Info" icon="information">
          <div class="b-table">
            <div class="table-wrapper">
              <table class="table has-mobile-cards">
                <tbody>
                  <tr>
                    <td class="strong">Website</td>
                    <td>
                      <a href="https://uniswap.io/" target="_blank">https://uniswap.io/</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Network</td>
                    <td>
                      <b-taglist>
                        <b-tag type="is-primary">Matic</b-tag>
                        <b-tag type="is-primary">Ganache</b-tag>
                        <b-tag type="is-info">Rinkeby</b-tag>
                        <b-tag type="is-info">Ropsten</b-tag>
                        <b-tag type="is-warning">Poa</b-tag>
                        <b-tag type="is-danger">Mainnet</b-tag>
                      </b-taglist>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Contributor</td>
                    <td>
                      <b-tag>Community</b-tag>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Version</td>
                    <td>
                      <b-taglist>
                        <b-tag type="is-primary">latest</b-tag>
                      </b-taglist>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Updated</td>
                    <td>
                      <b-tag type="is-primary">03/10/2019</b-tag>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item label="Deploy" icon="download">
          <b-field v-for="(item, index) in items" v-bind:key="index" horizontal>
            <template slot="label">
              {{ item }}
              <b-tooltip type="is-dark" label="Help text here for explanation">
                <b-icon size="is-small" icon="help-circle-outline"></b-icon>
              </b-tooltip>
            </template>
            <b-input type="text" v-model="env[item]" :placeholder="item" required></b-input>
          </b-field>
          <b-field horizontal>
            <p class="control">
              <button class="button is-primary" @click="deploy()">Deploy</button>
            </p>
          </b-field>
        </b-tab-item>
        <b-tab-item label="Instance" icon="briefcase"></b-tab-item>
      </b-tabs>
      <b-loading :is-full-page="false" :active.sync="isDeploying"></b-loading>
    </div>
  </div>
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
      activeTab: 1,
      isDeploying: false,
      me: null
    };
  },
  created() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.$axios.get("/hub/erc20/monkeyfile").then(response => {
        this.me = new MonkeyEngine(response.data);
        this.me.parse();
        this.items = this.me.params;
        this.env = this.me.env;
      });
    },
    async deploy() {
      this.activeTab = 2;
      this.isDeploying = true;
      await this.me.deploy();
      this.isDeploying = false;
    }
  }
};
</script>

<style>
.strong {
  font-weight: bold;
  width: 200px;
}
</style>

