<template>
    <div class="singleUploadFormContainer">
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
</template>

<script>
import { mapMutations, mapState } from "vuex"

export default {
    computed: {
        ...mapState(['fileUploading', 'uploadComplete']),
        uploadingFile() {
            return this.fileUploading
        },
        completedUpload() {
            return this.uploadComplete
        }   
    }
}
</script>

<style lang="scss" scoped>

</style>
