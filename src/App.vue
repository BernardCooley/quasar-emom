<template>
  <div id='q-app'>
    <div class='appContainer'>
      <tabs></tabs>
    </div>
  </div>
</template>

<script>
import db from './firestore/firebaseInit'
import Tabs from './components/Tabs'
import firebase from 'firebase/app'
import { mapMutations } from 'vuex'
import Services from './components/Services'

export default {
  components: {
    Tabs,
    Services
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN', 'UPDATE_LOGGED_IN_USER']),
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
          try {
            Services.methods.loadTracks()
          } catch (error) {
            console.error(error)
          }
        } else {
          this.$store.commit('UPDATE_ISLOGGED_IN', false)
        }
      })
    }
  },
  created() {
    this.login()
  },
  mounted() {
    // Services.methods.loadTracks()
    // this.loadTracks()
  }
}
</script>

<style>
.pageContainer {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: normal;
}

.backgroundImage {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: -1;
}

body {
  color: #333333 !important;
  /*background-image: linear-gradient(to bottom right, #267E84, #14938E);*/
}

.q-tab-pane {
  border: none;
  padding: 15px 0;
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
</style>
