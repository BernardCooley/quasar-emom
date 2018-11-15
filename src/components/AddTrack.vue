<template>
  <div class="addTrackContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list v-if="!uploadingFile">
          <q-item>
            <q-field label="Artist">
              <q-input id="artist" v-model="track.artist.value" />
              <div class="validationMessage">{{track.artist.errorMessage}}</div>
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Title">
              <q-input id="trackTitle" v-model="track.title.value" />
              <div class="validationMessage">{{track.title.errorMessage}}</div>
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Artwork Url (optional)">
              <q-input id="artworkUrl" v-model="track.artworkUrl.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Upload Track">
              <input type="file" ref="trackUpload" multiple @change="getUploadFile" class="input-file">
            </q-field>
          </q-item>

        </q-list>
        <q-item>
          <!--<q-progress :percentage="updatePercentage" />-->
          <div v-if="uploadingFile && !completedUpload">{{fileUploadPercentage}}% uploaded</div>
        </q-item>

        <q-btn v-if="!uploadingFile" v-on:click="uploadFile(fileToUpload)">Upload</q-btn>
        <q-btn v-if="uploadingFile && !completedUpload" v-on:click="cancelUpload">Cancel</q-btn>
        <div class="uploadCompleteContainer" v-if="uploadComplete">
          <div class="uploadSuccessMessage">Upload Complete</div>
          <q-btn v-on:click="resetForm">Upload Another Track</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase/app";
import { mapMutations, mapState } from "vuex"

import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

export default {
  name: "add-track",
  data: function() {
    return {
      track: {
        artist: { value: null, errorMessage: '' },
        title: { value: null, errorMessage: '' },
        artworkUrl: { value: null },
        uploadedBy: { value: null }
      },
      userID: null,
      addTrackMessage: null,
      trackUpload: null,
      fileToUpload: null,
      uploadTask: null,
      fileUploading: false,
      completedUpload: false
    };
  },
  computed: {
    ...mapState(["fileUploadPercentage"]),
    uploadingFile() {
      return this.fileUploading
    },
    uploadComplete() {
      return this.completedUpload
    }
  },
  methods: {
    ...mapMutations(['UPDATE_ADD_TRACK', 'UPDATE_FILE_UPLOAD_PERCENTAGE']),
    validation: function(e) {
      if (!this.track.artist.value) {
        this.track.artist.errorMessage = 'Artist is required.'
      }else {
        this.track.artist.errorMessage = ''
      }

      if (!this.track.title.value) {
        this.track.title.errorMessage = 'Title is required.'
      }else {
        this.track.title.errorMessage = ''
      }

      for (var x in this.track) {
        if (this.track[x].errorMessage.length > 0) {
          return true
        } else {
          return false
        }
      }
    },
    getUploadFile: function() {
      this.fileToUpload = this.$refs.trackUpload.files[0]
    },
    // getMetadata: function() {
    //   let storageRef = firebase.storage().ref()
    //   let tracksRef = storageRef.child('tracks/Jennifer_Lopez_-_Us (2).mp3')

    //   // Get metadata properties
    //   tracksRef.getMetadata().then(function(metadata) {
    //     console.log(metadata)
    //     // Metadata now contains the metadata for 'images/forest.jpg'
    //   }).catch(function(error) {
    //     // Uh-oh, an error occurred!
    //   });
    // },
    doesFileExist: function() {
      firebase.storage().ref().child('tracks/' + this.fileToUpload.name).getDownloadURL().then(function() {
        return true
      }).catch(function() {
        return false
      })
    },
    uploadFile: function(fileToUpload) {
      let self = this
      this.fileToUpload = fileToUpload
      let store = this.$store

      if (!this.validation()) {
        if (!this.doesFileExist()) {
          self.completedUpload = false
          self.fileUploading = true
          let storageRef = firebase.storage().ref()
          let tracksRef = storageRef.child('tracks')
          let focusedTrack = tracksRef.child(fileToUpload.name)

          var metadata = {
            customMetadata: {
              'artist': this.track.artist.value,
              'title': this.track.title.value,
              'artworkUrl': this.track.artworkUrl.value,
              'uploadedBy': firebase.auth().currentUser.uid
            }
          }

          this.uploadTask = focusedTrack.put(fileToUpload, metadata)

          this.uploadTask.on('state_changed',
            function progress(snapshot) {
              store.commit("UPDATE_FILE_UPLOAD_PERCENTAGE", Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
            },
            function errors(err) {

            },
            function complete() {
              console.log('Upload Complete')
              self.completedUpload = true
            }
          )
        }
      }
    },
    cancelUpload: function() {
      this.uploadTask.cancel()
      this.resetForm()
    },
    resetForm: function() {
      this.fileUploading = false
      this.completedUpload = false
      this.track = {
        artist: { value: null, errorMessage: '' },
        title: { value: null, errorMessage: '' },
        artworkUrl: { value: null },
        uploadedBy: { value: null }
      }
    }
  }
};
</script>

<style lang='scss'>
.validationMessage {
  color: red;
  text-align: left;
}

.native-input:active,
.native-input:focus {
  outline: none;
}

.uploadCompleteContainer {
  display: flex;
  font-size: 20px;
  padding-top: 50px;
  flex-direction: column;
  align-items: center;

  .uploadSuccessMessage {
    margin: 50px 20px;
    color: green;
    text-align: center;
  }
}
</style>
