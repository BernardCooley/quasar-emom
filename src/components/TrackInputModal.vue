<template>
  <div class="trackInputModalContainer">
    <q-modal :content-css="{width: '95%', height: '70%', background: '#11363a'}" class="trackInputModal" transition v-model="modalOpen">
      <div class="modalContent">
        <q-list>
            <q-field label="Artist">
                <q-input class="" v-model="track.artist.value" type="text" value="" multiple/>
                <div class="validationMessage" v-for="(artistValidationMessage, index) in track.artist.errors" :key="index">
                    {{artistValidationMessage}}
                </div>
            </q-field>
            <q-field label="Title">
                <q-input class="" v-model="track.title.value" type="text" value="" multiple/>
                <div class="validationMessage" v-for="(trackTitleValidationMessage, index) in track.title.errors" :key="index">
                    {{trackTitleValidationMessage}}
                </div>
            </q-field>
            <q-field>
                <input class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event)"/>
                <div class="validationMessage" v-for="(audioFileValidationMessage, index) in track.audioFile.errors" :key="index">
                    {{audioFileValidationMessage}}
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
                trackNumber: {
                    value: 1,
                    errors: []
                },
                uploadPercentage: {
                    value: 0,
                    errors: []
                }
            }
        }
    },
    computed: {
        ...mapState(['trackInputModalOpen']),
        modalOpen() {
            return this.trackInputModalOpen
        }
    },
    methods: {
        ...mapMutations(['OPEN_CLOSE_TRACK_INPUT_MODAL', 'ADD_TRACK_TO_COMPILATION']),
        closeModal() {
            this.$store.commit('OPEN_CLOSE_TRACK_INPUT_MODAL', false)
        },
        addTrack() {
            if(this.isFormValid()) {
                this.$store.commit('OPEN_CLOSE_TRACK_INPUT_MODAL', false)
                this.$store.commit('ADD_TRACK_TO_COMPILATION', this.track)
            }
        },
        getSelectedFile(e) {
            var files = e.target.files || e.dataTransfer.files;
            this.track.audioFile.value = files[0]
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
                            if(this.track[key].value.name.substr(this.track[key].value.name.length - 4) != '.jpg' && this.track[key].value.name.substr(this.track[key].value.name.length - 4) != '.png') {
                                this.track[key].errors.push('jpg or png files only')
                                allFieldsValid = false
                            }
                        }
                    }
                }
            })
            return allFieldsValid
        }
    }
};
</script>

<style lang="scss" scoped>
.trackInputModal {
  background-color: rgba(37, 111, 119, 0.9);
}
.closeModal {
  position: relative;
  font-size: 25px;
  padding: 5px;
  float: right;
}
.modalContent {
    padding: 40px 30px;
    color: white;
    position: relative;
    height: 100%;

    .trackInputModalActions {
        position: absolute;
        bottom: 20px;
        left: 10px;
    }
}
</style>
