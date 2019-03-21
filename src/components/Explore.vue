<template>
  <div class="exploreContainer">
    <div class="trackCard" v-for="(track, index) in tracksArray" :key="index">
        <router-link tag="div" to="/play">
            <div class="cardContentContainer tabItem" v-on:click="playTrack(track.filename)" slot="title" name="music"></div>
            <div class="artist">{{track.metaData.artist}}</div>
            <div class="title">{{track.metaData.title}}</div>
            <img class="cardImage" :src="track.metaData.artworkUrl">
            <div class="trackActions"></div>
        </router-link>
      </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "explore",
  created() {
    if (this.tracksArray.length == 0) {
      this.$store.commit("GET_TRACKS", "all");
    }
  },
  computed: {
    ...mapState(["tracksArray"])
  },
  methods: {
      ...mapMutations(['UPDATE_CURRENT_TRACK']),
    playTrack(filename) {
        this.$store.commit('UPDATE_CURRENT_TRACK', this.$store.currentTrack = this.tracksArray.filter(track => track.filename == filename)[0])
    }
  }
};
</script>

<style lang="scss">
.trackCard {
  width: 100%;
  height: auto;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #256f77;
}
.cardContentContainer {
    width: 100%;
    height: 100%;
}
.cardImage {
  width: 100%;
  padding: 20px;
  height: 100%;
}
.artist {
  font-size: 30px;
}
.title {
  font-size: 20px;
}
</style>
