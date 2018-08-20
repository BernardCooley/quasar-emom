<template>
  <div class="musicContainer">

    <q-item class="row self-center">
      <q-btn><i class="fas fa-upload uploadIcon" v-on:click="openUploadPage"></i></q-btn>
    </q-item>

    <div class="content" v-if="dataLoaded">
      <div class="pageContainer">
        <q-list v-for="track in tracks" v-bind:data="track" v-bind:key="track.index">
          <q-card inline>
            <q-card-media>
              <img src="track.artworkUrl" alt="">
            </q-card-media>
            <q-card-title>
              {{track.artist}} - {{track.title}}
              <q-rating slot="subtitle" v-model="stars" :max="5" />
            </q-card-title>
            <q-card-main>
              <div id="audio" class="player-wrapper">
                <audio-player v-bind:file='track.trackUrl' v-bind:artist='track.artist' v-bind:title='track.title' v-bind:artworkUrl='track.artworkUrl'></audio-player>
              </div>
            </q-card-main>
          </q-card>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import AudioPlayer from "./AudioPlayer";
import db from "../firestore/firebaseInit";
import firebase from "firebase";

export default {
  name: "music",
  data: function() {
    return {
      tracks: [],
      dataLoaded: false
    };
  },
  components: {
    AudioPlayer
  },
  methods: {
    loadTracks: function() {
      this.tracks = [];
      db
        .collection("tracks")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            const data = {
              artist: doc.data().artist,
              title: doc.data().title,
              trackUrl: doc.data().trackUrl,
              artworkUrl: doc.data().artworkUrl
            };
            this.tracks.push(data);
          });
          if (this.tracks) {
            this.dataLoaded = true;
          }
        });
    },
    openUploadPage: function() {

    }
  },
  beforeCreate() { },
  created() {
    this.loadTracks();
  }
};
</script>

<style>
.track {
  margin: auto;
}

.trackContainer {
  margin: 5px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.1);
}

.content {
  background-color: white;
}

.card-header {
  background-color: #f4f4f4;
}

.loggedInUser {
  float: right;
  font-size: 15px;
  color: white;
}

.uploadIcon {
  font-size: 30px;
  color: rgb(78, 78, 78);
  background-color: lightgray;
  border-radius: 54px;
  width: 49px;
  padding: 10px;
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 2;
}
</style>