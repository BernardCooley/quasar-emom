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
import { mapMutations, mapState } from 'vuex'

export default {
  components: {
    Navigation
  },
  computed: {
    ...mapState(['loggedInUserId'])
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN', 'UPDATE_LOGGED_IN_USER_NAME', 'UPDATE_LOGGED_IN_USER_ID', 'UPDATE_IS_USER_ADMIN']),
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

          db.collection('users').where('userID', '==', this.loggedInUserId).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                doc.data().admin ? this.$store.commit('UPDATE_IS_USER_ADMIN', true) : this.$store.commit('UPDATE_IS_USER_ADMIN', false)
              })
            })
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

<style lang="scss" scoped>
.appContainer {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: normal;
  margin-bottom: 50px;
}

.q-tab-pane {
  border: none;
  padding: 0;
}

.q-card-container {
  padding-bottom: 0;
}

.q-field {
  width: 100%;
}
</style>
