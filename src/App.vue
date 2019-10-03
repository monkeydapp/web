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
            <b-field grouped style="margin-top: 30px">
              <b-field label="RPC Server">
                <b-input v-model="rpcServer" required></b-input>
              </b-field>
              <b-field label="Gas price" expanded>
                <b-input type="number" v-model="gasPrice" min="0" required></b-input>
              </b-field>
            </b-field>
            <b-field label="Private key">
              <b-input type="password" v-model="privateKey" required password-reveal></b-input>
            </b-field>
          </div>
        </div>
        <div class="column">
          <b-tabs type="is-boxed" class="block" v-model="activeTab">
            <b-tab-item label="All" icon="view-list">
              <AppItem
                v-for="(item, index) in items"
                v-bind:key="index"
                :item="item"
                @view="onViewClick"
              />
            </b-tab-item>
            <b-tab-item label="Favourite" icon="heart" :disabled="!liked.length">
              <AppItem
                v-for="(item, index) in likedItems"
                v-bind:key="index"
                :item="item"
                @view="onViewClick"
              />
            </b-tab-item>
            <b-tab-item label="Installed" icon="download" :disabled="!installed.length">
              <AppItem
                v-for="(item, index) in installedItems"
                v-bind:key="index"
                :item="item"
                @view="onViewClick"
              />
            </b-tab-item>
            <b-tab-item label="Monkeyfile" icon="script" :disabled="true"></b-tab-item>
          </b-tabs>
        </div>
      </div>
    </div>

    <b-modal :active.sync="isViewModalActive" width="90%" :can-cancel="['x']">
      <AppDetail
        :rpcServer="rpcServer"
        :privateKey="privateKey"
        :gasPrice="parseInt(gasPrice)"
        :item="detail"
        @liked="onLikeClick"
        @deployed="onDeployed"
      />
    </b-modal>
  </section>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import AppItem from "./components/AppItem.vue";
import AppDetail from "./components/AppDetail.vue";

export default {
  name: "app",
  components: {
    NavBar,
    AppItem,
    AppDetail
  },
  data() {
    return {
      activeTab: 0,
      isViewModalActive: false,
      items: [],
      liked: [],
      installed: [],
      instances: {},
      logs: "",
      detail: null,
      rpcServer: "http://127.0.0.1:7545",
      privateKey:
        "0xcc90ad96b5bac509225d6d429e030428b90777c73c6b958826933d489b6c8f9b",
      gasPrice: 0
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
    let liked = localStorage.getItem("liked");
    if (liked) {
      this.liked = JSON.parse(liked);
    }
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.$axios.get("/hub/list.json").then(response => {
        this.items = response.data;
      });
    },
    onLikeClick(id) {
      if (this.liked.includes(id)) {
        var index = this.liked.indexOf(id);
        if (index > -1) {
          this.liked.splice(index, 1);
          if (this.liked.length == 0 && this.activeTab == 1) {
            this.activeTab = 0;
          }
        }
      } else {
        this.liked.push(id);
      }
      localStorage.setItem("liked", JSON.stringify(this.liked));
    },
    onViewClick(id) {
      for (let i in this.items) {
        if (this.items[i].id == id) {
          this.detail = this.items[i];
          this.detail.instances = this.instances[id];
          this.detail.isLiked = this.liked.includes(id);
        }
      }
      this.isViewModalActive = true;
    },
    onDeployed(id, instances) {
      this.installed.push(id);
      this.instances[id] = instances;
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
.modal .modal-content {
  height: 100%;
}
</style>
