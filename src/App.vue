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
          <b-tabs position="is-centered" class="block">
            <b-tab-item label="All">
              <AppItem
                v-for="(item, index) in items"
                v-bind:key="index"
                :item="item"
                @liked="onLikeClick"
              />
            </b-tab-item>
            <b-tab-item label="Liked">
              <AppItem
                v-for="(item, index) in likedItems"
                v-bind:key="index"
                :item="item"
                @liked="onLikeClick"
              />
            </b-tab-item>
            <b-tab-item label="Installed">
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
