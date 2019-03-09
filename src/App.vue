<template>
  <div id='q-app'>
    <div class='appContainer'>
      <tabs></tabs>
      <div
        class="heroImageContainer"
        v-if="!isLoggedIn"
      >
        <img
          class="heroImage"
          src="/statics/brand/PORTRAIT/EMOM Logo WHITE PORTRAIT  LARGE.png"
          alt=""
          vertical-middle
        />
      </div>
    </div>
  </div>
</template>

<script>
import db from './firestore/firebaseInit'
import Tabs from './components/Tabs'
import firebase from 'firebase/app'
import { mapMutations, mapState } from 'vuex'

export default {
  components: {
    Tabs
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN', 'UPDATE_LOGGED_IN_USER', 'UPDATE_CURR_TRACK', 'UPDATE_TRACKS_ARRAY', 'GET_TRACKS', 'GET_ALL_USERS']),
    login() {
      const initializeAuth = new Promise(resolve => {
        firebase.auth().onAuthStateChanged(user => {
          resolve(user)
        })
      })
      initializeAuth.then(user => {
        if (user) {
          this.$store.commit('UPDATE_ISLOGGED_IN', true)
          this.$store.commit('UPDATE_LOGGED_IN_USER', firebase.auth().currentUser.email)
          this.$store.commit('UPDATE_LOGGED_IN_USER_ID', firebase.auth().currentUser.uid)
          this.$store.commit('GET_ALL_USERS')
        } else {
          this.$store.commit('UPDATE_ISLOGGED_IN', false)
        }
      })
    },
  },
  created() {
    this.login()
    this.$store.commit('GET_TRACKS')
  },
  computed: {
    ...mapState(['isLoggedIn'])
  }
}
</script>

<style>
.appContainer {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: normal;
}

body {
  color: #ffffff !important;
  background-color: #11363a;
}

.q-tab-pane {
  border: none;
  padding: 0;
}

.q-card-container {
  padding-bottom: 0;
}

.q-field-label {
  color: #333333;
}

.q-field {
  width: 100%;
}

.heroImageContainer {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.heroImage {
  width: 370px;
  padding-top: 40px;
}
</style>
