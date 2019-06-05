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
    trackInputModalOpen: false,
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
    accountDetails: null,
    uploadComplete: false,
    fileUploading: false,
    trackComments: [],
    commentsOpen: false,
    trackLimitReached: false,
    isUserAdmin: false,
    singleUpload: true,
    compilationData: {
      compilationDetails: [
        {
          title: {
            value: null,
            errors: []
          },
          artworkFile: {
            value: null,
            errors: []
          },
          releaseDate: {
            value: null,
            errors: []
          }
        }
      ],
      trackDetails: []
    },
    totalTracksUploaded: 0,
    compilationUploaded: false
  },
  mutations: {
    RESET_COMPILATION_DATA(state) {
      state.compilationData = {
        compilationDetails: [
          {
            title: {
              value: null,
              errors: []
            },
            artworkFile: {
              value: null,
              errors: []
            },
            releaseDate: {
              value: null,
              errors: []
            }
          }
        ],
        trackDetails: []
      }
    },
    SET_COMPILATION_UPLOADED(state, value) {
      state.compilationUploaded = value
    },
    ADD_TRACK_TO_COMPILATION(state, value) {
      state.compilationData.trackDetails.length > 0 ? value.trackNumber.value = state.compilationData.trackDetails[state.compilationData.trackDetails.length-1].trackNumber.value + 1 : null

      state.compilationData.trackDetails.push(value)
    },
    UPLOAD_TRACK(state, uploadTrack) {
      let compDetails = state.compilationData.compilationDetails[0]
      let thisState = state
      db.collection('tracks').doc(`${uploadTrack.artist.value}-${uploadTrack.title.value}`).get().then(track => {
        if (!track.exists) {
          let artworkName = ''
          let audioMetadata = {
            customMetadata: {
              'artist': uploadTrack.artist.value,
              'title': uploadTrack.title.value,
              'uploadedById': state.loggedInUserId,
              'artworkName': compDetails.artworkFile.value.name,
              'uploadedByName': state.accountDetails.artistName
            }
          }

          let storageRef = firebase.storage().ref()
          let focusedTrack = storageRef.child('tracks').child(`${uploadTrack.artist.value} - ${uploadTrack.title.value}`)
          this.uploadAudioTask = focusedTrack.put(uploadTrack.audioFile.value, audioMetadata)
          
          this.uploadAudioTask.on('state_changed',
            function progress(snapshot) {
              thisState.compilationData.trackDetails[uploadTrack.trackNumber.value-1].uploadPercentage.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)

              if(thisState.compilationData.trackDetails[uploadTrack.trackNumber.value-1].uploadPercentage.value == 100) {
                thisState.totalTracksUploaded++
              }

              if(thisState.totalTracksUploaded == thisState.compilationData.trackDetails.length) {
                thisState.compilationData = []
                thisState.compilationUploaded = true

                setTimeout(() => {
                  thisState.compilationUploaded = true
                }, 5000)
              }
            },
            function errors(error) {console.error(error)},
            function complete() {
              db.collection('tracks').doc(`${uploadTrack.artist.value} - ${uploadTrack.title.value}`).set(
                {
                  artist: uploadTrack.artist.value,
                  title: uploadTrack.title.value,
                  uploadedBy: state.loggedInUserId,
                  artworkFilename: compDetails.artworkFile.value.name,
                  compilation: {
                    title: compDetails.title.value,
                    releaseDate: compDetails.releaseDate.value,
                    artworkName: compDetails.artworkFile.value.name
                  }
                }
              )
            }
          )
        } else {alert('Track already exists')}
      })
    },
    UPDATE_SINGLE_DOWNLOAD(state, value) {
      state.singleUpload = value
    },
    ADD_COMPILATION_TRACK(state) {
      state.compilationData.trackDetails.push({
        artist: {
          value: null,
          errors: []
        },
        title: {
          value: null,
          errors: []
        },
        audioFile: {
          value: null,
          errors: []
        },
        trackNumber: {
          value: state.compilationData.trackDetails.length + 1,
          errors: []
        },
        uploadPercentage: {
          value: 0,
          errors: []
        }
      });
    },
    REMOVE_COMPILATION_TRACK(state, value) {
      value.forEach((val, index) => {
        val.trackNumber = index + 1
      })
      state.compilationData.trackDetails = value
    },
    UPDATE_COMPILATION_TRACKS(state, value) {
      state.compilationData.trackDetails = value
    },
    SET_RELEASE_DATE_TO_TODAY(state) {
      let date = new Date()
      let month = String(date.getMonth()+1)
      let year = String(date.getFullYear())
      let dayOfMonth = String(date.getDate())
      let currentDate = `${year}-${month.length == 1 ? '0' + month : month}-${dayOfMonth.length == 1 ? '0' + dayOfMonth : dayOfMonth}`

      state.compilationData.compilationDetails[0].releaseDate.value = currentDate
    },
    UPDATE_IS_USER_ADMIN(state, value) {
      state.isUserAdmin = value
    },
    UPDATE_TRACK_ARTIST(state, value) {
      db.collection('tracks').where('uploadedBy', '==', firebase.auth().currentUser.uid).get().then(tracks => {
        tracks.docs.map(track => {
          let tracksRef = firebase.storage().ref().child('tracks').child(track.id)
          tracksRef.getMetadata().then(meta => {
            let customMetadata = meta.customMetadata

            customMetadata.uploadedByName = value
            let metadata = {
              customMetadata
            }
            tracksRef.updateMetadata(metadata)
          })
        })
      })
    },
    UPDATE_TRACK_LIMIT_REACHED(state) {
      state.trackLimitReached = state.userTracksArray.length > 2 ? true : false
    },
    UPDATE_COMPLETED_STATE(state, value) {
      state.uploadComplete = value
    },
    UPDATE_FILE_UPLOADING_FLAG(state, value) {
      state.fileUploading = value
    },
    TOGGLE_COMMENTS(state, value) {
      if (value == 'toggle') {
        state.commentsOpen = !state.commentsOpen
      } else if (value == 'true') {
        state.commentsOpen = true
      } else if (value == 'false') {
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
        if (user.data().bandImage) {
          let bandImage = user.data().bandImage

          let imageRef = storageRef.child(`bandImages/${bandImage}`)
          imageRef.delete().then(() => {
            deleteAccountAndTracks()
          })
        } else {
          deleteAccountAndTracks()
        }
      }).catch(error => {
        Loading.hide()
        console.error(error)
      })

      function deleteAccountAndTracks() {
        db.collection('tracks').where('uploadedBy', '==', state.loggedInUserId).get().then(tracks => {
          if (tracks) {
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
              if (index == trackNames.length - 1) {
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
          } else {
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
          console.error(error)
        })
      }
    },
    UPLOAD_COMPILATION_DETAILS(state) {
      let compDetails = state.compilationData.compilationDetails[0]
      let storageRef = firebase.storage().ref()
      let focusedArtwork = storageRef.child('artwork').child(compDetails.artworkFile.value.name)
      focusedArtwork.put(compDetails.artworkFile.value)
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
            if (track.data().artworkFilename) {
              let artworkRef = storageRef.child(`artwork/${artworkName}`)
              artworkRef.delete().then(() => {
                Loading.hide()
                this.commit('GET_TRACKS')
                this.commit('GET_ACCOUNT_TRACKS')
              }).catch(error => {
                Loading.hide()
                console.error(error)
              })
            } else {
              Loading.hide()
              this.commit('GET_TRACKS')
              this.commit('GET_ACCOUNT_TRACKS')
            }
          }).catch(error => {
            Loading.hide()
            console.error(error)
          })
        }).catch(error => {
          Loading.hide()
          console.error(error)
        })
      }).catch(error => {
        Loading.hide()
        console.error(error)
      })
    },
    UPDATE_BAND_IMAGE(state) {
      db.collection('users').where('userID', '==', state.loggedInUserId).get().then(users => {
        users.docs.map(user => {
          if (user.data().bandImage.length > 0) {
            let bandImageRef = firebase.storage().ref().child('bandImages/' + user.data().bandImage)
            bandImageRef.getDownloadURL().then(bandImageDownloadUrl => {
              state.bandImageUrl = bandImageDownloadUrl
            })
          } else {
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
    OPEN_CLOSE_TRACK_INPUT_MODAL(state, value) {
      state.trackInputModalOpen = value
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

      if (value != undefined) {
        db.collection('tracks').where('uploadedBy', '==', value).get().then(tracks => {
          tracks.docs.map(track => {
            trackNames.push(track.id)
          })
          retrieveTracks(trackNames)
        })
      } else {
        db.collection('tracks').get().then(tracks => {
          tracks.docs.map(track => {
            if (track.data().compilation) {
              let releaseDate = track.data().compilation.releaseDate.slice(0, 10)
              let date = new Date()
              let month = String(date.getMonth()+1)
              let year = String(date.getFullYear())
              let dayOfMonth = String(date.getDate())
              let currentDate = `${year}-${month.length == 1 ? '0' + month : month}-${dayOfMonth.length == 1 ? '0' + dayOfMonth : dayOfMonth}`

              currentDate >= releaseDate ? trackNames.push(track.id) : null
            }else {
              trackNames.push(track.id)
            }
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

                db.collection('tracks').doc(trackFilename).get().then(track => {
                  let artistName = track.data().artist
                  let title = track.data().title

                  let compilation = track.data().compilation ? track.data().compilation.title : ''

                  this.state.tracksArray.push({
                    metaData: {
                      artist: artistName,
                      title: title,
                      artworkUrl: artworkUrl,
                      uploadedByArtist: metadata.customMetadata.uploadedByName,
                      uploadedById: metadata.customMetadata.uploadedById,
                      favourites: metadata.customMetadata.favourites,
                      compilation: compilation
                    },
                    downloadURL: trackURL,
                    filename: trackFilename,
                    currentTrack: index == 0 ? true : false
                  })
                  Loading.hide()
                })
              }).catch(error => {
                Loading.hide()
                console.error(error)
              })
            })
            setTimeout(() => {
              Loading.hide()
              this.commit('GET_ACCOUNT_DETAILS')
              this.commit('GET_ACCOUNT_TRACKS')
              this.commit('UPDATE_TRACK_LIMIT_REACHED')
            }, 1000)
          }).catch(error => {
            Loading.hide()
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
          console.error(error)
        });
      }).catch(error => {
        Loading.hide()
        console.error(error)
      });
    }
  }
})

export default store
