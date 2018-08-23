<template>
  <div class="musicContainer">
    <div class="content" v-if="dataLoaded">
      <div class="pageContainer">

        <q-item class="searchContainer">
          <q-field class="inputField" label="Search" error-label="">
            <q-input type="text" v-model="search"/>
          </q-field>
        </q-item>

        <div v-for="track in filteredList" :data="track" :key="track.index">
          <div id="audio" class="player-wrapper">
            <audio-player :file='track.trackUrl' :artist='track.artist' :title='track.title' :artworkurl='track.artworkurl' :trackid="track.trackid"></audio-player>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AudioPlayer from "./AudioPlayer"
import db from "../firestore/firebaseInit"
import firebase from "firebase"

export default {
  name: "music",
  data: function() {
    return {
      tracks: [],
      dataLoaded: false,
      search: ""
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
              artworkurl: doc.data().artworkurl,
              trackid: doc.data().trackID
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
  },
  computed: {
    filteredList() {
      return this.tracks.filter(track => track.title.toLowerCase().includes(this.search.toLowerCase()) || track.artist.toLowerCase().includes(this.search.toLowerCase()))
    }
  }
};
</script>

<style>
.searchContainer {
  padding-bottom: 30px;
}

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
</style>