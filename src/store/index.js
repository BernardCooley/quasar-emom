import Vue from "vue"
import Vuex from "vuex"
import firebase from "firebase/app"
import db from "../firestore/firebaseInit"
import { Loading } from 'quasar'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

const store = new Vuex.Store({
  state: {
    isLoggedIn: false,
    loggedInUserId: null,
    trackActionsModalOpen: false,
    currentTrack: null,
    fileUploadPercentage: null,
    tracksArray: [],
    userTracksArray: [],
    currentUserArtistName: null,
    exploreOpen: false,
    exploreExpanded: true,
    isTrackPlaying: false
  },
  mutations: {
    TOGGLE_TRACK_PLAYING(state, value) {
      state.isTrackPlaying = value
    },
    TOGGLE_EXPLORE(state) {
      state.exploreExpanded = !state.exploreExpanded
    },
    UPDATE_ISLOGGED_IN(state, value) {
      state.isLoggedIn = value
    },
    UPDATE_LOGGED_IN_USER_ID(state, value) {
      state.loggedInUserId = value
    },
    UPDATE_TRACK_ACTIONS_MODAL(state, value) {
      state.trackActionsModalOpen = value
    },
    UPDATE_CURRENT_TRACK(state, value) {
      state.currentTrack = value
    },
    UPDATE_CURR_TRACK(state, value) {
      state.tracksArray.map((track, index) => {
        if (index === value) {
          track.currentTrack = true
          state.currentTrack = track
        } else {
          track.currentTrack = false
        }
      })
    },
    UPDATE_FILE_UPLOAD_PERCENTAGE(state, value) {
      state.fileUploadPercentage = value
    },
    UPDATE_TRACKS_ARRAY(state, value) {
      state.tracksArray = value
    },
    CLEAR_TRACKS_ARRAY(state) {
      state.tracksArray = []
    },
    UPDATE_USER_TRACKS_ARRAY(state, value) {
      state.userTracksArray = value
    },
    GET_TRACKS(state, value) {
      Loading.show({
        message: 'Loading tracks'
      })

      state.tracksArray = []
      let trackNames = []
      
      if(value != undefined) {
        db.collection('tracks').where('uploadedBy', '==', value).get().then(tracks => {
          tracks.docs.map(track => {
            trackNames.push(track.id)
          })
          retrieveTracks(trackNames)
        })
      }else {
        db.collection('tracks').get().then(tracks => {
          tracks.docs.map(track => {
            trackNames.push(track.id)
          })
          retrieveTracks(trackNames)
        })
      }

      let retrieveTracks = trackNames => {
        trackNames.forEach((trackFilename, index) => {
          let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
          trackRef.getMetadata().then(metadata => {
            let artworkRef = firebase.storage().ref().child('artwork/' + metadata.customMetadata.artworkName)

            artworkRef.getDownloadURL().then(artworkUrl => {
              trackRef.getDownloadURL().then(trackURL => {
                this.state.tracksArray.push({
                  metaData: {
                    artist: metadata.customMetadata.artist,
                    title: metadata.customMetadata.title,
                    artworkUrl: artworkUrl,
                    uploadedByArtist: metadata.customMetadata.uploadedByName,
                    uploadedById: metadata.customMetadata.uploadedById,
                    favourites: metadata.customMetadata.favourites
                  },
                  downloadURL: trackURL,
                  filename: trackFilename,
                  currentTrack: index == 0 ? true : false
                })
              }).catch(error => {console.log(error)})
            })
            setTimeout(function() {
              Loading.hide()
            }, 1500)
          }).catch(error => {console.log(error)})
        })
      }
    },
    FAVOURITE_TRACK() {
      let trackRef = firebase.storage().ref().child('tracks/' + this.state.currentTrack.filename)

      trackRef.getMetadata().then(metadata => {
        let currentUserId = firebase.auth().currentUser.uid
        let existingFavourites = metadata.customMetadata.favourites

        existingFavourites = existingFavourites.includes(currentUserId) ? existingFavourites.replace(currentUserId, "") : `${existingFavourites},${currentUserId}`
        existingFavourites = existingFavourites.slice(0, 1) == ',' ? existingFavourites.slice(1) : existingFavourites
        existingFavourites = existingFavourites.slice(-1) == ',' ? existingFavourites.slice(0, -1) : existingFavourites

        let newMetadata = {
          customMetadata: {
            favourites: existingFavourites
          }
        }

        trackRef.updateMetadata(newMetadata).then(metadata => {
          this.state.currentTrack['favourite'] = metadata.customMetadata.favourites.includes(currentUserId) ? true : false
        }).catch(error => {
          console.log(error)
        });
      }).catch(error => {
        console.log(error)
      });
    },
    GET_CURRENT_USER_ARTIST_NAME() {
      db.collection('users').doc(firebase.auth().currentUser.uid).get().then(user => {
        this.state.currentUserArtistName = user.data().artistName
      })
    }
  }
})

export default store
