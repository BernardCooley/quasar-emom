<template>
<div>
  <div :class="[exploreIsExpanded ? 'exploreExpanded' : 'exploreCollapsed', 'exploreContainer']">
    <div class="trackCard" v-for="(track, index) in tracksArray" :key="index">
      <div v-on:click="getUserTracks(track.metaData.uploadedById)" class="artist">{{track.metaData.artist}}</div>
      <div class="title">{{track.metaData.title}}</div>
      <img class="cardImage" v-on:click="toggleExplore" :src="track.metaData.artworkUrl">
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
  <div class="collapsedExplore exploreContainer" v-if="!exploreIsExpanded" v-on:click="toggleExplore()">
    <img class="tracksChevron" src="statics/icons/right-chevron.svg"/>
    <div class="">Traklist</div>
    <img class="tracksChevron" src="statics/icons/right-chevron.svg"/>
  </div>
</div>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import Play from './Play'

export default {
  name: "explore",
  props: {
    collapsed : {
      type: Boolean,
      default: null
    }
  },
  components: {
    Play
  },
  created() {
    if (this.tracksArray.length == 0) {
      this.$store.commit("GET_TRACKS");
    }
  },
  computed: {
    ...mapState(['tracksArray', 'exploreOpen', 'exploreExpanded']),
    exploreslideClosed() {
      return this.exploreOpen
    },
    exploreIsExpanded() {
      return this.exploreExpanded
    }
  },
  methods: {
      ...mapMutations(['UPDATE_CURRENT_TRACK']),
    playTrack(filename) {
        this.$store.commit('UPDATE_CURRENT_TRACK', this.$store.currentTrack = this.tracksArray.filter(track => track.filename == filename)[0])
    },
    getUserTracks(userId) {
      this.$store.commit('GET_TRACKS', userId)
    },
    toggleExplore() {
      this.$store.commit('TOGGLE_EXPLORE')
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
  height: 35px;
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
.collapsedExplore {
    height: 50px;
    border-bottom: 1px solid gray;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;

    img {
      transform: rotate(90deg);
      height: 20px;
    }
}
.exploreContainer {
  overflow-y: hidden;
	max-height: 10000px;
	transition-property: all;
	transition-duration: .5s;
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}
.exploreCollapsed {
  max-height: 0;
}
.showHideButton {
  height: 30px;
  width: 30%;
}
</style>
