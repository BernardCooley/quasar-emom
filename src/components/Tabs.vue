<template>
    <div>
        <q-tabs>
            <q-tab :disable=isLoggedIn slot="title" name="tab-1" icon="fas fa-sign-in-alt" />
            <q-tab :disable=isLoggedIn slot="title" name="tab-2" icon="fas fa-user-plus" />
            <q-tab :disable=!isLoggedIn :count="newTracksCount" slot="title" name="tab-3" icon="fas fa-music" />
            <q-tab :disable=!isLoggedIn slot="title" name="tab-4" icon="fas fa-user-alt" />
            <q-tab :disable=!isLoggedIn slot="title" v-on:click="logout" icon="fas fa-sign-out-alt"/>

            <q-tab-pane name="tab-1"><login /></q-tab-pane>
            <q-tab-pane name="tab-2"><register /></q-tab-pane>
            <q-tab-pane name="tab-3"><music /></q-tab-pane>
            <q-tab-pane name="tab-4"><account /></q-tab-pane>
        </q-tabs>  
    </div>  
</template>

<script>
import Login from "../components/Login";
import Register from "../components/Register";
import Music from "../components/Music";
import { mapState, mapMutations } from "vuex";
import firebase from "firebase";

export default {
  data() {
    return {
      newTracksCount: 6
    };
  },
  components: {
    Login,
    Register,
    Music
  },
  methods: {
      logout: function() {
          firebase
        .auth().signOut().then(() => {
          this.$store.commit('UPDATE_ISLOGGED_IN', false);
          this.$store.commit('TOGGLE_MENU', false);
          this.$router.push("/login");
        });
      }
  },
  computed: {
    ...mapState(["isLoggedIn"])
  },
  created() {
      if(this.isLoggedIn) {
          console.log('logged in')
      }else {
          console.log('not logged in')
      }
  }
};
</script>

<style>
</style>
