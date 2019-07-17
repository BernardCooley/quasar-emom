<template>
  <div class="uploadFormContainer">
    <q-list>
        <q-field class="formField" label="Title">
            <q-input class="" v-model.trim="$v.track.title.$model"/>
            <div class="validationMessage" v-if="!$v.track.title.required">Title is required</div>
        </q-field>

        <q-field class="formField" label="Audio file (mp3 only)">
            <input ref="audioUpload" class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
            <div class="validationMessage" v-if="!$v.track.title.required">Title is required</div>
        </q-field>

        <q-field class="formField" label="Artwork file (jpg/png only)">
            <input ref="artworkUpload" class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
            <div class="validationMessage" v-if="!$v.track.title.required">Title is required</div>
        </q-field>
    </q-list>

    <!-- <q-list>
            <q-field class="formField" label="Title">
                <q-input class="" v-model="track.title.value" type="text" value="" multiple/>
                <div class="validationMessage" v-for="(trackTitleValidationMessage, index) in track.title.errors" :key="index">
                    {{trackTitleValidationMessage}}
                </div>
            </q-field>
            <q-field class="formField" label="Audio file (mp3 only)">
                <input ref="audioUpload" class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
                <div class="validationMessage" v-for="(audioFileValidationMessage, index) in track.audioFile.errors" :key="index">
                    {{audioFileValidationMessage}}
                </div>
            </q-field>
            <q-field class="formField artworkField" label="Artwork file (jpg/png only)">
                <input ref="artworkUpload" class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
                <img class="artworkPreview" v-if="artworkUrl" :src="artworkUrl" alt="artwork preview">
                <div class="validationMessage" v-for="(artworkFileValidationMessage, index) in track.artworkFile.errors" :key="index">
                    {{artworkFileValidationMessage}}
                </div>
            </q-field>
        </q-list>
        <div class="trackInputModalActions">
            <q-btn class="addTrackBtn" disabled="formValid" v-on:click.prevent="addTrack()">Add track</q-btn>
    </div>-->
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import Vuelidate from "vuelidate";
import { required, minLength, between } from "vuelidate/lib/validators";

export default {
  mixins: [validationMixin],
  data() {
    return this.initialDataState();
  },
  validations: {
    track: {
        title: {
            required
        },
        audioFile: {
            required
        },
        artworkFile: {
            required
        }
    },
  },
  methods: {
    addTrack() {
      this.$store.commit("UPLOAD_TRACK", this.track);
      this.resetComponentData();
    },
    getSelectedFile(e) {
      var files = e.target.files || e.dataTransfer.files;

      if (files[0].name.includes(".mp3")) {
        this.track.audioFile.value = files[0];
      } else {
        this.track.artworkFile.value = files[0];
        this.artworkUrl = URL.createObjectURL(this.track.artworkFile.value);
      }
    },
    resetComponentData() {
      Object.assign(this.$data, this.initialDataState());
    },
    initialDataState() {
      return {
        track: {
          title: null,
          audioFile: null,
          artworkFile: null,
          trackNumber: 1,
          uploadPercentage: 0
        },
        artworkUrl: null,
        formValid: false,
        name: "",
        age: 0
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.uploadFormContainer {
  margin: 20px;

  .formField {
    margin: 40px 0;
  }
}
</style>
