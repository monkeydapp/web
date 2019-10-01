<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <img
          src="https://dap.ps/static/media/crytokittes_banner.e9cbce4a.png"
          alt="Placeholder image"
        />
      </figure>
    </div>
    <div class="card-content">
      <p class="title is-4">CryptoKitties</p>
      <p class="subtitle is-6">@johnsmith</p>
      <!-- <div class="content">
      Collect and breed adorable digital cats
      </div>-->
    </div>
    <footer class="card-footer">
      <a href="#" @click="cardModal()" class="card-footer-item">Save</a>
      <a href="#" @click="imageModal()" class="card-footer-item">Edit</a>
      <a href="#" class="card-footer-item">Delete</a>
    </footer>
  </div>
</template>

<script>
import AppDetail from "./AppDetail.vue";

export default {
  name: "AppCard",
  methods: {
    imageModal() {
      this.$buefy.modal.open(
        `<p class="image is-4by3">
                        <img src="https://buefy.org/static/img/placeholder-1280x960.png">
                    </p>`
      );
    },
    cardModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AppDetail,
        hasModalCard: true
        // customClass: "custom-class custom-class-2"
      });
    }
  }
};
</script>