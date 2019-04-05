<template>
  <div class="audioPlayerContainer">
    <track-actions-modal></track-actions-modal>
    <q-card inline class="audioCard no-shadow">
      <div class="artworkContainer q-card-title" :style="{ backgroundImage: 'url(' + artworkURL + ')'}">
        <q-item class="nextPrevBtns">
          <img :class="[currenttracknumber == 1 ? 'hideIcon' : 'showIcon', 'audioControl', 'nextBtn']" src="statics/icons/next.svg" v-on:click="prevTrack()">
          <img :class="[currenttracknumber == totaltracks ? 'hideIcon' : 'showIcon', 'audioControl', 'prevBtn']" src="statics/icons/next.svg" v-on:click="nextTrack()">
        </q-item>
      </div>
      <div class="trackInfo">
        <div class="trackNumber">{{currenttracknumber}}/{{totaltracks}}</div>
        <div class="trackArtistAndTitle">
          <div class="artist">{{artist}}</div>
          <div class="title">{{title}}</div>
        </div>
        <a class="trackOptions" v-on:click.prevent="openTrackActionsModal()">
          <img class="trackInfoIcon" src="statics/icons/menu-white.svg">
        </a>
      </div>
      <q-card-main v-if="supportedFormat">
        <div class="trackProgress">
          <div v-on:click="seek" class="player-progress" title="Time played : Total time">
            <div :style="{ width: this.percentComplete + '%' }" class="player-seeker"></div>
          </div>
          <div class="player-time">
            <div class="player-time-current">{{ currentTime }}</div>
            <div class="player-time-total">{{ durationTime }}</div>
          </div>
        </div>
        <audio :loop="innerLoop" ref="player" preload="auto" style="display: none;">
          <source :src="trackurl">
        </audio>
      </q-card-main>
      <q-chip class="unsupportedFormatMessage" v-else>Unsupported format</q-chip>
      <q-card-actions>
        <div class="audioActions">
          <a v-on:click.prevent="stop()" title="Stop">
            <img class="audioControl" :src="playing ? 'statics/icons/stop-active.svg' : 'statics/icons/stop-inactive.svg'">
          </a>
          <a v-on:click.prevent="innerLoop = !innerLoop">
            <img class="audioControl" :src="innerLoop ? 'statics/icons/repeat-active.svg' : 'statics/icons/repeat-inactive.svg'">
          </a>
          <a v-on:click.prevent="playPause()" title="Play/Pause">
          <img class="audioControl playPause" :src="playing ? 'statics/icons/pause.svg' : 'statics/icons/play.svg'">
          </a>
          <a v-on:click.prevent="favourite()" title="Favourite">
            <img class="audioControl" :src="favourited ? 'statics/icons/favorited.svg' : 'statics/icons/favorite.svg'">
          </a>
          <a v-on:click.prevent="download()">
            <img class="audioControl" src="statics/icons/download.svg">
          </a>
        </div>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import db from "../firestore/firebaseInit";
import firebase from "firebase/app";
import TrackActionsModal from "./TrackActionsModal"
import Play from "./Play"

const convertTimeHHMMSS = val => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8);

  return hhmmss.indexOf("00:") === 0 ? hhmmss.substr(3) : hhmmss;
};

export default {
  name: "audio-player",
  components: {
    TrackActionsModal,
    Play
  },
  props: {
    trackurl: {
      type: String,
      default: null
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    artist: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    artworkurl: {
      type: String,
      default: null
    },
    trackid: {
      type: String,
      default: null
    },
    currenttracknumber: null,
    totaltracks: null,
    uploadedByArtist: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      audio: undefined,
      currentSeconds: 0,
      durationSeconds: 0,
      innerLoop: false,
      loaded: false,
      previousVolume: 35,
      showVolume: false,
      volume: 100,
      supportedFormat: true,
      playing: false
    };
  },
  created() {
    this.innerLoop = this.loop;
  },
  mounted() {
    this.audio = this.$el.querySelectorAll('audio')[0];
    this.audio.addEventListener('timeupdate', this.update);
    this.audio.addEventListener('loadeddata', this.load);
    this.audio.addEventListener('pause', () => {
      this.playing = false;
      this.$store.commit('TOGGLE_TRACK_PLAYING', false)
    });
    this.audio.addEventListener('play', () => {
      this.playing = true;
      this.$store.commit('TOGGLE_TRACK_PLAYING', true)
    });
    this.$watch('trackurl', () => {
      this.$refs.player.load()
    });
  },
  computed: {
    ...mapState(['currentTrack', 'tracksArray', 'isTrackPlaying']),
    currentTime() {
      return convertTimeHHMMSS(this.currentSeconds);
    },
    durationTime() {
      return convertTimeHHMMSS(this.durationSeconds);
    },
    percentComplete() {
      return parseInt(this.currentSeconds / this.durationSeconds * 100);
    },
    muted() {
      return this.volume / 100 === 0;
    },
    isFileATrack() {
      return this.trackurl.endsWith('.mp3') || this.track.endsWith('.wav') || this.track.endsWith('.aif') ? true : false;
    },
    artworkURL() {
      return this.artworkurl
    },
    favourited() {
      return this.currentTrack.favourite
    },
    trackPlaying() {
      return this.isTrackPlaying
    }
  },
  watch: {
    playing(value) {
      if (value) {
        return this.audio.play();
      }
      this.audio.pause();
    },
    volume(value) {
      this.showVolume = false;
      this.audio.volume = this.volume / 100;
    }
  },
  methods: {
    ...mapMutations(['UPDATE_TRACK_DETAILS_POPOVER', 'UPDATE_TRACK_ACTIONS_MODAL', 'FAVOURITE_TRACK', 'TOGGLE_TRACK_PLAYING', 'GET_TRACK_COMMENTS']),
    prevTrack() {
      this.$store.commit('GET_TRACK_COMMENTS')
      let currentTrackIndex = this.tracksArray.findIndex(track => track === this.currentTrack)

      if (currentTrackIndex > 0) {
        this.$store.commit('UPDATE_CURR_TRACK', currentTrackIndex - 1)
      }
    },
    nextTrack() {
      this.$store.commit('GET_TRACK_COMMENTS')
      let currentTrackIndex = this.tracksArray.findIndex(track => track === this.currentTrack)

      if (currentTrackIndex < this.tracksArray.length) {
        this.$store.commit('UPDATE_CURR_TRACK', currentTrackIndex + 1)
      }
    },
    showTrackDetails() {
      this.$store.commit('UPDATE_TRACK_DETAILS_POPOVER', true)
    },
    download() {
      this.stop();
      window.open(this.trackurl, 'download');
    },
    load() {
      if (this.audio.readyState >= 2) {
        this.loaded = true;
        this.durationSeconds = parseInt(this.audio.duration);
        return (this.playing = this.autoPlay);
      }

      throw new Error('Failed to load sound file.');
    },
    mute() {
      if (this.muted) {
        return (this.volume = this.previousVolume);
      }

      this.previousVolume = this.volume;
      this.volume = 0;
    },
    seek(e) {
      if (!this.playing || e.target.tagName === "SPAN") {
        return;
      }

      const el = e.target.getBoundingClientRect();
      const seekPos = (e.clientX - el.left) / el.width;

      this.audio.currentTime = parseInt(this.audio.duration * seekPos);
    },
    stop() {
      this.playing = false;
      this.$store.commit('TOGGLE_TRACK_PLAYING', false)
      this.audio.currentTime = 0;
    },
    update(e) {
      this.currentSeconds = parseInt(this.audio.currentTime);
    },
    favourite() {
      this.$store.commit('FAVOURITE_TRACK')
    },
    openTrackActionsModal() {
      this.$store.commit('UPDATE_TRACK_ACTIONS_MODAL', true)
    },
    playPause() {
      if(this.isTrackPlaying) {
        this.$store.commit('TOGGLE_TRACK_PLAYING', false)
        return this.audio.pause()
      }else {
        this.$store.commit('TOGGLE_TRACK_PLAYING', true)
        return this.audio.play()
      }
    }
  }
};
</script>

<style lang="scss">
@import "../css/commonStyles.scss";
@import url("https://fonts.googleapis.com/css?family=Nunito:400,700");

body {
  font-family: "Nunito", sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

$player-background: #f4f4f4;
$player-border-color: darken($player-background, 12%);
$player-link-color: darken($player-background, 75%);
$player-progress-color: $player-border-color;
$player-seeker-color: $player-link-color;
$player-text-color: $player-link-color;

.player-wrapper {
  display: flex;
  justify-content: center;
}
input[type="range"].slider {
  -webkit-appearance: none;
  width: 100%;
  margin: 0.9px 0;
}
input[type="range"].slider:focus {
  outline: none;
}
input[type="range"].slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 9.2px;
  cursor: pointer;
  box-shadow: 0px 0px 0.6px rgba(0, 0, 0, 0.41),
    0px 0px 0px rgba(13, 13, 13, 0.41);
  background: rgba(0, 0, 0, 0);
  border-radius: 0px;
  border: 0px solid rgba(0, 0, 0, 0);
}
input[type="range"].slider::-webkit-slider-thumb {
  border: 0px solid #ffffff;
  height: 11px;
  width: 24px;
  border-radius: 34px;
  background: rgba(0, 0, 0, 0.97);
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.9px;
}
input[type="range"].slider:focus::-webkit-slider-runnable-track {
  background: rgba(13, 13, 13, 0);
}
input[type="range"].slider::-moz-range-track {
  width: 100%;
  height: 9.2px;
  cursor: pointer;
  box-shadow: 0px 0px 0.6px rgba(0, 0, 0, 0.41),
    0px 0px 0px rgba(13, 13, 13, 0.41);
  background: rgba(0, 0, 0, 0);
  border-radius: 0px;
  border: 0px solid rgba(0, 0, 0, 0);
}
input[type="range"].slider::-moz-range-thumb {
  box-shadow: 15px 15px 15px #ffffff, 0px 0px 15px #ffffff;
  border: 0px solid #ffffff;
  height: 11px;
  width: 24px;
  border-radius: 34px;
  background: rgba(0, 0, 0, 0.97);
  cursor: pointer;
}
input[type="range"].slider::-ms-track {
  width: 100%;
  height: 9.2px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type="range"].slider::-ms-fill-lower {
  background: rgba(0, 0, 0, 0);
  border: 0px solid rgba(0, 0, 0, 0);
  border-radius: 0px;
  box-shadow: 0px 0px 0.6px rgba(0, 0, 0, 0.41),
    0px 0px 0px rgba(13, 13, 13, 0.41);
}
input[type="range"].slider::-ms-fill-upper {
  background: rgba(0, 0, 0, 0);
  border: 0px solid rgba(0, 0, 0, 0);
  border-radius: 0px;
  box-shadow: 0px 0px 0.6px rgba(0, 0, 0, 0.41),
    0px 0px 0px rgba(13, 13, 13, 0.41);
}
input[type="range"].slider::-ms-thumb {
  box-shadow: 15px 15px 15px #ffffff, 0px 0px 15px #ffffff;
  border: 0px solid #ffffff;
  height: 11px;
  width: 24px;
  border-radius: 34px;
  background: rgba(0, 0, 0, 0.97);
  cursor: pointer;
  height: 9.2px;
}
input[type="range"].slider:focus::-ms-fill-lower {
  background: rgba(0, 0, 0, 0);
}
input[type="range"].slider:focus::-ms-fill-upper {
  background: rgba(13, 13, 13, 0);
}
.player {
  border: 1px solid $player-border-color;
  border-radius: 5px;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.15);
  color: $player-text-color;
  display: inline-block;
  line-height: 1.5625;
  padding: 20px;
}
.player-controls {
  display: flex;

  > div {
    border-right: 1px solid $player-border-color;

    &:last-child {
      border-right: none;
    }

    a {
      color: $player-link-color;
      display: block;
      line-height: 0;
      padding: 1em;
      text-decoration: none;
    }
  }
}
.player-progress {
  background-color: white;
  cursor: pointer;
  height: 13px;
  min-width: 200px;
  position: relative;
  opacity: 0.3;

  .player-seeker {
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    background-color: dimgray;
  }
}
.q-card-container {
  padding: 0 10px;
}
.player-time {
  display: flex; // font-size: 18px;
  justify-content: space-between;

  .player-time-current {
    font-weight: 700;
    padding-left: 5px;
  }

  .player-time-total {
    opacity: 0.5;
    padding-right: 5px;
  }
}
.audioActions {
  width: 100%;
  margin: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.audioControl {
  height: 30px;
  opacity: 0.8;
}
.nextBtn {
  transform: rotate(180deg);
}
.nextPrevBtns {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .prevBtn,
  .nextBtn {
    height: 35px;
    background-color: white;
    border-radius: 30px;
  }
}
.trackProgress {
  margin-top: 20px;
}
.playPause {
  height: 60px;
}
.audioPlayerContainer {
  width: 100%;
}
.audioCard {
  width: 100%;
}
.saveButton {
  background-color: rgb(2, 123, 227);
  color: white;
  font-weight: bold;
}
.q-card-title {
  text-align: center;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.artworkContainer {
  background-size: 400px;
  height: 400px;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  .artist {
    font-size: 22px;
    font-weight: bold;
  }
}
.q-card-actions {
  padding: 0 8px;
}
.q-card-main {
  font-size: 18px;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  height: 50px;
}
.unsupportedFormatMessage {
  display: flex !important;
  text-align: center;
  font-size: 20px;
  margin: 10px;
}
.trackDetailsPopoverContainer {
  width: 80%;
}
.artworkImage {
  display: block;
  width: 100%;
  height: auto;
}
.trackInfo {
  color: white;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.trackArtistAndTitle,
.trackNumber,
.trackOptions {
  padding: 9px;
  border-radius: 5px;
  flex-direction: column;
  display: flex;
  text-align: center;
}
.trackArtistAndTitle {
  flex-grow: 10;

  .artist {
    font-size: 22px;
    font-weight: bold;
  }
}
.trackNumber,
.trackOptions {
  flex-grow: 1;
}
.hideIcon {
  opacity: 0;
}
.showIcon {
  opacity: 1;
}
</style>