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
                      <a :href="item.website" target="_blank">{{item.website}}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Network</td>
                    <td>
                      <b-taglist>
                        <b-tag type="is-info">Matic</b-tag>
                        <b-tag type="is-info">Ganache</b-tag>
                        <b-tag type="is-info">Rinkeby</b-tag>
                        <b-tag type="is-info">Ropsten</b-tag>
                        <b-tag>Poa</b-tag>
                        <b-tag>Mainnet</b-tag>
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
                        <b-tag type="is-info">latest</b-tag>
                      </b-taglist>
                    </td>
                  </tr>
                  <tr>
                    <td class="strong">Updated</td>
                    <td>
                      <b-tag type="is-info">03/10/2019</b-tag>
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
import MonkeyEngine from "../engine/MonkeyEngine";

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
    onLikeClick() {
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

