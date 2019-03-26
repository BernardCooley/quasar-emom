<template>
  <div>
    <div :class="[exploreIsExpanded ? 'playCollapsed' : 'playExpanded', 'playContainer']">
      <div>
        <div class="content" v-if="dataLoaded">
          <div class="pageContainer">
            <div class="playerAndAllTracksContainer">
              <div class="playerContainer">
                <div id="audio" class="player-wrapper">
                  <audio-player
                    :currenttracknumber="currentTrackIndex+1"
                    :totaltracks="tracksList.length"
                    :trackurl="currentTrack.downloadURL"
                    :artist="currentTrack.metaData.artist"
                    :title="currentTrack.metaData.title"
                    :trackid="currentTrack.filename"
                    :artworkurl="currentTrack.metaData.artworkUrl">
                  </audio-player>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="collapsedPlay playContainer" v-if="exploreIsExpanded">
      <div class="collapsedPlayItem trackDetails" v-on:click="toggleMusic()" >
        <img class="chevron" src="statics/icons/right-chevron.svg"/>
        <div class="collapdesPlayArtist">{{currentTrack.metaData.artist}}</div>
        <div class="collapdesPlayTitle">{{currentTrack.metaData.title}}</div>
      </div>
      <div class="collapsedPlayItem collapsedPlayPause">
        <img class="collapseAudioControl playPause" v-if="!isTrackPlaying" src="statics/icons/play.svg">
        <img class="collapseAudioControl playPause" v-else src="statics/icons/pause.svg">
      </div>
    </div>
  </div>
</template>

<script>
import AudioPlayer from './AudioPlayer'
import db from '../firestore/firebaseInit'
import firebase from 'firebase/app'
import { mapMutations, mapState } from 'vuex'
import Explore from './Explore'

export default {
  name: "play",
  components: {
    AudioPlayer,
    Explore
  },
  data() {
    return {
      dataLoaded: false,
      search: "",
      currentTrackIndex: 0
    };
  },
  created() {
    this.dataLoaded = this.tracksArray ? true : false;
    if(this.tracksArray.length == 0) {
      this.$store.commit('GET_TRACKS')
    }
  },
  computed: {
    ...mapState(['tracksArray', 'exploreOpen', 'exploreExpanded', 'isTrackPlaying']),
    exploreIsOpen() {
      return this.exploreOpen
    },
    tracksList() {
      return this.tracksArray;
    },
    filteredList() {
      return this.tracksArray.filter(
        track =>
          track.title.toLowerCase().includes(this.search.toLowerCase()) || track.artist.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    currentTrack() {
      this.currentTrackIndex = this.tracksArray.findIndex(track => track.currentTrack == true)

      this.$store.commit('UPDATE_CURR_TRACK', this.currentTrackIndex)
      return this.tracksArray.filter(track => track.currentTrack == true)[0]
    },
    exploreIsExpanded() {
      return this.exploreExpanded
    }
  },
  methods: {
    ...mapMutations(['UPDATE_TRACK_ACTIONS_MODAL', 'UPDATE_CURR_TRACK', 'GET_CURRENT_USER_ARTIST_NAME', 'GET_TRACKS','TOGGLE_EXPLORE']),
    openTrackActionsModal() {
      this.$store.commit('UPDATE_TRACK_ACTIONS_MODAL', true);
    },
    previousTrack() {
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      }
    },
    nextTrack() {
      if (this.currentTrackIndex < this.tracksArray.length - 1) {
        this.currentTrackIndex++;
      }
    },
    changeTrack(filename) {
      let currentTrack = this.tracksArray.filter(track => track.filename === filename)[0]
      this.currentTrackIndex = this.tracksArray.findIndex(track => track === currentTrack)
      this.$store.commit('UPDATE_CURR_TRACK', this.currentTrackIndex)
    },
    toggleMusic() {
      this.$store.commit('TOGGLE_EXPLORE')
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.track {
  margin: auto;
}
.playerAndAllTracksContainer {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid white;
  padding-bottom: 10px;
}
.playerContainer {
  width: 100%;
  height: 70%;
}
.highlight {
  background-color: #256f77;
}
.collapsedPlay {
  display: flex;
  justify-content: space-between;
  background-color: #11363a;
  align-items: center;
  height: 50px;
}
.trackDetails {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
}
.collapsedPlayPause {
  width: 50px;
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
 
.collapdesPlayArtist {
  font-size: 25px;
}
.collapdesPlayTitle {
  font-size: 18px;
}
.collapsedPlayItem {
  div {
    padding-left: 15px;
  }
}
.chevron {
  height: 20px;
  transform: rotate(270deg);
  margin-left: 5px;
}
.collapseAudioControl {
  height: 30px;
}
.playContainer {
  overflow-y: hidden;
	max-height: 10000px;
	transition-property: all;
	transition-duration: .5s;
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}
.playCollapsed {
  max-height: 0;
}
.playExpanded {
  margin-top: 50px;
}
</style>