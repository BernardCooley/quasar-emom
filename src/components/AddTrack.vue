<template>
  <div class="addTrackContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list v-if="!fileUploadingComp">
          <q-item>
            <q-field label="Artist" error-label="">
              <q-input id="artist" v-model="track.artist.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Title" error-label="">
              <q-input id="trackTitle" v-model="track.title.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Artwork Url (optional)" error-label="">
              <q-input id="artworkUrl" v-model="track.artworkUrl.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Upload Track" error-label="">
              <input type="file" ref="trackUpload" multiple @change="getUploadFile" class="input-file">
            </q-field>
          </q-item>

          
        </q-list>
        <q-item>
            <!--<q-progress :percentage="updatePercentage" />-->
            <div v-if="fileUploadingComp">{{fileUploadPercentage}}% uploaded</div>
          </q-item>

          <q-btn v-if="!fileUploadingComp" v-on:click="uploadFile(fileToUpload)">Upload</q-btn>
          <q-btn v-if="fileUploadingComp" v-on:click="cancel">Cancel</q-btn>
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
        artist: { value: null, errors: [] },
        title: { value: null, errors: [] },
        trackUrl: { value: null, errors: [] },
        artworkUrl: { value: null, errors: [] },
        uploadedBy: { value: null, errors: [] }
      },
      errorsBool: null,
      userID: null,
      addTrackMessage: null,
      trackUpload: null,
      fileToUpload: null,
      uploadTask: null,
      fileUploading: false
    };
  },
  computed: {
    ...mapState(["fileUploadPercentage"]),
    fileUploadingComp() {
      return this.fileUploading
    }
  },
  methods: {
    ...mapMutations(['UPDATE_ADD_TRACK', 'UPDATE_FILE_UPLOAD_PERCENTAGE']),
    validation: function(e) {
      this.errorsBool = false;
      this.track.artist.errors = [];
      this.track.title.errors = [];
      this.track.trackUrl.errors = [];
      this.track.artworkUrl.errors = [];

      if (!this.track.artist.value) {
        this.track.artist.errors.push("Artist name required.");
      }

      if (!this.track.title.value) {
        this.track.title.errors.push("Track title required.");
      }

      if (!this.track.trackUrl.value) {
        this.track.trackUrl.errors.push("Track Url required.");
      }

      for (var x in this.track) {
        if (this.track[x].errors.length > 0) {
          this.errorsBool = true;
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
    uploadFile: function(fileToUpload) {
      let store = this.$store
      this.validation();
      // if (!this.errorsBool) {
      this.fileUploading = true
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
          this.fileUploading = false
        }
      )
      // }
    },
    cancel: function() {
      this.uploadTask.cancel()
      this.fileUploading = false
    }
  }
};
</script>

<style>
.validationMessage {
  color: red;
  text-align: center;
}

.native-input:active,
.native-input:focus {
  outline: none;
}
</style>
