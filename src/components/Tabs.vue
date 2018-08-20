<template>
    <div>
        <q-tabs>
            <div class="tabContainer row justify-between">
                <q-tab class="col-2" :disable=false slot="title" name="tab-1" icon="fas fa-sign-in-alt" />
                <q-tab class="col-2" :disable=false slot="title" name="tab-2" icon="fas fa-user-plus" />
                <q-tab class="col-2" :disable=false :count="newTracksCount" slot="title" name="tab-3" icon="fas fa-music" />
                <q-tab class="col-2" :disable=false slot="title" name="tab-4" icon="fas fa-user-alt" />
                <q-tab class="col-2" :disable=false slot="title" v-on:click="logout" icon="fas fa-sign-out-alt"/>
            </div>

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
  }
};
</script>

<style>
.tabContainer {
    position: fixed;
    top: 0;
    background-color: rgb(2, 123, 227);
    z-index: 1;
    width: 100%;
}
</style>
