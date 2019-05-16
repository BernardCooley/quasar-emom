<template>
  <div class="addTrackContainer">
      <div class="content">

        <div class="singleOrCompilation" v-if="loggedInUserId">
          <div :class="[singleUpload ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="singleUpload = true">Single track</div>
          <div :class="[!singleUpload ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="singleUpload = false">Compilation</div>
        </div>

        <div class="compilationUpload" v-if="!singleUpload">
          <compilation-form></compilation-form>
        </div>

        <div class="singleUpload" v-else>
          <div class="pageContainer" v-if="userTracksArray.length < 3">
                <q-list v-if="!uploadingFile && !completedUpload && singleUpload">
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

          <q-list v-else>
            <div class="" v-for="(trackField, index) in numberOfCompilationTracks" :key="index">
                {{trackField}}
              </div>
          </q-list>

          <q-item>
            <div v-if="uploadingFile && !completedUpload">{{fileUploadPercentage}}% uploaded</div>
          </q-item>
          <div class="uploadCompleteContainer" v-if="completedUpload">
            <div class="uploadSuccessMessage">Upload Complete</div>
            <q-btn v-on:click.prevent="resetForm()">Upload Another Track</q-btn>
            <q-btn class="finishedUploadBtn" v-on:click.prevent="finishedUploading()">Finished uploading</q-btn>
          </div>
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

export default {
  name: "add-track",
  components: {
    CompilationForm
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
      singleUpload: true,
      numberOfCompilationTracks: 5
    };
  },
  computed: {
    ...mapState(['fileUploadPercentage', 'currentUserArtistName', 'uploadComplete', 'fileUploading', 'loggedInUserName', 'userTracksArray', 'trackLimitReached', 'loggedInUserId']),
    uploadingFile() {
      return this.fileUploading
    },
    completedUpload() {
      return this.uploadComplete
    },
    uploadPercentage() {
      return this.fileUploadPercentage
    },
    accountTracks() {
      return this.userTracksArray
    },
    limitReached() {
      return this.trackLimitReached
    }
  },
  created() {
    this.$store.commit('GET_ACCOUNT_DETAILS')
    this.$store.commit('GET_ACCOUNT_TRACKS')
  },
  methods: {
    ...mapMutations(['UPDATE_FILE_UPLOAD_PERCENTAGE', 'GET_TRACKS', 'UPLOAD_TRACK', 'UPDATE_COMPLETED_STATE','GET_ACCOUNT_DETAILS', 'CLEAR_TRACKS_ARRAY', 'GET_ACCOUNT_TRACKS', 'UPDATE_FILE_UPLOADING_FLAG', 'UPDATE_TRACK_LIMIT_REACHED']),
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
