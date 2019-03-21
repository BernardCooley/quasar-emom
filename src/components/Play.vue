<template>
  <div>
    <div :class="[!exploreIsExpanded ? 'playExpanded' : 'playCollapsed']">
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
    <div class="collapsedPlay" v-if="exploreIsExpanded">
      <div class="collapsedPlayItem trackDetails" v-on:click="toggleMusic()" >
        <img class="chevron" src="statics/icons/right-chevron.svg"/>
        <div class="collapdesPlayArtist">{{currentTrack.metaData.artist}}</div>
        <div class="collapdesPlayTitle">{{currentTrack.metaData.artist}}</div>
        <img class="chevron" src="statics/icons/right-chevron.svg"/>
      </div>
      <div class="collapsedPlayItem collapsedPlayPause">
        <img class="collapseAudioControl playPause" v-if="!playing" src="statics/icons/play.svg">
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
  data() {
    return {
      dataLoaded: false,
      search: "",
      currentTrackIndex: 0
    };
  },
  components: {
    AudioPlayer,
    Explore
  },
  methods: {
    ...mapMutations(['UPDATE_CURRENT_TRACK', 'UPDATE_TRACK_ACTIONS_MODAL', 'UPDATE_TRACKS_ARRAY', 'CLEAR_TRACKS_ARRAY', 'UPDATE_CURR_TRACK', 'GET_CURRENT_USER_ARTIST_NAME', 'GET_TRACKS','TOGGLE_EXPLORE']),
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
  },
  created() {
    this.dataLoaded = this.tracksArray ? true : false;
    this.$store.commit('GET_CURRENT_USER_ARTIST_NAME')
    if(this.tracksArray.length == 0) {
      this.$store.commit('GET_TRACKS')
    }
  },
  computed: {
    ...mapState(['tracksArray', 'exploreOpen', 'exploreExpanded']),
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
  }
};
</script>

<style lang="scss">
.searchContainer {
  padding-bottom: 30px;
}

.track {
  margin: auto;
}

.trackContainer {
  margin: 5px;
  padding: 5px;
}

.loggedInUser {
  float: right;
  font-size: 15px;
  color: white;
}

.trackControls {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trackControlButton {
  width: 50%;
  font-size: 20px;
  fill: white !important;
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

.allTracksContainer {
  margin: 10px;
  .q-list {
    border: none;
  }

  .q-item {
    padding: 0;
  }
}

.allTracksArtistAndTitle {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  border-bottom: 1px solid lightgray;
  color: white;
}

.trackArtist {
  font-size: 18px;
}

.trackTitle {
  font-size: 15px;
}

.trackListTitle {
  padding-left: 15px;
  margin: 0;
}

.thumbNail {
  height: 100% !important;
}

.trackInfoPopover {
  position: fixed;
  top: 100px;
}

.musicContainer .content {
  height: 100%;
}

.trackInfoIcon {
  height: 15px;
  transform: (rotate(90deg));
}

.highlight {
  background-color: #256f77;
}

.collapsedPlay {
  display: flex;
  justify-content: space-between;
  background-color: #11363a;
  align-items: center;
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
}
.collapseAudioControl {
  height: 35px;
}
.playCollapsed {
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 1s ease;
  height: 100%;
  width: 100%;
  position: absolute;
  bottom: 72px;
}
.playExpanded {
  transform: scaleY(1);
  transform-origin: bottom;
  transition: transform 1s ease;
  height: 100%;
}
</style>