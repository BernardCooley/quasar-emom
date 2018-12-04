<template>
  <div class="musicContainer">

    <div
      class="content"
      v-if="dataLoaded"
    >
      <div class="pageContainer">
        <div class="playerAndAllTracksContainer">
          <div class="playerContainer">
            <div
              id="audio"
              class="player-wrapper"
            >
              <audio-player
                :currenttracknumber='currentTrackIndexNumber+1'
                :totaltracks='tracks.length'
                :trackurl='currentTrack.downloadURL'
                :artist='currentTrack.metaData.artist'
                :title='currentTrack.metaData.title'
                :trackid='currentTrack.filename'
                :artworkurl='currentTrack.metaData.artworkUrl'
              ></audio-player>
            </div>
            <q-item class="trackControls">
              <q-btn
                class="trackControlButton"
                v-on:click="previousTrack"
              >
                <i class="fas fa-fast-backward"></i>
              </q-btn>
              <q-btn
                class="trackControlButton"
                v-on:click="nextTrack"
              >
                <i class="fas fa-fast-forward"></i>
              </q-btn>
            </q-item>
          </div>
        </div>
        <div class="allTracksContainer">
          <q-list>
            <h3 class="trackListTitle">All tracks</h3>
            <q-item
              class="row"
              v-for="(track, index) in tracks"
              :key="index"
            >
              <div
                class="allTracksArtistAndTitle col-11"
                v-on:click="changeTrack(track.filename)"
              >
                <div class="allTracksArtists">{{track.metaData.artist}}</div>
                <div class="allTracksTitles">{{track.metaData.title}}</div>
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
  data: function () {
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
    getUserTracks: function (metaData) {
      let store = this.$store
      let usersRef = db.collection("users").doc(firebase.auth().currentUser.uid)
      let self = this
      usersRef.get().then(function (doc) {
        let userTracks = doc.data().tracks
        let trackData = []

        store.commit("CLEAR_TRACKS_ARRAY", trackData)
        userTracks.forEach(trackFilename => {
          let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
          trackRef.getMetadata().then(function (metadata) {
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
              }).catch(function (error) {
                console.log(error)
              })
            })
            self.tracks = trackData
            self.dataLoaded = true;
          }).catch(function (error) {

          });
        })
      }).catch(function (error) {
        console.log("Error getting cached document:", error);
      });
    },
    previousTrack: function () {
      if (this.currentTrackIndexNumber > 0) {
        this.currentTrackIndexNumber--
      }
    },
    nextTrack: function () {
      if (this.currentTrackIndexNumber < (this.tracks.length - 1)) {
        this.currentTrackIndexNumber++
      }
    },
    changeTrack: function (filename) {
      this.tracks.forEach((track, index) => {
        if (track.filename === filename) {
          this.currentTrackIndexNumber = index
        }
      })
      this.$store.commit('UPDATE_CURRENT_TRACK', this.tracks[this.currentTrackIndexNumber])
    }
  },
  created() {
    this.getUserTracks()
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
  width: 100%;
  overflow: auto;

  .q-list {
    border: none;
  }

  .q-item {
    padding: 0;
  }
}

.allTracksArtistAndTitle {
  margin: auto;
  width: 100%;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid lightgray;
}

.allTracksArtists {
  font-size: 16px;
  width: 60%;
  margin-right: 20px;
}

.allTracksTitles {
  font-size: 12px;
  width: 40%;
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
</style>