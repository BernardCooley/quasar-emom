<template>
  <div class="addTrackContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list v-if="!uploadingFile">
          <q-item>
            <q-field label="Title">
              <q-input id="trackTitle" value='' v-model="track.title.value"/>
              <div class="validationMessage" v-for="(titleValidationMessage, index) in track.title.errors" :key="index">
                {{titleValidationMessage}}
              </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Upload Track">
              <input type="file" ref="trackUpload" multiple @change="getSelectedFile('audio')" class="input-file"/>
              <div class="validationMessage" v-for="(uploadFileValidationMessage, index) in track.uploadFile.errors" :key="index">
                {{uploadFileValidationMessage}}
              </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field label="Artwork Url (optional)">
              <input type="file" ref="artworkUpload" multiple @change="getSelectedFile('artwork')" class="input-file"/>
            </q-field>
          </q-item>
        </q-list>
        <q-item>
          <div v-if="uploadingFile && !completedUpload">{{fileUploadPercentage}}% uploaded</div>
        </q-item>

        <q-btn v-if="!uploadingFile" v-on:click.prevent="uploadFile(audioFileToUpload, artworkFileToUpload)">Upload</q-btn>

        <q-btn v-if="uploadingFile && !completedUpload" v-on:click.prevent="cancelUpload()">Cancel</q-btn>
        <div class="uploadCompleteContainer" v-if="completedUpload">
          <div class="uploadSuccessMessage">Upload Complete</div>
          <q-btn v-on:click.prevent="resetForm()">Upload Another Track</q-btn>
          <q-btn v-on:click.prevent="finishedUploading()">Finished uploading</q-btn>
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
        artist: {
          value: null,
          errors: []
        },
        title: {
          value: null, 
          errors: []
        },
        uploadFile: {
          errors: []
        },
      },
      errorsBool: null,
      artworkUrl: { value: null },
      uploadedById: { value: null },
      uploadedByArtist: { value: null },
      userID: null,
      addTrackMessage: null,
      trackUpload: null,
      audioFileToUpload: null,
      artworkFileToUpload: null,
      uploadAudioTask: null
    };
  },
  computed: {
    ...mapState(['fileUploadPercentage', 'currentUserArtistName', 'uploadComplete', 'fileUploading', 'loggedInUserName']),
    uploadingFile() {
      return this.fileUploading
    },
    completedUpload() {
      return this.uploadComplete
    },
    uploadPercentage() {
      return this.fileUploadPercentage
    }
  },
  created() {
    this.$store.commit('GET_ACCOUNT_DETAILS')
  },
  methods: {
    ...mapMutations(['UPDATE_FILE_UPLOAD_PERCENTAGE', 'GET_TRACKS', 'UPLOAD_TRACK', 'UPDATE_COMPLETED_STATE','GET_ACCOUNT_DETAILS', 'CLEAR_TRACKS_ARRAY']),
    validation() {
      this.errorsBool = false
      this.track.title.errors = []
      this.track.uploadFile.errors = []

      if (!this.track.title.value) {
        this.track.title.errors.push('Title is required.')
      }
      if (!this.audioFileToUpload) {
        this.track.uploadFile.errors.push('MP3 file is required.')
      }

      for (var x in this.track) {
        if (this.track[x].errors.length > 0) {
          this.errorsBool = true
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
      this.validation()
      if(!this.errorsBool) {
        let files = []
        this.track.artist.value = this.loggedInUserName

        if(audioFileToUpload.name.substr(audioFileToUpload.name.length - 4) == '.mp3') {
          files.push(audioFileToUpload)
          files.push(artworkFileToUpload)
          files.push(this.track)
          this.$store.commit('UPLOAD_TRACK', files, true)
        }else {
          alert('.mp3 file format only')
        }
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
        console.error('File does not exist')
      }
    },
    resetForm() {
      this.fileUploading = false
      this.$store.commit('UPDATE_COMPLETED_STATE', false)
      this.track = {
        title: { value: null, errors: [] },
        uploadFile: { errors: [] },
        artworkUrl: { value: null },
        uploadedById: { value: null },
        uploadedByArtist: { value: null }
      }
    },
    finishedUploading() {
      this.$store.commit('GET_TRACKS')
    }
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
</style>
