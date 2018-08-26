<template>
    <div id="q-app">
        <div class="appContainer">
            <tabs></tabs>
        </div>
    </div>
</template>

<script>
import db from "./firestore/firebaseInit"
import Tabs from "./components/Tabs"
import firebase from "firebase"
import { mapMutations, Vuex } from "vuex"
import store from "./store"

export default {
  components: {
    Tabs
  },
  methods: {
    ...mapMutations(["UPDATE_ISLOGGED_IN", "UPDATE_LOGGED_IN_USER"])
  },
  created() {
    const initializeAuth = new Promise(resolve => {
      firebase.auth().onAuthStateChanged(user => {
        resolve(user)
      })
    })

    initializeAuth.then(user => {
      if (user) {
        console.log("Logged In")
        this.$store.commit("UPDATE_ISLOGGED_IN", true)
        this.$store.commit(
          "UPDATE_LOGGED_IN_USER",
          firebase.auth().currentUser.email
        )
      } else {
        console.log("Not Logged In")
        this.$store.commit("UPDATE_ISLOGGED_IN", false)
      }
    })
  }
}
</script>

<style>
.pageContainer {
  height: 100%;
  overflow: hidden;
}
</style>
