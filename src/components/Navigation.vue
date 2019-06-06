<template>
  <div class="tabContainer" v-if="isLoggedIn">
      <router-link tag="i" class="navItem fas fa-music" class-active="active" to="/music" exact></router-link>
      <router-link tag="i" class="navItem fas fa-plus" class-active="active" to="/upload" exact></router-link>
      <router-link tag="i" class="navItem fas fa-user-alt" class-active="active" to="/account" exact></router-link>
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

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.tabContainer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;

  i {
    font-size: 30px;
  }
}
.navItem {
  background-image: linear-gradient(rgb(0, 158, 152), rgb(37, 111, 119));
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active {
  background-image: linear-gradient(#11363a, #0d6d69);
}
</style>
