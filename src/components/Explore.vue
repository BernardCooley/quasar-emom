<template>
  <div class="exploreContainer">
    <div class="trackCard" v-for="(track, index) in tracksArray" :key="index">
        <div class="cardContentContainer tabItem" v-on:click="playTrack(track.filename)" slot="title" name="music"></div>
        <div v-on:click="getUserTracks(track.metaData.uploadedById)" class="artist">{{track.metaData.artist}}</div>
        <div class="title">{{track.metaData.title}}</div>
        <router-link tag="div" to="/play">
          <img class="cardImage" :src="track.metaData.artworkUrl">
        </router-link>
        <div class="trackInfoContainer">
          <div class="trackInfoItem">
            <img src="statics/icons/listens.svg" alt="listens image"/>
            <div class="counter">4</div>
          </div>
          <div class="trackInfoItem">
            <img class="favouritesIcon" src="statics/icons/favorite.1.svg" alt="favourited image"/>
            <div class="counter">10</div>
          </div>
          <div class="trackInfoItem">
            <img src="statics/icons/comment.svg" alt="comments image"/>
            <div class="counter">3</div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "explore",
  created() {
    if (this.tracksArray.length == 0) {
      this.$store.commit("GET_TRACKS");
    }
  },
  computed: {
    ...mapState(["tracksArray"])
  },
  methods: {
      ...mapMutations(['UPDATE_CURRENT_TRACK']),
    playTrack(filename) {
        this.$store.commit('UPDATE_CURRENT_TRACK', this.$store.currentTrack = this.tracksArray.filter(track => track.filename == filename)[0])
    },
    getUserTracks(userId) {
      this.$store.commit('GET_TRACKS', userId)
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
  padding: 0 20px;
  height: 100%;
  border-top: 1px solid gray;
  border-bottom: 1px solid gray;
}
.artist {
  font-size: 30px;
}
.title {
  font-size: 20px;
  padding-bottom: 10px;
}
.trackInfoContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding-top: 10px;
}
.trackInfoItem {
  height: 35px
}
.trackInfoItem {
  img {
    height: 100%;
    opacity: 0.8;
  }
  .counter {
    width: auto;
    position: relative;
    top: -39px;
    font-size: 22px;
    text-align: center;
    height: 30px;
    left: 3px;
  }
}
</style>
