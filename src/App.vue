<template>
  <section>
    <!-- <NavBar /> -->
    <div class="container">
      <div class="columns is-mobile">
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
      </div>
      <div class="columns is-mobile">
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
        <div class="column">
          <AppCard />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import AppCard from "./components/AppCard.vue";

export default {
  name: "app",
  components: {
    NavBar,
    AppCard
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
  margin-top: 60px;
}
</style>
