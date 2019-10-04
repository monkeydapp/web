<template>
  <article class="media">
    <figure class="media-left">
      <p class="image is-64x64">
        <img :src="getImgUrl()" />
      </p>
    </figure>
    <div class="media-content">
      <div class="content">
        <p>
          <strong>{{ item.name }}</strong>
          <b-tag v-if="item.available">Community</b-tag>
          <b-tag v-if="!item.available">Coming soon</b-tag>
          <br />
          {{ item.desc }}
        </p>
      </div>
      <nav class="level is-mobile">
        <div class="level-left">
          <b-taglist>
            <b-tag :type="item.available ? 'is-info' : ''">Matic</b-tag>
            <b-tag :type="item.available ? 'is-info' : ''">Ganache</b-tag>
            <b-tag :type="item.available ? 'is-info' : ''">Rinkeby</b-tag>
            <b-tag :type="item.available ? 'is-info' : ''">Ropsten</b-tag>
            <b-tag>Poa</b-tag>
            <b-tag>Mainnet</b-tag>
          </b-taglist>
        </div>
      </nav>
    </div>
    <div class="media-right">
      <b-button
        v-if="item.available"
        type="is-link"
        size="is-medium"
        icon-left="download"
        @click="onViewClick"
      ></b-button>
    </div>
  </article>
</template>

<script>
export default {
  name: "AppItem",
  props: {
    item: Object
  },
  methods: {
    getImgUrl() {
      return `/hub/${this.$props.item.id}/card.jpg`;
    },
    onViewClick() {
      this.$emit("view", this.$props.item.id);
    }
  }
};
</script>