<template>
  <div>
    <q-tabs>
      <div
        class="tabContainer row justify-between"
        v-if="isLoggedIn"
      >
        <q-tab
          class="col-3 tabItem"
          :count="tracksArray.length"
          slot="title"
          name="music"
          icon="fas fa-music"
        />
        <q-tab
          class="col-3 tabItem"
          slot="title"
          name="addTrack"
          icon="fas fa-plus-circle"
        />
        <q-tab
          class="col-3 tabItem"
          slot="title"
          name="search"
          icon="fas fa-search"
        />
        <q-tab
          class="col-3 tabItem"
          slot="title"
          name="account"
          icon="fas fa-user-alt"
        />
      </div>
      <div
        class="tabContainer row justify-between"
        v-else
      >
        <q-tab
          class="col-6 tabItem"
          slot="title"
          name="login"
          icon="fas fa-sign-in-alt"
        />
        <q-tab
          class="col-6 tabItem"
          slot="title"
          name="register"
          icon="fas fa-user-plus"
        />
      </div>

      <q-tab-pane name="login">
        <login />
      </q-tab-pane>
      <q-tab-pane name="register">
        <register />
      </q-tab-pane>
      <q-tab-pane name="music">
        <music />
      </q-tab-pane>
      <q-tab-pane name="account">
        <account />
      </q-tab-pane>
      <q-tab-pane name="addTrack">
        <add-track />
      </q-tab-pane>
      <q-tab-pane name="search">
        <search />
      </q-tab-pane>
    </q-tabs>
  </div>
</template>

<script>
import Login from "../components/Login"
import Register from "../components/Register"
import Account from "../components/Account"
import Music from "../components/Music"
import AddTrack from "../components/AddTrack"

import { mapState } from "vuex"
import firebase from "firebase/app"

export default {
  data() {
    return {
      newTracksCount: 6
    };
  },
  components: {
    Login,
    Register,
    Music,
    Account,
    AddTrack
  },
  computed: {
    ...mapState(['isLoggedIn', 'tracksArray'])
  }
};
</script>

<style>
.tabContainer {
  position: fixed;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 60px;
}

.bg-primary {
  background-color: transparent !important;
}

.q-tabs-head {
  box-shadow: none !important;
}
</style>
