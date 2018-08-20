<template>
    <div class="accountContainer">
        <q-btn v-on:click="logout">Logout</q-btn>
    </div>    
</template>

<script>
import { mapMutations } from "vuex";
import firebase from "firebase";

export default {
    methods: {
      logout: function() {
          firebase
        .auth().signOut().then(() => {
          this.$store.commit('UPDATE_ISLOGGED_IN', false);
          this.$store.commit('TOGGLE_MENU', false);
        });
      }
  }
}
</script>

<style>

</style>
