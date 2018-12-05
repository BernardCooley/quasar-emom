<template>
  <div class="musicContainer">

    <div class="content" v-if="dataLoaded">
      <div class="pageContainer">
        <div class="playerAndAllTracksContainer">
          <div class="playerContainer">
            <div id="audio" class="player-wrapper">
              <audio-player :currenttracknumber='currentTrackIndexNumber+1' :totaltracks='tracks.length' :trackurl='currentTrack.downloadURL' :artist='currentTrack.metaData.artist' :title='currentTrack.metaData.title' :trackid='currentTrack.filename' :artworkurl='currentTrack.metaData.artworkUrl'></audio-player>
            </div>
            <q-item class="trackControls">
              <q-btn class="trackControlButton" v-on:click="previousTrack">
                <img class="audioControl" src="assets/icons/previous.svg">
              </q-btn>
              <q-btn class="trackControlButton" v-on:click="nextTrack">
                <img class="audioControl" src="assets/icons/skip.svg">
              </q-btn>
            </q-item>
          </div>
        </div>
        <div class="allTracksContainer">
          <q-list>
            <q-item class="" v-for="(track, index) in tracks" :key="index">
              <div class="allTracksArtistAndTitle">
              <div class="" v-on:click="changeTrack(track.filename)">
                <div class="trackArtist">{{track.metaData.artist}}</div>
                <div class="trackTitle">{{track.metaData.title}}</div>
              </div>
              <a v-on:click.prevent="openTrackActionsModal">
                <img class="trackInfoIcon" src="assets/icons/menu-white.svg">
              </a>
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
import firebase from "firebase/app"
import { mapMutations, mapState } from "vuex"


export default {
  name: "music",
  data: function() {
    return {
      tracks: [],
      dataLoaded: false,
      search: "",
      currentTrackIndexNumber: 0,
      uploadedByName: null
    }
  },
  components: {
    AudioPlayer
  },
  methods: {
    ...mapMutations(['UPDATE_CURRENT_TRACK', 'UPDATE_TRACK_LIST', 'UPDATE_TRACKS_ARRAY', 'CLEAR_TRACKS_ARRAY']),
    openTrackActionsModal() {
      console.log('openTrackActionsModal CLICKED')
      this.$store.commit("UPDATE_TRACK_ACTIONS_MODAL", true)
    },
    loadTracks: function(user) {
      if (user) {
        let usersRef = db.collection("users").doc(firebase.auth().currentUser.uid)
        usersRef.get().then(function(doc) {
          this.getTracks(doc.data().tracks)
        }).catch(function(error) {
          console.log("Error getting cached document:", error);
        });
      } else {
        let trackNames = []
        db.collection("users").get().then(users => {
          users.docs.map(user => {
            let tracks = user.data().tracks
            if (tracks.length > 0) {
              trackNames = [...tracks, ...trackNames]
            }
          })
          this.getTracks(trackNames)
        })
      }
    },
    getTracks: function(trackNames) {
      let store = this.$store
      let self = this
      let trackData = []
      store.commit("CLEAR_TRACKS_ARRAY", trackData)
      trackNames.forEach(trackFilename => {
        let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
        trackRef.getMetadata().then(function(metadata) {
          let artworkRef = firebase.storage().ref().child('artwork/' + metadata.customMetadata.artworkName)

          artworkRef.getDownloadURL().then(artworkUrl => {
            trackRef.getDownloadURL().then(trackURL => {
              trackData.push({
                metaData: {
                  artist: metadata.customMetadata.artist,
                  title: metadata.customMetadata.title,
                  artworkUrl: artworkUrl
                },
                downloadURL: trackURL,
                filename: trackFilename
              })
              store.commit("UPDATE_TRACKS_ARRAY", trackData)
            }).catch(function(error) {
              console.log(error)
            })
          })
          self.tracks = trackData
          self.dataLoaded = true;
        }).catch(function(error) {

        });
      })
    },
    previousTrack: function() {
      if (this.currentTrackIndexNumber > 0) {
        this.currentTrackIndexNumber--
      }
    },
    nextTrack: function() {
      if (this.currentTrackIndexNumber < (this.tracks.length - 1)) {
        this.currentTrackIndexNumber++
      }
    },
    changeTrack: function(filename) {
      this.tracks.forEach((track, index) => {
        if (track.filename === filename) {
          this.currentTrackIndexNumber = index
        }
      })
      this.$store.commit('UPDATE_CURRENT_TRACK', this.tracks[this.currentTrackIndexNumber])
    }
  },
  created() {
    this.loadTracks()
  },
  computed: {
    filteredList() {
      return this.tracks.filter(track => track.title.toLowerCase().includes(this.search.toLowerCase()) || track.artist.toLowerCase().includes(this.search.toLowerCase()))
    },
    currentTrack() {
      return this.tracks[this.currentTrackIndexNumber]
    },
    ...mapState(['trackList'])
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
  background-color: rgba(140, 140, 140, 0.856);
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

.trackMenuIcon {
  text-align: center;
  background-color: red;
}

.musicContainer .content {
  height: 100%;
}

.trackInfoIcon {
    height: 15px;
    transform: (rotate(90deg));
  }
</style>