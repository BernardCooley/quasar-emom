<template>
  <div class="registerContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field class="inputField" label="Artist name" error-label="">
              <q-input id="artistName" v-model="user.artistName.value" />
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Email" error-label="">
              <q-input id="email" v-model="user.email.value" />
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Password" error-label="">
              <q-input type="password" id="password" v-model="user.password.value"/>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Confirm password" error-label="">
              <q-input type="password" id="passwordConfirm" v-model="user.passwordConfirm.value"/>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Band image (optional)">
              <input type="file" ref="bandImageFileToUpload" multiple @change="getSelectedFile()" class="input-file">
            </q-field>
          </q-item>
          <q-btn v-on:click.prevent="register()">Register</q-btn>
          <span>{{registerMessage}}</span>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase/app";
import { Loading } from 'quasar'

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
        }
      },
      bandImageFileToUpload: null,
      errorsBool: null,
      userID: null,
      registerMessage: null
    };
  },
  methods: {
    validation(e) {
      this.errorsBool = false;
      this.user.artistName.errors = [];
      this.user.email.errors = [];
      this.user.password.errors = [];
      this.user.passwordConfirm.errors = [];

      if (!this.user.artistName.value) {
        this.user.artistName.errors.push("Artist name required.");
      }
      if (!this.user.email.value) {
        this.user.email.errors.push("Email required.");
      }

      var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.")
      }

      if (this.user.password.value.length < 6) {
        this.user.password.errors.push("Minimum 6 characters.")
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
      Loading.show({
        message: 'Registering'
      })
      this.validation();
      if (!this.errorsBool) {
        this.registerUser();
        e.preventDefault()
      }
    },
    registerUser() {
      firebase.auth().createUserWithEmailAndPassword(
          this.user.email.value,
          this.user.password.value
        )
        .then(data => {
          this.createUserAccount(data.user.uid)
          this.$router.push('/music')
        })
    },
    createUserAccount(userID) {
      db.collection('users').doc(userID).set({
        userID: userID,
        artistName: this.user.artistName.value,
        bandImage: this.bandImageFileToUpload.name
      }).then(() => {
        this.uploadImage(this.bandImageFileToUpload)
      }).catch(error => console.log(error))
    },
    uploadImage(image) {
      let storageRef = firebase.storage().ref()

      let focusedArtwork = storageRef.child('bandImages').child(image.name)

      var artworkMetadata = {
        customMetadata: {
          'uploadedById': firebase.auth().currentUser.uid
        }
      }
      focusedArtwork.put(image, artworkMetadata).then(data => {
        Loading.hide()
        this.registerMessage = 'Registration successful'
        setTimeout(() => {
          this.registerMessage = null
        }, 1000)
        location.reload()
      }).catch(error => console.log(error))
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.validationMessage {
  color: red;
  text-align: center;
}
</style>
