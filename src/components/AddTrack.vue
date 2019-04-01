<template>
  <div class="addTrackContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list v-if="!uploadingFile">
          <q-item>
            <q-field label="Artist">
              <q-input id="artist" v-model="track.artist.value"/>
              <div class="validationMessage">{{track.artist.errorMessage}}</div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Title">
              <q-input id="trackTitle" v-model="track.title.value"/>
              <div class="validationMessage">{{track.title.errorMessage}}</div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Upload Track">
              <input type="file" ref="trackUpload" multiple @change="getSelectedFile('audio')" class="input-file">
              <div class="validationMessage">{{track.uploadFile.errorMessage}}</div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Artwork Url (optional)">
              <input type="file" ref="artworkUpload" multiple @change="getSelectedFile('artwork')" class="input-file">
            </q-field>
          </q-item>
        </q-list>
        <q-item>
          <div v-if="uploadingFile && !completedUpload">{{fileUploadPercentage}}% uploaded</div>
        </q-item>

        <q-btn v-if="!uploadingFile" v-on:click.prevent="uploadFile(audioFileToUpload, artworkFileToUpload)">Upload</q-btn>

        <q-btn v-if="uploadingFile && !completedUpload" v-on:click.prevent="cancelUpload()">Cancel</q-btn>
        <div class="uploadCompleteContainer" v-if="uploadComplete">
          <div class="uploadSuccessMessage">Upload Complete</div>
          <q-btn v-on:click.prevent="resetForm()">Upload Another Track</q-btn>
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
  data() {
    return {
      track: {
        artist: { value: null, errorMessage: '' },
        title: { value: null, errorMessage: '' },
        uploadFile: { value: null, errorMessage: '' },
        artworkUrl: { value: null },
        uploadedById: { value: null },
        uploadedByArtist: { value: null }
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
    ...mapState(['fileUploadPercentage', 'currentUserArtistName']),
    uploadingFile() {
      return this.fileUploading
    },
    uploadComplete() {
      return this.completedUpload
    }
  },
  created() {
    
  },
  methods: {
    ...mapMutations(['UPDATE_FILE_UPLOAD_PERCENTAGE', 'GET_TRACKS']),
    validation() {
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

      if (!this.track.uploadFile.value) {
        this.track.uploadFile.errorMessage = 'File is required.'
      } else {
        this.track.uploadFile.errorMessage = ''
      }

      for (var x in this.track) {
        if (this.track[x].errorMessage.length > 0) {
          return true
        } else {
          return false
        }
      }
    },
    getSelectedFile(fileType) {
      if (fileType === 'audio') {
        this.audioFileToUpload = this.$refs.trackUpload.files[0]
      } else if (fileType === 'artwork') {
        this.artworkFileToUpload = this.$refs.artworkUpload.files[0]
      }
    },
    doesFileExist(fileType, fileName) {
      let ref = null
      if (fileType === 'audio') {
        ref = 'tracks/' + fileName
      } else if (fileType === 'artwork') {
        ref = 'artwork/' + fileName
      }

      firebase.storage().ref().child('tracks/6LACK_-_Cutting_Ties.mp3').getDownloadURL().then(function () {
        return true
      }).catch(function () {
        return false
      })
    },
    uploadFile(audioFileToUpload, artworkFileToUpload) {
      let self = this
      this.audioFileToUpload = audioFileToUpload
      this.artworkFileToUpload = artworkFileToUpload
      let store = this.$store

      if (!this.validation()) {
        self.completedUpload = false
        self.fileUploading = true
        let storageRef = firebase.storage().ref()
        let focusedTrack = storageRef.child('tracks').child(audioFileToUpload.name)
        let artworkName = ''

        db.collection('tracks').get().then(tracks => {
          tracks.docs.map(track => {
            if(track.id == audioFileToUpload.name) {
              return
            }
            
            let storageRef = firebase.storage().ref()
            let focusedTrack = storageRef.child('tracks').child(audioFileToUpload.name)
            
            if (artworkFileToUpload) {
              let focusedArtwork = storageRef.child('artwork').child(artworkFileToUpload.name)

              var artworkMetadata = {
                customMetadata: {
                  'uploadedById': firebase.auth().currentUser.uid
                }
              }
              focusedArtwork.put(artworkFileToUpload, artworkMetadata)
              artworkName = artworkFileToUpload.name
            } else {
              artworkName = 'default.png'
            }

            var audioMetadata = {
              customMetadata: {
                'artist': this.track.artist.value,
                'title': this.track.title.value,
                'uploadedById': firebase.auth().currentUser.uid,
                'artworkName': artworkName,
                'uploadedByName': this.currentUserArtistName
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
                self.completedUpload = true
                db.collection('tracks').doc(self.audioFileToUpload.name).set({uploadedBy: firebase.auth().currentUser.uid})
              }
            )
          })
        })
      }
    },
    cancelUpload() {
      this.deleteFile(storageRef.child('artwork/' + artworkFileToUpload.name))
      this.uploadAudioTask.cancel()
      this.resetForm()
    },
    deleteFile(fileReference) {
      if (fileReference) {
        fileReference.delete().then(function () {
          console.log('file deleted successfully ')
        }).catch(function (error) {
          console.error('error while deleting file')
        })
      } else {
        console.log('File does not exist')
      }
    },
    resetForm() {
      this.fileUploading = false
      this.completedUpload = false
      this.track = {
        artist: { value: null, errorMessage: '' },
        title: { value: null, errorMessage: '' },
        uploadFile: { value: null, errorMessage: '' },
        artworkUrl: { value: null },
        uploadedById: { value: null },
        uploadedByArtist: { value: null }
      }
    },
  }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.validationMessage {
  color: red;
  text-align: left;
}

.native-input:active, .native-input:focus {
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

.input-file {
  width: 110px;
  height: 25px;
  opacity: 1;
  overflow: hidden;
  background-color: gray;
}
</style>
