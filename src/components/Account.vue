<template>
  <div class="accountContainer">
    <div class="accountDetails accountSection">
      <div class="accountSectionContainer" v-on:click="toggleAccountDetails()">
        <div class="accountSectionTitle">Account Details</div>
      </div>
      <div>
        <q-item class="bandImageContainer">
          <img v-if="bandImageUrl.length > 0" :src="bandImageUrl" alt="band image"/>
        </q-item>

        <q-item class="accountDetail">
          <div v-if="fieldToEdit != 'artistName'">{{accountDetailsComp.artistName}}</div>
          <q-field v-else class="inputField" label="Artist Name" error-label="">
            <q-input id="artistName" v-model="user.artistName.value" />
            <div class="validationMessage" v-for="(artistNameValidationMessage, index) in user.artistName.errors" :key="index">
              {{artistNameValidationMessage}}
            </div>
          </q-field>
          <i v-if="fieldToEdit != 'artistName'" class="editIcon fas fa-pen" v-on:click="editAccount('artistName')"></i>
          <div class="editIcons" v-else>
            <i class="editIcon fas fa-check" v-on:click="saveAccountChanges('artist name')"></i>
            <i class="editIcon fas fa-times" v-on:click="cancelChanges()"></i>
          </div>
        </q-item>

        <q-item class="accountDetail">
          <div v-if="fieldToEdit != 'email'">{{accountDetailsComp.email}}</div>
          <q-field v-else class="inputField" label="Email" error-label="">
            <q-input id="email" v-model="user.email.value" />
            <div class="validationMessage" v-for="(emailValidationMessage, index) in user.email.errors" :key="index">
              {{emailValidationMessage}}
            </div>
          </q-field>
          <i v-if="fieldToEdit != 'email'" class="editIcon fas fa-pen" v-on:click="editAccount('email')"></i>
          <div class="editIcons" v-else>
            <i class="editIcon fas fa-check" v-on:click="saveAccountChanges('email')"></i>
            <i class="editIcon fas fa-times" v-on:click="cancelChanges()"></i>
          </div>
        </q-item>

        <q-item class="accountDetail">
          <div v-if="fieldToEdit != 'artistBio'">{{accountDetailsComp.artistBio}}</div>
          <q-field v-else label="Artist Bio">
            <q-input class="artistBio" type="textarea" v-model="user.artistBio.value"/>
          </q-field>
          <i v-if="fieldToEdit != 'artistBio'" class="editIcon fas fa-pen" v-on:click="editAccount('artistBio')"></i>
          <div class="editIcons" v-else>
            <i class="editIcon fas fa-check" v-on:click="saveAccountChanges('artist bio')"></i>
            <i class="editIcon fas fa-times" v-on:click="cancelChanges()"></i>
          </div>
          </q-item>
        <q-btn class="deleteAccountButton" v-on:click.prevent="deleteAccount()">Delete Account</q-btn>
      </div>
    </div>

    <div class="userTracks accountSection">
      <div class="accountSectionContainer" v-on:click="toggleAccountTracks()">
        <div class="accountSectionTitle">User Tracks</div>
      </div>
      <div>
        <q-item class="accountTracks" v-for="(track, index) in userTracks" :key="index">
          <div v-if="computedDeleteMesage == null" class="allTracksArtistAndTitle">
            <div class="">
              <div class="trackTitle">{{track.metaData.title}}</div>
            </div>
            <q-btn v-on:click.prevent="deleteTrack(track)">Delete</q-btn>
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
import { mapMutations, mapState } from "vuex"
import firebase from "firebase/app"
import db from "../firestore/firebaseInit"
import { Loading } from 'quasar'

export default {
  data() {
    return {
      deleteMessage: null,
      displayAccountTracks: false,
      displayAccountDetails: false,
      user: [],
      fieldToEdit: '',
      user: {
        artistName: {
          value: '',
          errors: []
        },
        email: {
          value: '',
          errors: []
        },
        password: {
          value: '',
          errors: []
        },
        passwordConfirm: {
          value: '',
          errors: []
        },
        artistBio: {
          value: '',
          errors: []
        }
      }
    }
  },
  computed: {
    ...mapState(['userTracksArray', 'bandImageUrl', 'accountDetails', 'loggedInUserId']),
    computedDeleteMesage() {
      return this.deleteMessage
    },
    userTracks() {
      return this.userTracksArray
    },
    accountDetailsComp() {
      return this.accountDetails
    }
  },
  methods: {
    ...mapMutations(['UPDATE_BAND_IMAGE', 'GET_ACCOUNT_TRACKS', 'DELETE_TRACK', 'GET_ACCOUNT_DETAILS', 'DELETE_ACCOUNT', 'UPDATE_TRACK_ARTIST']),
    validation() {
      this.user.email.errors = []

      if (!this.user.email.value) {
        this.user.email.errors.push("Email required.")
      }
      let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.")
      }
    },
    logout() {
      firebase.auth().signOut().then(() => {
        this.$store.commit('UPDATE_ISLOGGED_IN', false)
        this.$router.push('/login')
      });
    },
    deleteTrack(track) {
      if (window.confirm("Are you sure?")) {
        this.$store.commit('DELETE_TRACK', track.filename)
      }
    },
    toggleAccountTracks() {
      this.$store.commit('GET_ACCOUNT_TRACKS')
      this.displayAccountTracks = !this.displayAccountTracks
    },
    toggleAccountDetails() {
      this.$store.commit('GET_ACCOUNT_DETAILS')
      this.displayAccountDetails = !this.displayAccountDetails
    },
    deleteAccount() {
      if (window.confirm("Delete user account and details permantently?")) {
        this.$store.commit('DELETE_ACCOUNT')
        this.$router.push('/login')
      }
    },
    editAccount(field) {
      if(field == 'artistName') {
        this.fieldToEdit = 'artistName'
        this.user.artistName.value = this.accountDetailsComp.artistName
      }else if(field == 'email') {
        this.fieldToEdit = 'email'
        this.user.email.value = this.accountDetailsComp.email
      }else if(field == 'artistBio') {
        this.fieldToEdit = 'artistBio'
        this.user.artistBio.value = this.accountDetailsComp.artistBio
      }
    },
    saveAccountChanges(field) {
      if(this.user.artistName.value != '' || this.user.email.value != '' || this.user.artistBio.value != '') {
        if (window.confirm(`Update ${field}?`)) {
          if(field == 'artist name') {
            db.collection('users').doc(this.loggedInUserId).update({
              artistName: this.user.artistName.value
            }).then(() => {
              alert('Artist name updated')
              this.$store.commit('GET_ACCOUNT_DETAILS')
              this.fieldToEdit = ''
              this.$store.commit('UPDATE_TRACK_ARTIST', this.user.artistName.value)
              this.user.artistName.value = ''
            }).catch(error => {
                console.error(error);
            })
        }else if(field == 'email') {
            this.validation()
            if(this.user.email.value != this.accountDetailsComp.email) {
              if(this.user.email.errors.length == 0) {
                firebase.auth().currentUser.updateEmail(this.user.email.value).then(() => {
                  alert('Email updated')
                  firebase.auth().currentUser.sendEmailVerification().then(() => {
                    alert('Confirmation email sent.')
                    this.$store.commit('GET_ACCOUNT_DETAILS')
                  }).catch(function(error) {
                    console.log(error)
                  });
                }).catch(error => {
                  console.log(error)
                });
                this.fieldToEdit = ''
                this.user.email.value = ''
              }else {
                console.log('invalid')
              }
            }
          }else if(field == 'artist bio') {
            db.collection('users').doc(this.loggedInUserId).update({
              artistBio: this.user.artistBio.value
            }).then(() => {
              alert('Artist name updated')
              this.$store.commit('GET_ACCOUNT_DETAILS')
              this.fieldToEdit = ''
              this.user.artistBio.value = ''
            }).catch(error => {
                console.error(error);
            })
          } 
        }
      }else {
        alert('Field cannot be blank.')
      }
    },
    cancelChanges() {
      this.fieldToEdit = ''
      this.user.artistName.value = ''
      this.user.email.value = ''
      this.user.artistBio.value = ''
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
  margin-top: 20px;
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
.trackTitle {
  font-size: 20px;
}
.bandImageContainer {
  width: 100%;

  img {
    width: 100%;
  }
}
.editIcon {
  margin-left: 10px;
  color: darkgray
}
.editIcons {
  display: flex;
}
.accountDetail {
  display: flex;
  justify-content: space-between;
}
</style>
