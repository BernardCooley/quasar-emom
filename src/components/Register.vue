<template>
  <div class="registerContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field class="inputField" label="Artist Name" error-label="">
              <q-input id="artistName" v-model="user.artistName.value" />
                <div class="validationMessage" v-for="(artistNameValidationMessage, index) in user.artistName.errors" :key="index">
                  {{artistNameValidationMessage}}
                </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Email" error-label="">
              <q-input id="email" v-model="user.email.value" />
                <div class="validationMessage" v-for="(emailValidationMessage, index) in user.email.errors" :key="index">
                  {{emailValidationMessage}}
                </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Password" error-label="">
              <q-input type="password" id="password" v-model="user.password.value"/>
                <div class="validationMessage" v-for="(passwordValidationMessage, index) in user.password.errors" :key="index">
                  {{passwordValidationMessage}}
                </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Confirm Password" error-label="">
              <q-input type="password" id="passwordConfirm" v-model="user.passwordConfirm.value"/>
                <div class="validationMessage" v-for="(passwordConfirmValidationMessage, index) in user.passwordConfirm.errors" :key="index">
                  {{passwordConfirmValidationMessage}}
                </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Band Image (optional)">
              <input type="file" ref="bandImageFileToUpload" multiple @change="getSelectedFile()" class="input-file">
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Artist Bio (optional)">
                <q-input class="artistBio" type="textarea" v-model="user.artistBio.value"/>
            </q-field>
          </q-item>
          <q-btn v-on:click.prevent="register()">Register</q-btn>
        </q-list>
        <div class="regMessage">{{registerMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase/app";
import { Loading } from 'quasar'
import { mapMutations, mapState } from "vuex"

export default {
  name: 'register',
  data() {
    return {
      user: {
        artistName: {
          value: "",
          errors: []
        },
        email: {
          value: "",
          errors: []
        },
        password: {
          value: "",
          errors: []
        },
        passwordConfirm: {
          value: "",
          errors: []
        },
        artistBio: {
          value: "",
          errors: []
        }
      },
      bandImageFileToUpload: null,
      errorsBool: null,
      userID: null,
      registerMessage: null
    };
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN']),
    validation() {
      this.errorsBool = false
      this.user.artistName.errors = []
      this.user.email.errors = []
      this.user.password.errors = []
      this.user.passwordConfirm.errors = []

      if (!this.user.artistName.value) {
        this.user.artistName.errors.push("Artist name required.")
      }
      if (!this.user.email.value) {
        this.user.email.errors.push("Email required.")
      }

      var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.")
      }

      if (this.user.password.value.length < 6) {
        this.user.password.errors.push("Minimum 6 characters required.")
      }

      if (!this.user.password.value) {
        this.user.password.errors.push("Password required.")
      }

      if (this.user.password.value != this.user.passwordConfirm.value) {
        this.user.passwordConfirm.errors.push("Password does not match.")
      }

      if (!this.user.passwordConfirm.value) {
        this.user.passwordConfirm.errors.push(
          "Password confirmation required."
        );
      }

      for (var x in this.user) {
        if (this.user[x].errors.length > 0) {
          this.errorsBool = true;
        }
      }
    },
    getSelectedFile() {
      this.bandImageFileToUpload = this.$refs.bandImageFileToUpload.files[0]
    },
    register(e) {
      this.validation()
      if (!this.errorsBool) {
        Loading.show({
          message: 'Registering...'
        })
        this.registerUser()
      }
    },
    registerUser() {
      firebase.auth().createUserWithEmailAndPassword(
          this.user.email.value,
          this.user.password.value
        )
        .then(data => {
          this.sendVerificationEmail(data)
        }).catch(error => {
          Loading.hide()
          this.registerMessage = error.message == 'The email address is already in use by another account.' ? 'Email address already exists' : ''
          Loading.hide()
        })
    },
    createUserAccount(userID) {
      db.collection('users').doc(userID).set({
        userID: userID,
        artistName: this.user.artistName.value,
        bandImage: this.bandImageFileToUpload ? this.bandImageFileToUpload.name : '',
        artistBio: this.user.artistBio
      }).then(() => {
        this.uploadImage(this.bandImageFileToUpload)
      }).catch(error => {
        Loading.hide()
        firebase.auth().currentUser.delete()
        console.error(error)
      })
    },
    sendVerificationEmail(data) {
      firebase.auth().currentUser.sendEmailVerification().then(() => {
        alert('Confirmation email sent.')
        this.createUserAccount(data.user.uid)
      }).catch(error => {
        Loading.hide()
        alert('email verification failed. Please try again later.')
        console.error(error)
      });
    },
    uploadImage(image) {
      if(image) {
        let storageRef = firebase.storage().ref()

        let focusedArtwork = storageRef.child('bandImages').child(image.name)

        var artworkMetadata = {
          customMetadata: {
            'uploadedById': firebase.auth().currentUser.uid
          }
        }
        focusedArtwork.put(image, artworkMetadata).then(data => {
          Loading.hide()
          firebase.auth().signOut().then(() => {
          }).catch(error => {
            Loading.hide()
            console.error(error)
          });
          this.$router.push('/login')
        }).catch(error => console.log(error))
      }else {
        Loading.hide()
        firebase.auth().signOut().then(() => {
          }).catch(error => {
            Loading.hide()
            console.error(error)
          })
          this.$router.push('/login')
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.regMessage {
  width: 100%;
  height: 75px;
  text-align: center;
  margin: auto;
  padding-top: 30px;
  font-size: 20px;
}
.artistBio {
  min-height: 30px;
}
</style>
