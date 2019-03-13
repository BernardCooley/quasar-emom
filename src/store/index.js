import Vue from "vue"
import Vuex from "vuex"
import firebase from "firebase/app"
import db from "../firestore/firebaseInit"

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

const store = new Vuex.Store({
  state: {
    isLoggedIn: false,
    loggedInUser: null,
    loggedInUserId: null,
    menuDisplayed: false,
    pageTitle: null,
    currentTab: null,
    addTrack: false,
    trackActionsModalOpen: false,
    currentTrack: null,
    trackList: null,
    likes: null,
    fileUploadPercentage: null,
    tracksArray: [],
    userTracksArray: [],
    allUsers: [],
    currentUserArtistName: null
  },
  mutations: {
    UPDATE_ISLOGGED_IN(state, value) {
      state.isLoggedIn = value
    },
    UPDATE_LOGGED_IN_USER(state, value) {
      state.loggedInUser = value
    },
    UPDATE_LOGGED_IN_USER_ID(state, value) {
      state.loggedInUserId = value
    },
    TOGGLE_MENU(state, value) {
      state.menuDisplayed = value
    },
    UPDATE_PAGE_TITLE(state, value) {
      state.pageTitle = value
    },
    UPDATE_CURRENT_TAB(state, value) {
      state.currentTab = value
    },
    UPDATE_ADD_TRACK(state, value) {
      state.addTrack = value
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
    UPDATE_TRACK_LIST(state, value) {
      state.trackList = value
    },
    UPDATE_LIKES(state, value) {
      state.likes = value
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
      state.tracksArray = []
      let trackNames = []

      let promise = new Promise(function(resolve, reject) {
        if(value == 'artist') {
          db.collection('users').where('artistName', '==', state.currentTrack.metaData.uploadedByArtist).get().then(user => {
            user.docs.map(userData => {
              resolve(userData.data().tracks)
            })
          })
        }else if(value == 'currentUser') {
          db.collection('users').where('uaerID', '==', firebase.auth().currentUser.uid).get().then(user => {
            user.docs.map(userData => {
              resolve(userData.data().tracks)
            })
          })
        }else if(value == 'all') {
          db.collection('users').get().then(users => {
            users.docs.map(user => {
              trackNames = user.data().tracks ? [...user.data().tracks, ...trackNames] : trackNames
            })
            resolve(trackNames)
          })
        }
      })

      promise.then(result => {
        console.log(result)
        result.forEach((trackFilename, index) => {
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
                    uploadedByArtist: metadata.customMetadata.uploadedByName
                  },
                  downloadURL: trackURL,
                  filename: trackFilename,
                  currentTrack: index == 0 ? true : false
                })
              }).catch(error => {
                console.log(error)
              })
            })
          }).catch(error => { })
        })
      })
    },
    GET_CURRENT_USER_ARTIST_NAME() {
      db.collection('users').doc(firebase.auth().currentUser.uid).get().then(user => {
        this.state.currentUserArtistName = user.data().artistName
      })
    },
    GET_ALL_USERS(state) {
      state.allUsers = []
      db.collection('users').get().then(users => {
        users.docs.map(user => {
          this.state.allUsers.push(user.id)
        })
      })
    }
  }
})

export default store
