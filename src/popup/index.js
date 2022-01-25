import 'bulma-fluent/bulma.sass'
import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '../assets/demo.css'

Vue.use(Vuetify)

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: h => h(App),
})
