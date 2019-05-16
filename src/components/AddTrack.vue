<template>
  <div class="addTrackContainer">
    <div class="content">

      <div class="singleOrCompilation" v-if="loggedInUserId">
        <div :class="[singleCompilation ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="updateSingleCompilation(true)">Single track</div>
        <div :class="[!singleCompilation ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="updateSingleCompilation(false)">Compilation</div>
      </div>

      <div class="compilationUpload" v-if="!singleCompilation">
        <compilation-form></compilation-form>
      </div>

      <div class="singleUpload" v-else>
        <div class="pageContainer" v-if="userTracksArray.length < 3">
          <single-upload-form></single-upload-form>
        </div>
        <div class="maxTracksReachedMessage" v-else>
          Maximum live track allowance reached. <br/><br/>
          Please remove one track to upload.
        </div>
      </div>

      <q-btn class="uploadBtn" v-if="!uploadingFile" v-on:click.prevent="uploadFile(audioFileToUpload, artworkFileToUpload)">Upload</q-btn>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase/app";
import { mapMutations, mapState } from "vuex"
import CompilationForm from './forms/CompilationForm'
import SingleUploadForm from './forms/SingleUploadForm'

export default {
  name: "add-track",
  components: {
    CompilationForm,
    SingleUploadForm
  },
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
      uploadAudioTask: null,
      numberOfCompilationTracks: 5
    };
  },
  computed: {
    ...mapState(['fileUploadPercentage', 'currentUserArtistName', 'fileUploading', 'loggedInUserName', 'userTracksArray', 'trackLimitReached', 'loggedInUserId', 'singleUpload']),
    uploadingFile() {
      return this.fileUploading
    },
    uploadPercentage() {
      return this.fileUploadPercentage
    },
    accountTracks() {
      return this.userTracksArray
    },
    limitReached() {
      return this.trackLimitReached
    },
    singleCompilation() {
      return this.singleUpload
    }
  },
  created() {
    this.$store.commit('GET_ACCOUNT_DETAILS')
    this.$store.commit('GET_ACCOUNT_TRACKS')
  },
  methods: {
    ...mapMutations(['UPDATE_FILE_UPLOAD_PERCENTAGE', 'GET_TRACKS', 'UPLOAD_TRACK', 'UPDATE_COMPLETED_STATE','GET_ACCOUNT_DETAILS', 'CLEAR_TRACKS_ARRAY', 'GET_ACCOUNT_TRACKS', 'UPDATE_FILE_UPLOADING_FLAG', 'UPDATE_TRACK_LIMIT_REACHED', 'UPDATE_SINGLE_DOWNLOAD']),
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
      this.$store.commit('UPDATE_COMPLETED_STATE', false)
      this.$store.commit('UPDATE_FILE_UPLOADING_FLAG', false)
      this.$store.commit('GET_TRACKS')
      this.track = {
        artist: { value: null, errors: [] },
        title: { value: null, errors: [] },
        uploadFile: { errors: [] }
      }
    },
    finishedUploading() {
      this.$store.commit('GET_TRACKS')
    },
    updateSingleCompilation(boolean) {
      this.$store.commit('UPDATE_SINGLE_DOWNLOAD', boolean)
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
  height: 100%;

  .uploadSuccessMessage {
    margin: 50px 20px;
    color: green;
    text-align: center;
  }
}
.maxTracksReachedMessage {
  margin: auto;
  width: 60%;
  height: 100%;
  text-align: center;
  padding-top: 50px;
  font-size: 30px;
}
.finishedUploadBtn {
  margin: 20px;
}
.q-list {
  border: none;
}
.singleOrCompilation {
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;

  .singleCompilationTab {
    height: 50px;
    width: 50%;
    text-align: center;
    font-size: 20px;
    line-height: 50px;
    opacity: 0.3;
  }

  .active {
    opacity: 1;
  }
}

.compilationUpload {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
}

.uploadBtn {
  margin: auto;
}
</style>
