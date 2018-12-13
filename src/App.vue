<template>
  <div id="q-app">
    <div class="appContainer">
      <tabs></tabs>
    </div>
  </div>
</template>

<script>
import db from "./firestore/firebaseInit"
import Tabs from "./components/Tabs"
import firebase from "firebase/app"
import { mapMutations, Vuex } from "vuex"
import store from "./store"
import GetTracks from "./components/GetTracks"

export default {
  components: {
    Tabs,
    GetTracks
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN', 'UPDATE_LOGGED_IN_USER', 'UPDATE_TRACKS_ARRAY']),
    loadTracks(user) {
      this.$store.commit('CLEAR_TRACKS_ARRAY')
      if (user) {
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then(doc => {
          this.getTracks(doc.data().tracks)
        }).catch(error => {
          console.log('Error getting cached document: ', error);
        });
      } else {
        let trackNames = []
        db.collection('users').get().then(users => {
          users.docs.map(user => {
            trackNames = user.data().tracks ? [...user.data().tracks, ...trackNames] : trackNames
          })
          this.getTracks(trackNames)
        })
      }
    },
    getTracks(trackNames) {
      let trackData = []
      this.$store.commit('CLEAR_TRACKS_ARRAY')
      trackNames.forEach(trackFilename => {
        let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
        trackRef.getMetadata().then(metadata => {
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
              this.$store.commit('UPDATE_TRACKS_ARRAY', trackData)
            }).catch(error => {
              console.log(error)
            })
          })
          this.dataLoaded = true;
        }).catch(error => {

        });
      })
    }
  },
  created() {
    const initializeAuth = new Promise(resolve => {
      firebase.auth().onAuthStateChanged(user => {
        resolve(user)
      })
    })

    initializeAuth.then(user => {
      if (user) {
        console.log("Logged In")
        this.$store.commit("UPDATE_ISLOGGED_IN", true)
        this.$store.commit("UPDATE_LOGGED_IN_USER", firebase.auth().currentUser.email)
        this.$store.commit("UPDATE_LOGGED_IN_USER_ID", firebase.auth().currentUser.uid)
      } else {
        console.log('Not Logged In')
        this.$store.commit('UPDATE_ISLOGGED_IN', false)
      }
    })
  },
  mounted() {
    // GetTracks.methods.loadTracks()
    // this.loadTracks()
  }
}
</script>

<style>
.pageContainer {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: normal;
}

.backgroundImage {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: -1;
}

body {
  color: #333333 !important;
  /*background-image: linear-gradient(to bottom right, #267E84, #14938E);*/
}

.q-tab-pane {
  border: none;
  padding: 15px 0;
}

.q-card-container {
  padding-bottom: 0;
}

.q-field-label {
  color: #333333;
}

.q-field {
  width: 100%;
}
</style>
