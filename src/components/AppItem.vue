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
          <small>@hub/{{ item.id }}</small>
          <br />
          {{ item.desc }}
        </p>
      </div>
      <nav class="level is-mobile">
        <div class="level-left">
          <a class="level-item" @click="onLikeClick">
            <span class="icon is-small">
              <i class="fas fa-heart"></i>
            </span>
          </a>
        </div>
      </nav>
    </div>
    <div class="media-right">
      <b-button type="is-link" size="is-medium" icon-left="download" @click="cardModal()"></b-button>
    </div>
  </article>
</template>

<script>
import AppDetail from "./AppDetail.vue";

export default {
  name: "AppItem",
  props: {
    item: Object
  },
  methods: {
    getImgUrl() {
      return `/hub/${this.item.id}/card.jpg`;
    },
    cardModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AppDetail,
        hasModalCard: true,
        width: "100%"
      });
    },
    onLikeClick(event) {
      this.$emit("liked", this.$props.item.id);
    }
  }
};
</script>