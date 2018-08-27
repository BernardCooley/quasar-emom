<template>
  <div class="musicContainer">
    <div class="content" v-if="dataLoaded">
      <div class="pageContainer">

        <!-- <q-item class="searchContainer">
          <q-field class="inputField" label="Search" error-label="">
            <q-input type="text" v-model="search"/>
          </q-field>
        </q-item> -->
        <div class="playerAndAllTracksContainer">
          <div class="playerContainer">
            <div id="audio" class="player-wrapper">
              <audio-player :currenttracknumber='currentTrackIndexNumber+1' :totaltracks='tracks.length' :file='currentTrack.trackUrl' :artist='currentTrack.artist' :title='currentTrack.title' :artworkurl='currentTrack.artworkurl' :trackid="currentTrack.trackid"></audio-player>
            </div>
            <q-item class="trackControls">
              <q-btn class="trackControlButton" v-on:click="previousTrack">Prev</q-btn>
              <q-btn class="trackControlButton" v-on:click="nextTrack">Next</q-btn>
            </q-item>
          </div>
        </div>
        <div class="allTracksContainer">
          <q-list>
            <h2 class="allTracksTitle">All tracks</h2>
            <q-item v-for="(track, index) in tracks" :index="track">
              <div class="row" v-on:click="changeTrack(track.artist, track.title)">
                <div class="allTracksArtistAndTitle col-9">
                  <div class="allTracksArtists">{{track.artist}}</div>
                  <div class="allTracksTitles">{{track.title}}</div>
                </div>
                <img class="col-3 thumbNail" src="../assets/images/music_thumb.jpg">
              </div>
            </q-item>
          </q-list>
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
      search: "",
      currentTrackIndexNumber: 0
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
          var index = 0
          querySnapshot.forEach(doc => {
            const data = {
              artist: doc.data().artist,
              title: doc.data().title,
              trackUrl: doc.data().trackUrl,
              artworkurl: doc.data().artworkurl,
              trackid: doc.data().trackID,
              trackIndex: index
            };
            this.tracks.push(data)
            index++
          });
          if (this.tracks) {
            this.dataLoaded = true;
          }
        });
    },
    previousTrack: function() {
      if(this.currentTrackIndexNumber > 0) {
        this.currentTrackIndexNumber--
      }
    },
    nextTrack: function() {
      if(this.currentTrackIndexNumber < (this.tracks.length-1)) {
        this.currentTrackIndexNumber++
      }
    },
    changeTrack: function(artist, title) {
      this.currentTrackIndexNumber = this.tracks.filter(track => track.title.toLowerCase() == title.toLowerCase() && track.artist.toLowerCase() == artist.toLowerCase())[0].trackIndex
    },
  },
  created() {
    this.loadTracks();
  },
  computed: {
    filteredList() {
      return this.tracks.filter(track => track.title.toLowerCase().includes(this.search.toLowerCase()) || track.artist.toLowerCase().includes(this.search.toLowerCase()))
    },
    currentTrack() {
      return this.tracks[this.currentTrackIndexNumber]
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

.trackControls {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trackControlButton {
  width: 50%;
}

.playerAndAllTracksContainer {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playerContainer {
  width: 100%;
  height: 70%;
}

.allTracksContainer {
  width: 100%;
  height: 300px;
  overflow: auto;
}

.allTracksArtistAndTitle {
  background-color: rgb(244, 244, 244);
  padding: 8px;
}

.allTracksArtists {
  font-size: 30px;
}

.allTracksTitles {
  font-size: 20px;
}

.allTracksTitle {
  padding-left: 17px;
}

.thumbNail {
  height: 100% !important;
}
</style>