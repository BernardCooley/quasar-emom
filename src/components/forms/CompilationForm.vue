<template>
    <div class="compilationFormContainer">

        <div class="compilationField">
            <q-field label="Compilation title">
                <q-input class="" v-model="compDetails[0].title.value" type="text" value="" multiple v-on:keyup="isFormValid"/>
                <div class="validationMessage" v-for="(compTitleValidationMessage, index) in compDetails[0].title.errors" :key="index">
                    {{compTitleValidationMessage}}
                </div>
            </q-field>
            <q-field label="Release date">
                <q-datetime-picker color="#11363a" v-model="compDetails[0].releaseDate.value" type="date" minimal :min="currentDate" dark @input="isFormValid"/>
                <div class="validationMessage" v-for="(releaseDateValidationMessage, index) in compDetails[0].releaseDate.errors" :key="index">
                    {{releaseDateValidationMessage}}
                </div>
            </q-field>
            <q-field >
                <div class="artworkUploadContainer">
                    <input class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event, 'artwork'); isFormValid()"/>
                    <div class="validationMessage" v-for="(artworkFileValidationMessage, index) in compDetails[0].artworkFile.errors" :key="index">
                        {{artworkFileValidationMessage}}
                    </div>
                    <img class="artworkPreview" v-if="artworkUrl" :src="artworkUrl" alt="artwork preview">
                </div>
            </q-field>
        </div>

        <div class="compilationFieldContainer" v-for="(track, index) in compTracks" v-bind:key="index">
            <div class="compilationField">
                Track No. {{track.trackNumber.value}}
                <q-field label="Artist">
                    <q-input class="" v-model="track.artist.value" type="text" value="" multiple v-on:keyup="isFormValid"/>
                    <div class="validationMessage" v-for="(artistValidationMessage, index) in track.artist.errors" :key="index">
                        {{artistValidationMessage}}
                    </div>
                </q-field>
                <q-field label="Title">
                    <q-input class="" v-model="track.title.value" type="text" value="" multiple v-on:keyup="isFormValid"/>
                    <div class="validationMessage" v-for="(trackTitleValidationMessage, index) in track.title.errors" :key="index">
                        {{trackTitleValidationMessage}}
                    </div>
                </q-field>
                <q-field>
                    <input class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event, 'audio', track.trackNumber.value); isFormValid()"/>
                    <div class="validationMessage" v-for="(audioFileValidationMessage, index) in track.audioFile.errors" :key="index">
                        {{audioFileValidationMessage}}
                    </div>
                </q-field>
            </div>
            <div class="trackActionsContainer">
                <i class="closeButton fas fa-times" v-on:click="removeTrack(index)"></i>
                <div class="upDownContainer">
                    <i class="moveTrack fas fa-sort-up" v-on:click="moveTrack('up', track.trackNumber)"></i>
                    <i class="moveTrack fas fa-sort-down" v-on:click="moveTrack('down', track.trackNumber)"></i>
                </div>
            </div>
        </div>
        <i class="addCompilationTrack fas fa-plus" v-on:click="addTrack()"></i>

        <q-btn class="uploadBtn" v-if="!uploadingFile" v-on:click.prevent="uploadFile()">Upload</q-btn>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import _ from 'lodash'

export default {
    data() {
        return {
            audioFilesToUpload: [],
            artworkFileToUpload: null,
            artworkUrl: null
        }
    },
    computed: {
        ...mapState(['compilationData', 'fileUploading']),
        compTracks() {
            return _.sortBy(this.compilationData.trackDetails, 'trackNumber', 'asc')
        },
        compDetails() {
            return this.compilationData.compilationDetails
        },
        uploadingFile() {
            return this.fileUploading
        },
        currentDate() {
            let currentDate = new Date()

            let yyyy = currentDate.getFullYear()
            let mm = currentDate.getMonth()+1
            let dd = currentDate.getDate()

            currentDate = `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`
            return currentDate
        }
    },
    methods: {
        ...mapMutations(['ADD_COMPILATION_TRACK', 'REMOVE_COMPILATION_TRACK', 'UPDATE_COMPILATION_TRACKS', 'UPLOAD_COMPILATION']),
        isFormValid() {
            let allFieldsValid = true

            String.prototype.capitalize = function() {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }

            Object.keys(this.compilationData).forEach(compilationDataKey => {
                this.compilationData[compilationDataKey].forEach(detail => {
                    Object.keys(detail).forEach(detailKey => {
                        detail[detailKey].errors = []

                        let transformedKey = detailKey.capitalize().match(/[A-Z][a-z]+|[0-9]+/g)

                        transformedKey[1] = transformedKey[1] ? transformedKey[1].toLowerCase() : null

                        if(!detail[detailKey].value) {
                            detail[detailKey].errors.push(`${transformedKey.join(' ')} is required`)
                            allFieldsValid = false
                        }else {
                            if(detailKey == 'audioFile') {
                                if(detail[detailKey].value.name.substr(detail[detailKey].value.name.length - 4) != '.mp3') {
                                    detail[detailKey].errors.push('mp3 files only')
                                    allFieldsValid = false
                                }
                            }
                            if(detailKey == 'artworkFile') {
                                if(detail[detailKey].value.name.substr(detail[detailKey].value.name.length - 4) != '.jpg' && detail[detailKey].value.name.substr(detail[detailKey].value.name.length - 4) != '.png') {
                                    detail[detailKey].errors.push('jpg or png files only')
                                    allFieldsValid = false
                                }
                            }
                        }
                    })
                })
            })

            return allFieldsValid
        },
        addTrack() {
            this.$store.commit('ADD_COMPILATION_TRACK')
        },
        removeTrack(trackIndex) {
            this.$store.commit('REMOVE_COMPILATION_TRACK', _.sortBy(this.compilationData.trackDetails.filter(track => track != this.compilationData.trackDetails[trackIndex], 'trackNumber', 'asc')))
        },
        moveTrack(upDown, trackNum) {
            let tracks = this.compilationData.trackDetails
            if(upDown == 'down') {
                if(trackNum < tracks.length) {
                    tracks[trackNum-1].trackNumber = tracks[trackNum-1].trackNumber + 1
                    tracks[trackNum].trackNumber = tracks[trackNum].trackNumber - 1
                }
            }else {
                if(trackNum > 1) {
                    tracks[trackNum-1].trackNumber = tracks[trackNum-1].trackNumber - 1
                    tracks[trackNum-2].trackNumber = tracks[trackNum-2].trackNumber + 1
                }
            }
            this.$store.commit('UPDATE_COMPILATION_TRACKS', _.sortBy(tracks, 'trackNumber', 'asc'))
        },
        getSelectedFile(e, fileType, trackNumber) {
            var files = e.target.files || e.dataTransfer.files;
            if (fileType === 'audio') {
                this.compilationData.trackDetails[trackNumber - 1].audioFile.value = files[0]
            } else if (fileType === 'artwork') {
                this.compilationData.compilationDetails[0].artworkFile.value = files[0]
                this.artworkUrl = URL.createObjectURL(this.compilationData.compilationDetails[0].artworkFile.value);
            }
        },
        uploadFile() {
            if(this.isFormValid()) {
                this.$store.commit('UPLOAD_COMPILATION', this.compilationData)
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.compilationFieldContainer {
    display: flex;
    align-items: center;
    height: 195px;
    margin: 50px 0;
}

i {
    opacity: 0.8;
}

.trackActionsContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    width: 50px;
}

.upDownContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.moveTrack {
    font-size: 30px;
}

.closeButton {
    font-size: 20px;
}

.compilationField {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    padding: 10px 20px;
    margin: 25px 0;
}

.addCompilationTrack {
    font-size: 30px;
    text-align: center;
    position: fixed;
    right: 10px;
    bottom: 63px;
    background-color: rgba(27, 131, 132, 0.4);
    padding: 10px;
    border-radius: 25px;
}

.releaseDatePicker {
    display: flex;
    justify-content: center;
}

.artworkUploadContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.artworkPreview {
    width: 100%;
}
</style>
