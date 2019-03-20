<template>
  <div class="tabContainer row justify-between tabsAndPaneContainer">
    <q-tabs position="bottom" animated swipeable class="">
      <q-tab v-if="isLoggedIn" class="tabItem" slot="title" name="music" icon="fas fa-music"/>
      <q-tab v-if="isLoggedIn" class="tabItem" slot="title" name="explore" icon="fas fa-user-plus"/>
      <q-tab v-if="isLoggedIn" class="tabItem" slot="title" name="addTrack" icon="fas fa-plus-circle"/>
      <q-tab v-if="isLoggedIn" class="tabItem" slot="title" name="search" icon="fas fa-search"/>
      <q-tab v-if="isLoggedIn" class="tabItem accountIcon" slot="title" name="account" icon="fas fa-user-alt"/>
      <q-tab v-if="!isLoggedIn" class="col-6 tabItem" slot="title" name="login" icon="fas fa-sign-in-alt"/>
      <q-tab v-if="!isLoggedIn" class="col-6 tabItem" slot="title" name="register" icon="fas fa-user-plus"/>


      <q-tab-pane class="tabPane" name="login"><login /></q-tab-pane>
      <q-tab-pane class="tabPane" name="register"><register /></q-tab-pane>
      <q-tab-pane class="tabPane" name="music"><music /></q-tab-pane>
      <q-tab-pane class="tabPane" name="account"><account /></q-tab-pane>
      <q-tab-pane class="tabPane" name="addTrack"><add-track /></q-tab-pane>
      <q-tab-pane class="tabPane" name="search"><search /></q-tab-pane>
      <q-tab-pane class="tabPane" name="explore"><explore /></q-tab-pane>
    </q-tabs>
  </div>
</template>

<script>
import Login from "../components/Login"
import Register from "../components/Register"
import Account from "../components/Account"
import Music from "../components/Music"
import AddTrack from "../components/AddTrack"
import Explore from "../components/Explore"

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
    AddTrack,
    Explore
  },
  computed: {
    ...mapState(['isLoggedIn', 'tracksArray'])
  }
};
</script>

<style lang="scss">
.tabContainer {
  // position: fixed;
  // top: 0;
  // z-index: 1;
  // width: 100%;
  // height: 60px;

  .accountIcon {
    color: white;
  }
}

.bg-primary {
  background-color: transparent !important;
}

.q-tabs-head {
  box-shadow: none !important;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 2;
}

.q-tabs-scroller {
  background-image: linear-gradient(rgb(0, 158, 152), rgb(37, 111, 119));
}

.tabsAndPaneContainer {
  display: flex;
  flex-direction: column;
}

.q-tabs {
  margin-bottom: 50px;
}
</style>
