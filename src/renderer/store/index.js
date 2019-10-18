import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations.js'
import createLogger from 'vuex/dist/logger'
const debug = process.env.NODE_ENV !== 'production'

// import { createPersistedState, createSharedMutations } from 'vuex-electron'

// import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  // modules,
  actions,
  getters,
  state,
  mutations,
  // plugins: [
  //   createPersistedState(),
  //   createSharedMutations()
  // ],
  plugins: debug ? [createLogger()] : [],
  strict: process.env.NODE_ENV !== 'production'
})
