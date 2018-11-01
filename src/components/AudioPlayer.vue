<template>
  <div class="audioPlayerContainer">
    <track-actions-modal />
    <q-card inline class="audioCard no-shadow">
      <q-card-title class="titleAndArtist row">
        <div class="col-2">{{currenttracknumber}}/{{totaltracks}}</div>
        <div class="col-8">
          <div class="artist">{{artist}}</div>
          <div class="title">{{title}}</div>
        </div>
        <i class="fas fa-ellipsis-v trackInfoIcon col-2" v-on:click="openTrackActionsModal"></i>
      </q-card-title>
      <q-card-main v-if="true">
        <div>
          <div v-on:click="seek" class="player-progress" title="Time played : Total time">
            <div :style="{ width: this.percentComplete + '%' }" class="player-seeker"></div>
          </div>
          <div class="player-time">
            <div class="player-time-current">{{ currentTime }}</div>
            <div class="player-time-total">{{ durationTime }}</div>
          </div>
          <div class="artworkContainer">
            <img v-bind:src="artworkurl">
          </div>
        </div>
        <audio v-bind:loop="innerLoop" ref="player" preload="auto" style="display: none;">
          <source v-bind:src="trackurl">
        </audio>
      </q-card-main>
      <q-chip class="unsupportedFormatMessage" v-else>Unsupported format</q-chip>
      <q-card-actions>
        <div class="row audioActions justify-between">
          <a class="audioControl" v-on:click.prevent="playing = !playing" title="Play/Pause">
            <i v-if="!playing" class="fas fa-play audioControl"></i>
            <i v-else class="fas fa-pause"></i>
          </a>
          <a class="audioControl" v-on:click.prevent="stop" title="Stop">
            <i class="fas fa-stop audioControl"></i>
          </a>
          <a class="audioControl" v-on:click.prevent="innerLoop = !innerLoop">
            <i v-if="innerLoop" class="fas fa-redo-alt audioControl"></i>
            <i v-else class="fas fa-redo-alt audioControl"></i>
          </a>
          <a class="audioControl" v-on:click="favourite">
            <i class="fas fa-heart"></i>
          </a>
          <a class="audioControl" v-on:click="getTrackUrl">
            <i class="fas fa-heart"></i>
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

const convertTimeHHMMSS = val => {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8);

  return hhmmss.indexOf("00:") === 0 ? hhmmss.substr(3) : hhmmss;
};

export default {
  components: {
    TrackActionsModal
  },
  name: "audio-player",
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
    uploadedby: {
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
      playing: false,
      previousVolume: 35,
      showVolume: false,
      volume: 100,
      uploadedByName: null
    };
  },
  computed: {
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
    ...mapState(["loggedInUser", "currentTrack", "loggedInUserId"]),
    isFileATrack: function () {
      return this.trackurl.endsWith(".mp3") || this.track.endsWith(".wav") || this.track.endsWith(".aif") ? true : false;
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
    ...mapMutations(['UPDATE_TRACK_DETAILS_POPOVER', 'UPDATE_TRACK_ACTIONS_MODAL', 'UPDATE_LIKES']),
    showTrackDetails() {
      this.$store.commit("UPDATE_TRACK_DETAILS_POPOVER", true)
    },
    download() {
      this.stop();
      window.open(this.trackurl, "download");
    },
    load() {
      if (this.audio.readyState >= 2) {
        this.loaded = true;
        this.durationSeconds = parseInt(this.audio.duration);
        return (this.playing = this.autoPlay);
      }

      throw new Error("Failed to load sound file.");
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
      this.audio.currentTime = 0;
    },
    update(e) {
      this.currentSeconds = parseInt(this.audio.currentTime);
    },
    favourite: function () {
      let favourites = [];

      db.collection('users').where("userID", "==", this.loggedInUserId).get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            if (doc.data().favourites) {
              favourites = doc.data().favourites
            }
            if (!favourites.includes(this.currentTrack.trackID)) {
              favourites.push(this.currentTrack.trackID)
              db.collection('users').doc(this.loggedInUserId).update({
                favourites
              })

              let likes = 0;
              db.collection('tracks').where("trackID", "==", this.currentTrack.trackID).get()
                .then(querySnapshot => {
                  querySnapshot.forEach(doc => {

                    if (doc.data().likes) {
                      likes = doc.data().likes
                    }
                    likes++
                    db.collection('tracks').doc(this.currentTrack.trackID).update({
                      likes
                    }).then(this.$store.commit('UPDATE_LIKES', likes))
                  })
                })
            }
          })
        })
    },
    openTrackActionsModal: function () {
      this.$store.commit("UPDATE_TRACK_ACTIONS_MODAL", true)
    }
  },
  created() {
    this.innerLoop = this.loop;
  },
  mounted() {
    db.collection("users").where("userID", "==", this.uploadedby).get().then(snapshot => {
      snapshot.forEach(doc => {
        this.uploadedByName = doc.data().artistName
      })
    })

    this.audio = this.$el.querySelectorAll("audio")[0];
    this.audio.addEventListener("timeupdate", this.update);
    this.audio.addEventListener("loadeddata", this.load);
    this.audio.addEventListener("pause", () => {
      this.playing = false;
    });
    this.audio.addEventListener("play", () => {
      this.playing = true;
    });
    this.$watch("trackurl", () => {
      this.$refs.player.load()
    });
  }
};
</script>

<style lang="scss">
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

.artworkContainer {
  width: 200px;
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
  background-color: $player-progress-color;
  cursor: pointer;
  height: 20px;
  min-width: 200px;
  position: relative;

  .player-seeker {
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    background-color: #333333;
  }
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
}

.audioControl {
  font-size: 25px;
  color: #333333;
  // width: 70%;
  text-align: center;
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
}

.titleAndArtist {
  .artist {
    font-size: 22px;
    font-weight: bold;
  }

  .trackInfoIcon {
    font-size: 25px;
  }
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
</style>