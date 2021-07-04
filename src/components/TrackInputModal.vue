<template>
  <div class="trackInputModalContainer">
    <q-modal :content-css="{width: '95%', height: 'auto', background: '#dbdada'}" class="trackInputModal" transition v-model="modalOpen">
      <div class="modalContent">
        <q-list>
            <q-field class="formField" v-if="isCompilation" label="Artist">
                <q-input class="" v-model="track.artist.value" type="text" value="" multiple/>
                <div class="validationMessage" v-for="(artistValidationMessage, index) in track.artist.errors" :key="index">
                    {{artistValidationMessage}}
                </div>
            </q-field>
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
            <q-field class="formField artworkField" v-if="!isCompilation" label="Artwork file (jpg/png only)">
                <input ref="artworkUpload" class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
                <img class="artworkPreview" v-if="artworkUrl" :src="artworkUrl" alt="artwork preview">
                <div class="validationMessage" v-for="(artworkFileValidationMessage, index) in track.artworkFile.errors" :key="index">
                    {{artworkFileValidationMessage}}
                </div>
            </q-field>
        </q-list>
        <div class="trackInputModalActions">
            <q-btn class="addTrackBtn" v-on:click.prevent="addTrack()">Add track</q-btn>
            <q-btn class="addTrackBtn" v-on:click.prevent="closeModal()">Cancel</q-btn>
        </div>
      </div>
    </q-modal>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"

export default {
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
                audioFile: {
                    value: null,
                    errors: []
                },
                artworkFile: {
                    value: null,
                    errors: []
                },
                trackNumber: {
                    value: 1,
                    errors: []
                },
                uploadPercentage: {
                    value: 0,
                    errors: []
                }
            },
            artworkUrl: null
        }
    },
    computed: {
        ...mapState(['trackInputModalOpen', 'isUploadACompilation']),
        modalOpen() {
            return this.trackInputModalOpen
        },
        isCompilation() {
            return this.isUploadACompilation
        }
    },
    methods: {
        ...mapMutations(['OPEN_CLOSE_TRACK_INPUT_MODAL', 'ADD_TRACK_TO_COMPILATION']),
        closeModal() {
            this.$store.commit('OPEN_CLOSE_TRACK_INPUT_MODAL', false)
            this.resetTrackDetails()
        },
        addTrack() {
            console.log(this.isFormValid())
            if(this.isFormValid()) {
                this.$store.commit('OPEN_CLOSE_TRACK_INPUT_MODAL', false)
                this.$store.commit('ADD_TRACK_TO_COMPILATION', this.track)
                this.resetTrackDetails()
            }
        },
        getSelectedFile(e) {
            var files = e.target.files || e.dataTransfer.files;

            if(files[0].name.includes('.mp3')) {
                this.track.audioFile.value = files[0]
            }else {
                this.track.artworkFile.value = files[0]
                this.artworkUrl = URL.createObjectURL(this.track.artworkFile.value);
            }
        },
        isFormValid() {
            let allFieldsValid = true

            String.prototype.capitalize = function() {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }

            Object.keys(this.track).forEach(key => {
                this.track[key].errors = []

                let transformedKey = key.capitalize().match(/[A-Z][a-z]+|[0-9]+/g)
                transformedKey[1] = transformedKey[1] ? transformedKey[1].toLowerCase() : null

                

                if(!this.isUploadACompilation) {
                    console.log(key)
                }

                if(key != 'uploadPercentage') {
                    if(!this.track[key].value) {
                        this.track[key].errors.push(`${transformedKey.join(' ')} is required`)
                        allFieldsValid = false
                    }else {
                        if(key == 'audioFile') {
                            if(this.track[key].value.name.substr(this.track[key].value.name.length - 4) != '.mp3') {
                                this.track[key].errors.push('mp3 files only')
                                allFieldsValid = false
                            }
                        }
                        if(key == 'artworkFile') {
                            if(this.track[key].value.name.substr(this.track[key].value.name.length - 4).toLowerCase() != '.jpg' && this.track[key].value.name.substr(this.track[key].value.name.length - 4).toLowerCase() != '.png') {
                                this.track[key].errors.push('jpg or png files only')
                                allFieldsValid = false
                            }
                        }
                    }
                }
            })
            return allFieldsValid
        },
        resetTrackDetails() {
            this.track.artist.value = null
            this.track.artist.errors = []

            this.track.title.value = null
            this.track.title.errors = []

            this.track.audioFile.value = null
            this.track.audioFile.errors = []

            this.track.artworkFile.value = null
            this.track.artworkFile.errors = []

            this.track.trackNumber.value = null
            this.track.trackNumber.errors = []

            this.track.uploadPercentage.value = null
            this.track.uploadPercentage.errors = []

            this.artworkUrl = null

            const artworkInput = this.$refs.artworkUpload;
            artworkInput.type = 'text';
            artworkInput.type = 'file';

            const audiokInput = this.$refs.audioUpload;
            audiokInput.type = 'text';
            audiokInput.type = 'file';
        }
    }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.trackInputModal {
  background-color: $light-gray;
}
.closeModal {
  position: relative;
  font-size: 25px;
  padding: 5px;
  float: right;
}

.formField {
    margin: 20px 0;
}

.artworkPreview {
    width: 100%;
}

.artworkField > div > div.q-field-content > img.artworkPreview {
    display: flex;
    flex-direction: column;
}

.trackInputModalActions {
    display: flex;
    justify-content: space-between;
}
</style>
