<template>
  <div class="accountContainer">
    <div class="accountDetails accountSection">
      <div class="accountSectionContainer" v-on:click="toggleAccountDetails()">
        <div class="accountSectionTitle">Account Details</div>
        <img class="chevron" :class="[displayAccountDetails ? 'open' : 'closed']" src="statics/icons/right-chevron.svg"/>
      </div>
      <div v-if="displayAccountDetails">
        <q-item class="bandImageContainer">
          <img :src="bandImage" alt="band image"/>
        </q-item>
        <q-item>Artist Name: {{computedUserDetails.artistName}}</q-item>
        <q-item>Email address: {{computedUserDetails.email}}</q-item>
        <q-btn class="deleteAccountButton" v-on:click.prevent="deleteAccount()">Delete Account</q-btn>
      </div>
    </div>

    <div class="userTracks accountSection">
      <div class="accountSectionContainer" v-on:click="toggleAccountTracks()">
        <div class="accountSectionTitle">User Tracks</div>
        <img class="chevron" :class="[displayAccountTracks ? 'open' : 'closed']" src="statics/icons/right-chevron.svg"/>
      </div>
      <div v-if="displayAccountTracks">
        <q-item class="accountTracks" v-for="(track, index) in userTracksArray" :key="index">
          <div v-if="computedDeleteMesage == null" class="allTracksArtistAndTitle">
            <div class="">
              <div class="trackArtist">{{track.metaData.artist}}</div>
              <div class="trackTitle">{{track.metaData.title}}</div>
            </div>
            <q-btn v-on:click.prevent="deleteTrack(track.metaData.name)">Delete</q-btn>
            <a>
              <img class="trackInfoIcon" src="statics/icons/menu-white.svg">
            </a>
          </div>
          <div v-else>{{computedDeleteMesage}}</div>
        </q-item>
      </div>
    </div>
    <q-btn class="logoutButton" v-on:click.prevent="logout()">Logout</q-btn>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import firebase from "firebase/app";
import db from "../firestore/firebaseInit"

export default {
  data() {
    return {
      deleteMessage: null,
      displayAccountTracks: false,
      displayAccountDetails: false,
      user: []
    }
  },
  created() {
    this.getUserDetails()
    this.$store.commit('UPDATE_BAND_IMAGE')
    this.$store.commit('GET_ACCOUNT_TRACKS')
  },
  computed: {
    ...mapState(['userTracksArray', 'bandImageUrl']),
    computedDeleteMesage() {
      return this.deleteMessage
    },
    computedUserDetails() {
      return this.user
    },
    bandImage() {
      return this.bandImageUrl
    }
  },
  methods: {
    ...mapMutations(['GET_TRACKS', 'UPDATE_BAND_IMAGE', 'GET_ACCOUNT_TRACKS']),
    logout() {
      firebase.auth().signOut().then(() => {
        this.$store.commit('UPDATE_ISLOGGED_IN', false);
        this.$store.commit('TOGGLE_MENU', false);
        location.reload()
      });
    },
    deleteTrackFromUserAccount(trackName) {
      let usersRef = db.collection('users').doc(`${firebase.auth().currentUser.uid}`)
      usersRef.get().then(snapshot => {
        usersRef.update({ tracks: snapshot.data().tracks.filter(item => item !== trackName) }).then(res => {
          console.log('Successfully deleted')
        }).catch(error => {
          console.error(error)
        })
      })
    },
    deleteTrack(trackName) {
      this.deleteMessage = 'Deleting. Please wait...'
      let trackRef = firebase.storage().ref().child(`tracks/${trackName}`);
      let artworkUrl;

      trackRef.getMetadata().then(metadata => {
        let artworkRef = firebase.storage().ref().child(`artwork/${metadata.customMetadata.artworkName}`);
        trackRef.delete().then(() => {
          metadata.customMetadata.artworkName != 'default.png' ? artworkRef.delete() : false
          this.deleteTrackFromUserAccount(trackName)
          this.deleteMessage = 'Completed'
          setTimeout(() => {
            this.deleteMessage = null
          }, 2000)
          return true
        }).catch(error => {
          console.error(error)
        });
      })
    },
    toggleAccountTracks() {
      this.displayAccountTracks = !this.displayAccountTracks
    },
    toggleAccountDetails() {
      this.displayAccountDetails = !this.displayAccountDetails
    },
    deleteAccount() {
      if (window.confirm("Delete user account and details permantently?")) {
        let user = firebase.auth().currentUser
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(snapshot => {
          if (snapshot.data().tracks.length > 0) {
            let tracks = snapshot.data().tracks
            tracks.map((trackName, index) => {
              let isDeleted = this.deleteTrack(trackName)
              if (index === tracks.length - 1) {
                var deleteInterval = setInterval(deleteFunc, 1000);

                function deleteFunc() {
                  db.collection('users').doc(user.uid).get().then(snapshot => {
                    if (snapshot.data().tracks.length === 0) {
                      userRef.delete().then(() => {
                        console.log('User details deleted')
                        user.delete().then(() => {
                          console.log('Account deleted')
                          clearInterval(deleteInterval)
                        }).catch((error) => {
                          console.log('Error deleting account', error)
                        })
                        clearInterval(deleteInterval)
                      }).catch((error) => {
                        console.log('Error deleting user details', error)
                      })
                    }
                  })
                }
              }
            })
          } else {
            userRef.delete().then(() => {
              console.log('User details deleted')
              user.delete().then(() => {
                console.log('Account deleted')
                location.reload()
              }).catch((error) => {
                console.log('Error deleting account', error)
              })
            }).catch((error) => {
              console.log('Error deleting user details', error)
            })

          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.accountContainer {
  margin-bottom: 70px;
}
.accountTracks {
  padding: 0;
}
.userTracks, .accountDetails {
  margin: 10px;
  padding-bottom: 10px;
}
.accountSection {
  border-bottom: 1px solid gray;
}
.accountSectionTitle {
  font-size: 25px;
}
.chevron {
  height: 20px;
  margin-left: 5px;
  transform: rotate(270deg);
}
.open {
  transform: rotate(-90deg);
}

.closed {
  transform: rotate(90deg);
}
.accountSectionContainer {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}
.logoutButton {
  position: fixed;
  bottom: 70px;
  right: 20px;
}
.deleteAccountButton {
  color: red;
}
.allTracksArtistAndTitle {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  border-bottom: 1px solid lightgray;
  color: white;
}
.trackArtist {
  font-size: 18px;
}
.trackTitle {
  font-size: 15px;
}
.bandImageContainer {
  width: 100%;

  img {
    width: 100%;
  }
}
</style>
