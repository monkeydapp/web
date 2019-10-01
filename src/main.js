import Vue from "vue";
import App from "./App.vue";
import Buefy from "buefy";
import Axios from "axios";
import "buefy/dist/buefy.css";

Vue.use(Buefy);
Vue.prototype.$axios = Axios;
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
