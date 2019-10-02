<template>
  <div class="card">
    <div class="card-image">
      <figure class="image">
        <img :src="getImgUrl()" alt="Placeholder image" />
      </figure>
    </div>
    <div class="card-content">
      <p class="title is-5">{{ name }}</p>
      <!-- <p class="subtitle is-6">@johnsmith</p> -->
      <!-- <div class="content">
      Collect and breed adorable digital cats
      </div>-->
    </div>
    <footer class="card-footer">
      <a href="#" @click="cardModal()" class="card-footer-item">Deploy</a>
      <a href="#" class="card-footer-item">View</a>
    </footer>
  </div>
</template>

<script>
import AppDetail from "./AppDetail.vue";

export default {
  name: "AppCard",
  props: {
    name: String
  },
  methods: {
    getImgUrl() {
      return `/hub/${this.name}/card.jpg`;
    },
    cardModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AppDetail,
        hasModalCard: true,
        width: "100%"
      });
    }
  }
};
</script>