<template>
  <div class="card" style="height: 100%; overflow-y: scroll;">
    <div class="card-content">
      <article class="media">
        <figure class="media-left">
          <p class="image is-128x128">
            <img :src="getImgUrl()" />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h3>{{ item.name }}</h3>
            <p>{{item.desc}}</p>
          </div>
        </div>
        <div class="media-right">
          <span style="cursor: pointer" @click="onLikeClick">
            <b-icon icon="heart" :type="isLiked ? 'is-primary' : ''"></b-icon>
          </span>
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
          <b-field v-for="(item, index) in params" v-bind:key="index" horizontal>
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
        <b-tab-item label="Instances" icon="briefcase" :disabled="!instances.length">
          <b-message v-for="(instance, index) in instances" v-bind:key="index" type="is-success">
            <ul>
              <li v-for="(item, index) in instance" v-bind:key="index" class="field">
                <strong>{{item.name}}</strong> deployed at
                <strong>{{item.address}}</strong>
              </li>
            </ul>
          </b-message>
          <b-message
            v-if="newInstance.length"
            :type="newInstance[newInstance.length -1].type == 'error' ? 'is-danger' : 'is-info'"
          >
            <ul>
              <li v-for="(item, index) in newInstance" v-bind:key="index" class="field">
                <p v-if="item.type == 'deploy'">
                  <strong>{{item.name}}</strong> deployed at
                  <strong>{{item.address}}</strong>
                </p>
                <p v-if="item.type == 'error'">
                  <strong>{{item.err}}</strong>
                </p>
              </li>
            </ul>
          </b-message>
        </b-tab-item>
      </b-tabs>
      <b-loading :is-full-page="false" :active.sync="isDeploying"></b-loading>
    </div>
  </div>
</template>

<script>
const Web3 = require("web3");

class MonkeyEngine {
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
        let [address, contract] = await this.deployContract(
          bytecode,
          abi,
          params
        );
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

export default {
  props: {
    item: Object,
    rpcServer: String,
    privateKey: String,
    gasPrice: Number
  },
  data() {
    return {
      instances: [],
      newInstance: [],
      params: [],
      env: {},
      activeTab: 1,
      isLiked: false,
      isDeploying: false,
      me: null
    };
  },
  created() {
    if (this.$props.item.instances) {
      this.instances = this.$props.item.instances;
      this.activeTab = 2;
    }
    this.isLiked = this.$props.item.isLiked;
    this.getDataFromApi();
  },
  methods: {
    getImgUrl() {
      return `/hub/${this.$props.item.id}/card.jpg`;
    },
    getDataFromApi() {
      this.$axios
        .get(`/hub/${this.$props.item.id}/monkeyfile`)
        .then(response => {
          this.me = new MonkeyEngine(
            this.$props.rpcServer,
            this.$props.privateKey,
            parseInt(this.$props.gasPrice),
            response.data
          );
          this.me.parse();
          this.params = this.me.params;
          this.env = this.me.env;
        });
    },
    onLikeClick(event) {
      this.isLiked = !this.isLiked;
      this.$emit("liked", this.$props.item.id);
    },
    async deploy() {
      this.activeTab = 2;
      this.isDeploying = true;
      let that = this;
      try {
        await this.me.run(function(name, address) {
          that.newInstance.push({ type: "deploy", name, address });
        });
        this.instances.push(this.newInstance);
        this.newInstance = [];
        this.$emit("deployed", this.$props.item.id, this.instances);
      } catch (e) {
        that.newInstance.push({ type: "error", err: e.toString() });
      }
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

