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
              <input type="file" ref="artworkUpload" multiple @change="getArtworkFile" class="input-file">
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Upload Track">
              <input type="file" ref="trackUpload" multiple @change="getAudioFile" class="input-file">
            </q-field>
          </q-item>
        </q-list>
        <q-item>
          <div v-if="uploadingFile && !completedUpload">{{fileUploadPercentage}}% uploaded</div>
        </q-item>

        <q-btn v-if="!uploadingFile" v-on:click="uploadFile(audioFileToUpload, artworkFileToUpload)">Upload</q-btn>
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

export default {
  name: "add-track",
  data: function () {
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
      audioFileToUpload: null,
      artworkFileToUpload: null,
      uploadAudioTask: null,
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
    validation: function (e) {
      if (!this.track.artist.value) {
        this.track.artist.errorMessage = 'Artist is required.'
      } else {
        this.track.artist.errorMessage = ''
      }

      if (!this.track.title.value) {
        this.track.title.errorMessage = 'Title is required.'
      } else {
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
    getArtworkFile: function () {
      this.artworkFileToUpload = this.$refs.artworkUpload.files[0]
    },
    getAudioFile: function () {
      this.audioFileToUpload = this.$refs.trackUpload.files[0]
    },
    doesFileExist: function () {
      firebase.storage().ref().child('tracks/' + this.audioFileToUpload.name).getDownloadURL().then(function () {
        return true
      }).catch(function () {
        return false
      })
    },
    uploadFile: function (audioFileToUpload, artworkFileToUpload) {
      let self = this
      this.audioFileToUpload = audioFileToUpload
      this.artworkFileToUpload = artworkFileToUpload
      let store = this.$store

      if (!this.validation()) {
        if (!this.doesFileExist()) {
          self.completedUpload = false
          self.fileUploading = true
          let storageRef = firebase.storage().ref()
          let tracksRef = storageRef.child('tracks')
          let artworkRef = storageRef.child('artwork')
          let focusedTrack = tracksRef.child(audioFileToUpload.name)
          let artworkName = ''
          if (artworkFileToUpload) {
            let focusedArtwork = artworkRef.child(artworkFileToUpload.name)
            this.uploadArtworkTask = focusedArtwork.put(artworkFileToUpload)
            artworkName = artworkFileToUpload.name
          }

          var audioMetadata = {
            customMetadata: {
              'artist': this.track.artist.value,
              'title': this.track.title.value,
              'uploadedBy': firebase.auth().currentUser.uid,
              'artworkName': artworkName
            }
          }

          this.uploadAudioTask = focusedTrack.put(audioFileToUpload, audioMetadata)

          this.uploadAudioTask.on('state_changed',
            function progress(snapshot) {
              store.commit("UPDATE_FILE_UPLOAD_PERCENTAGE", Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
            },
            function errors(err) {

            },
            function complete() {
              console.log('Upload Complete')
              self.completedUpload = true
              self.updateUserAccount(self.audioFileToUpload.name)
            }
          )
        }
      }
    },
    cancelUpload: function () {
      this.uploadAudioTask.cancel()
      this.resetForm()
    },
    resetForm: function () {
      this.fileUploading = false
      this.completedUpload = false
      this.track = {
        artist: { value: null, errorMessage: '' },
        title: { value: null, errorMessage: '' },
        artworkUrl: { value: null },
        uploadedBy: { value: null }
      }
    },
    updateUserAccount: function (fileName) {
      console.log(firebase.auth().currentUser.uid)
      let usersRef = db.collection("users").doc(firebase.auth().currentUser.uid)

      usersRef.get().then(function (doc) {
        let tracks = doc.data().tracks
        console.log('tracks: ', tracks)

        if (tracks) {
          tracks.push(fileName)
          usersRef.update({
            tracks: tracks
          })
        } else {
          usersRef.update({
            tracks: [fileName]
          })
        }

      }).catch(function (error) {
        console.error("Error getting cached document:", error);
      });
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
