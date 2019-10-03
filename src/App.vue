<template>
  <section>
    <!-- <NavBar /> -->
    <div class="container is-fluid" id="app">
      <div class="columns">
        <div class="column is-one-third">
          <div class="sticky">
            <figure class="image">
              <img src="/logo.jpg" alt="Placeholder image" />
            </figure>
            <br />
            <br />
            <b-field label="RPC Server">
              <b-input v-model="rpcServer" required></b-input>
            </b-field>
            <b-field label="Private key">
              <b-input type="password" v-model="privateKey" required password-reveal></b-input>
            </b-field>
            <button @click="check()" class="button is-primary">Check</button>
            <br />
            <br />

            <b-field label="Log">
              <b-input v-model="logs" type="textarea"></b-input>
            </b-field>
          </div>
        </div>
        <div class="column">
          <b-tabs type="is-boxed" class="block">
            <b-tab-item label="All" icon="view-list">
              <AppItem
                v-for="(item, index) in items"
                v-bind:key="index"
                :item="item"
                @liked="onLikeClick"
                @view="onViewClick"
              />
            </b-tab-item>
            <b-tab-item label="Favourite" icon="heart" :disabled="!liked.length">
              <AppItem
                v-for="(item, index) in likedItems"
                v-bind:key="index"
                :item="item"
                @liked="onLikeClick"
              />
            </b-tab-item>
            <b-tab-item label="Installed" icon="download" :disabled="!installed.length">
              <AppItem
                v-for="(item, index) in installedItems"
                v-bind:key="index"
                :item="item"
                @liked="onLikeClick"
              />
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </div>

    <b-modal :active.sync="isViewModalActive" width="90%">
      <div class="card" style="height: 600px">
        <b-tabs type="is-boxed">
          <b-tab-item label="Info" icon="google-photos">
            <article class="media">
              <figure class="media-left">
                <p class="image is-128x128">
                  <img src="/hub/uniswap/card.jpg" />
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>Uniswaqp</strong>
                    <b-tag>Community</b-tag>
                    <br />Kyber is an on-chain liquidity protocol that aggregates liquidity from a wide range of reserves, powering instant and secure token exchange in any decentralized application.
                  </p>
                </div>
                <nav class="level is-mobile">
                  <div class="level-left">
                    <b-taglist>
                      <b-tag type="is-primary">Matic</b-tag>
                      <b-tag type="is-primary">Ganache</b-tag>
                      <b-tag type="is-info">Rinkeby</b-tag>
                      <b-tag type="is-info">Ropsten</b-tag>
                      <b-tag type="is-warning">Poa</b-tag>
                      <b-tag type="is-danger">Mainnet</b-tag>
                    </b-taglist>
                  </div>
                </nav>
              </div>
              <div class="media-right">
                <b-button type="is-link" size="is-medium" icon-left="download" @click="onViewClick"></b-button>
              </div>
            </article>
          </b-tab-item>
          <b-tab-item label="Deploy" icon="library-music"></b-tab-item>
          <b-tab-item label="Instance" icon="video"></b-tab-item>
        </b-tabs>
      </div>
    </b-modal>
  </section>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import AppItem from "./components/AppItem.vue";

export default {
  name: "app",
  components: {
    NavBar,
    AppItem
  },
  data() {
    return {
      isViewModalActive: true,
      items: [],
      liked: [],
      installed: [],
      logs: "",
      rpcServer: "http://127.0.0.1:7545",
      privateKey:
        "0xcc90ad96b5bac509225d6d429e030428b90777c73c6b958826933d489b6c8f9b"
    };
  },
  computed: {
    likedItems: function() {
      let that = this;
      return this.items.filter(function(item) {
        return that.liked.includes(item.id);
      });
    },
    installedItems: function() {
      let that = this;
      return this.items.filter(function(item) {
        return that.installed.includes(item.id);
      });
    }
  },
  created() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.$axios.get("/hub/list.json").then(response => {
        this.items = response.data;
      });
    },
    onLikeClick(value) {
      if (this.liked.includes(value)) {
        var index = this.liked.indexOf(value);
        if (index > -1) {
          this.liked.splice(index, 1);
        }
      } else {
        this.liked.push(value);
      }
    },
    onViewClick(value) {
      this.isViewModalActive = true;
    },
    check() {
      const Web3 = require("web3");
      const web3 = new Web3(new Web3.providers.HttpProvider(this.rpcServer));
      const sender = web3.eth.accounts.privateKeyToAccount(this.privateKey)
        .address;
      let that = this;
      web3.eth.net.getId().then(netId => {
        that.logs += netId + "\n";
      });
      web3.eth.getBalance(sender, function(error, result) {
        that.logs += result + "\n";
      });
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 32px;
}
.sticky {
  position: sticky;
}
</style>
