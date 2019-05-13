<template>
  <div id='q-app'>
    <div class='appContainer'>
      <router-view/>
      <navigation></navigation>
    </div>
  </div>
</template>

<script>
import db from './firestore/firebaseInit'
import Navigation from './components/Navigation'
import firebase from 'firebase/app'
import { mapMutations } from 'vuex'

export default {
  components: {
    Navigation
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN', 'UPDATE_LOGGED_IN_USER_NAME', 'UPDATE_LOGGED_IN_USER_ID']),
    login() {
      const initializeAuth = new Promise(resolve => {
        firebase.auth().onAuthStateChanged(user => {
          resolve(user)
        })
      })
      initializeAuth.then(user => {
        if (user) {
          this.$store.commit('UPDATE_ISLOGGED_IN', true)
          this.$store.commit('UPDATE_LOGGED_IN_USER_ID')
          this.$store.commit('UPDATE_LOGGED_IN_USER_NAME')
          this.$router.push('/music')
        } else {
          this.$store.commit('UPDATE_ISLOGGED_IN', false)
        }
      })
    },
  },
  created() {
    this.login()
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
  margin-bottom: 50px;
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
  color: white;;
}

.q-field {
  width: 100%;
}
</style>
