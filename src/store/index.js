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
    loggedInUserName: null,
    trackActionsModalOpen: false,
    filterModalOpen: false,
    currentTrack: null,
    fileUploadPercentage: null,
    tracksArray: [],
    filteredTracksArray: [],
    userTracksArray: [],
    currentUserArtistName: null,
    exploreOpen: false,
    exploreExpanded: true,
    isTrackPlaying: false,
    bandImageUrl: '',
    userTracksArray: null,
    accountDetails: null,
    uploadComplete: false,
    fileUploading: false,
    trackComments: [],
    commentsOpen: false
  },
  mutations: {
    TOGGLE_COMMENTS(state, value) {
      if(value == 'toggle') {
        state.commentsOpen = !state.commentsOpen
      }else if(value == 'true') {
        state.commentsOpen = true
      }else if(value == 'false') {
        state.commentsOpen = false
      }
    },
    GET_TRACK_COMMENTS(state) {
      db.collection('tracks').doc(state.tracksArray.filter(track => track.currentTrack == true)[0].filename).get().then(track => {
        state.trackComments = track.data().comments ? track.data().comments : []
      })
    },
    ADD_COMMENT(state, value) {
      let comments = []

      let commentData = {
        author: state.loggedInUserName,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        message: value
      }

      let currentTrack = state.tracksArray.filter(track => track.currentTrack == true)[0]

      db.collection('tracks').doc(currentTrack.filename).get().then(track => {
        comments = track.data().comments ? track.data().comments : []
        comments.push(commentData)
        state.trackComments = comments
        db.collection('tracks').doc(currentTrack.filename).update({
          comments: comments
        })
      })
    },
    DELETE_ACCOUNT(state) {
      let storageRef = firebase.storage().ref()
      let trackNames = []
      let artworkNames = []
      Loading.show({
        message: 'Deleting account...'
      })

      db.collection('users').doc(state.loggedInUserId).get().then(user => {
        if(user.data().bandImage) {
          let bandImage = user.data().bandImage

          let imageRef = storageRef.child(`bandImages/${bandImage}`)
          imageRef.delete().then(() => {
            deleteAccountAndTracks()
          })
        }else {
          deleteAccountAndTracks()
        }
      }).catch(error => {
        Loading.hide()
        alert('Something went wrong. Please try again later.')
        console.error(error)
      })

      function deleteAccountAndTracks() {
        db.collection('tracks').where('uploadedBy', '==', state.loggedInUserId).get().then(tracks => {
          if(tracks) {
            tracks.docs.map(track => {
              trackNames.push(track.id)
              artworkNames.push(track.data().artworkFilename)
            })
            artworkNames.map(artworkName => {
              storageRef.child(`artwork/${artworkName}`).delete().then(() => {
              }).catch(error => {
                Loading.hide()
                console.error(error)
              })
            })
            trackNames.map((trackName, index) => {
              db.collection('tracks').doc(trackName).delete().then(() => {
                storageRef.child(`tracks/${trackName}`).delete()
              }).catch(error => {
                Loading.hide()
                console.error(error)
              })
              if(index == trackNames.length-1) {
                db.collection('users').doc(state.loggedInUserId).delete().then(() => {
                  firebase.auth().currentUser.delete().then(() => {
                    Loading.hide()
                    state.isLoggedIn = false
                  }).catch(error => {
                    Loading.hide()
                    alert('User not deleted. Please try again later.')
                    console.error(error)
                  })
                })
              }
            })
          }else {
            db.collection('users').doc(state.loggedInUserId).delete().then(() => {
              firebase.auth().currentUser.delete().then(() => {
                Loading.hide()
                state.isLoggedIn = false
              }).catch(error => {
                Loading.hide()
                alert('User not deleted. Please try again later.')
                console.error(error)
              })
            })
          }
        }).catch(error => {
          Loading.hide()
          alert('Something went wrong. Please try again later.')
          console.error(error)
        })
      } 
    },
    UPLOAD_TRACK(state, value1, value2) {
      let thisState = state
      if(!value2) {
        db.collection('tracks').doc(value1[0].name).get().then(track => {
          if(!track.exists) {
            state.uploadComplete = false
            state.fileUploading = true
            let artworkName = ''
            let storageRef = firebase.storage().ref()
            let focusedTrack = storageRef.child('tracks').child(value1[0].name)

            if (value1[1]) {
              let focusedArtwork = storageRef.child('artwork').child(value1[1].name)

              let artworkMetadata = {
                customMetadata: {'uploadedById': state.loggedInUserId}
              }
              focusedArtwork.put(value1[1], artworkMetadata)
              artworkName = value1[1].name
            } else {
              artworkName = 'default.png'
            }
            
            let audioMetadata = {
              customMetadata: {
                'artist': value1[2].artist.value,
                'title': value1[2].title.value,
                'uploadedById': state.loggedInUserId,
                'artworkName': artworkName,
                'uploadedByName': state.accountDetails.artistName
              }
            }
            this.uploadAudioTask = focusedTrack.put(value1[0], audioMetadata)

            this.uploadAudioTask.on('state_changed',
              function progress(snapshot) {
                thisState.fileUploadPercentage = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              },
              function errors(error) {
                console.error(error)
              },
              function complete() {
                thisState.uploadComplete = true
                state.fileUploading = false
                db.collection('tracks').doc(value1[0].name).set(
                  {
                    uploadedBy: state.loggedInUserId,
                    artworkFilename: value1[1] ? value1[1].name : ''
                  }
                )
              }
            )
          }
        })
      }
    },
    GET_ACCOUNT_DETAILS(state) {
      db.collection('users').doc(state.loggedInUserId).get().then(user => {
        state.accountDetails = user.data()
        state.accountDetails['email'] = firebase.auth().currentUser.email
      })
    },
    DELETE_TRACK(state, value) {
      Loading.show({
        message: 'Deleting...'
      })
      let storageRef = firebase.storage().ref()
      let trackRef = storageRef.child(`tracks/${value}`)
      trackRef.delete().then(() => {
        let artworkName = ''
        db.collection('tracks').doc(value).get().then(track => {
          artworkName = track.data().artworkFilename ? track.data().artworkFilename : ''
          db.collection('tracks').doc(value).delete().then(() => {
            if(track.data().artworkFilename) {
              let artworkRef = storageRef.child(`artwork/${artworkName}`)
              artworkRef.delete().then(() => {
                Loading.hide()
                this.commit('GET_TRACKS')
                this.commit('GET_ACCOUNT_TRACKS')
              }).catch(error => {
                Loading.hide()
                alert('Something went wrong. Please try again later.')
                console.error(error)
              }) 
            }else {
              Loading.hide()
              this.commit('GET_TRACKS')
              this.commit('GET_ACCOUNT_TRACKS')
            }
          }).catch(error => {
            Loading.hide()
            alert('Something went wrong. Please try again later.')
            console.error(error)
          })
        }).catch(error => {
          Loading.hide()
          alert('Something went wrong. Please try again later.')
          console.error(error)
        })
      }).catch(error => {
        Loading.hide()
        alert('Something went wrong. Please try again later.')
        console.error(error)
      })
    },
    UPDATE_BAND_IMAGE(state) {
      db.collection('users').where('userID', '==', state.loggedInUserId).get().then(users => {
        users.docs.map(user => {
          if(user.data().bandImage.length > 0) {
            let bandImageRef = firebase.storage().ref().child('bandImages/' + user.data().bandImage)
            bandImageRef.getDownloadURL().then(bandImageDownloadUrl => {
              state.bandImageUrl = bandImageDownloadUrl
            })
          }else {
            state.bandImageUrl = ''
          }
        })
      })
    },
    CLEAR_TRACKS_ARRAY(state) {
      state.tracksArray = []
    },
    UPDATE_FILTERED_TRACKS_ARRAY(state, value) {
      state.filteredTracksArray = value
    },
    TOGGLE_TRACK_PLAYING(state, value) {
      state.isTrackPlaying = value
    },
    TOGGLE_EXPLORE(state) {
      state.exploreExpanded = !state.exploreExpanded
    },
    UPDATE_ISLOGGED_IN(state, value) {
      state.isLoggedIn = value
    },
    UPDATE_LOGGED_IN_USER_ID(state) {
      state.loggedInUserId = firebase.auth().currentUser.uid
    },
    UPDATE_LOGGED_IN_USER_NAME(state) {
      db.collection('users').where('userID', '==', firebase.auth().currentUser.uid).get().then(users => {
        users.docs.map(user => {
          state.loggedInUserName = user.data().artistName
        })
      })
    },
    UPDATE_TRACK_ACTIONS_MODAL(state, value) {
      state.trackActionsModalOpen = value
    },
    TOGGLE_FILTER_MODAL(state) {
      state.filterModalOpen = !state.filterModalOpen
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
    CLEAR_TRACKS_ARRAY(state) {
      state.tracksArray = []
    },
    GET_ACCOUNT_TRACKS(state) {
      state.userTracksArray = state.tracksArray.filter(track => track.metaData.uploadedById == state.loggedInUserId)
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
                    artist: metadata.customMetadata.uploadedByName,
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
              }).catch(error => {
                Loading.hide()
                alert('Something went wrong. Please try again later.')
                console.error(error)
              })
            })
            setTimeout(() => {
              Loading.hide()
              this.$router.push('/music')
            }, 1500)
          }).catch(error => {
            Loading.hide()
            alert('Something went wrong. Please try again later.')
            console.error(error)
          })
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
          Loading.hide()
          alert('Something went wrong. Please try again later.')
          console.error(error)
        });
      }).catch(error => {
        Loading.hide()
        alert('Something went wrong. Please try again later.')
        console.error(error)
      });
    }
  }
})

export default store
