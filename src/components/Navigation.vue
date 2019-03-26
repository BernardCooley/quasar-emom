<template>
  <div class="tabContainer">
      <router-link v-if="isLoggedIn" tag="i" class="navItem fas fa-music" class-active="active" to="/music" exact></router-link>
      <router-link v-if="isLoggedIn" tag="i" class="navItem fas fa-plus" class-active="active" to="/upload" exact></router-link>
      <router-link v-if="isLoggedIn" tag="i" class="navItem fas fa-user-alt" class-active="active" to="/account" exact></router-link>
      <router-link v-if="!isLoggedIn" tag="i" class="navItem fas fa-sign-in-alt" class-active="active" to="/login" exact></router-link>
      <router-link v-if="!isLoggedIn" tag="i" class="navItem fas fa-user-plus" class-active="active" to="/register" exact></router-link>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  computed: {
    ...mapState(['isLoggedIn'])
  }
  
}
</script>

<style lang="scss">
@import "../css/commonStyles.scss";

.tabContainer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
}
.navItem {
  background-image: linear-gradient(rgb(0, 158, 152), rgb(37, 111, 119));
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.tabContainer i {
  font-size: 30px;
}
</style>
