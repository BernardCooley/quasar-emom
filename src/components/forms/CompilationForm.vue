<template>
    <div class="compilationFormContainer">
        <track-input-modal v-model="modalIsOpen"></track-input-modal>
        <div class="compilationContainer" v-if="!compilationFinished">
            <q-field v-if="isUserAdminComp">
                <q-toggle v-model="isCompilation"></q-toggle>
                Is this upload a compilation?
            </q-field>
            <div class="compilationField" v-if="isCompilation">
                <q-field label="Compilation title">
                    <q-input class="" v-model="compDetails[0].title.value" type="text" value="" multiple/>
                    <div class="validationMessage" v-for="(compTitleValidationMessage, index) in compDetails[0].title.errors" :key="index">
                        {{compTitleValidationMessage}}
                    </div>
                </q-field>
                <q-field>
                    <q-field>
                        <q-toggle v-model="futureReleaseDate"></q-toggle>
                        Future release date
                    </q-field>
                    <q-datetime v-if="futureReleaseDate" v-model="compDetails[0].releaseDate.value" type="date" dark/>
                    <div class="validationMessage" v-for="(releaseDateValidationMessage, index) in compDetails[0].releaseDate.errors" :key="index">
                        {{releaseDateValidationMessage}}
                    </div>
                </q-field>
                <q-field  label="Compilation artwork upload">
                    <div class="artworkUploadContainer">
                        <input class="" type="file" value="" multiple="multiple" @change="getSelectedFile($event, 'artwork')"/>
                        <div class="validationMessage" v-for="(artworkFileValidationMessage, index) in compDetails[0].artworkFile.errors" :key="index">
                            {{artworkFileValidationMessage}}
                        </div>
                        <img class="artworkPreview" v-if="artworkUrl" :src="artworkUrl" alt="artwork preview">
                    </div>
                </q-field>
            </div>

            <div class="compilationFieldContainer" v-for="(track, index) in compTracks" v-bind:key="index">
                <div class="progressBar" :style="{ width: track.uploadPercentage.value + '%' }"></div>
                <div class="uploadProgressContainer">
                    <div class="trackInfoContainer">
                        <div class="artist">{{track.artist.value}}</div>
                        <div class="title">{{track.title.value}}</div>
                    </div>
                    <div v-if="track.uploadPercentage.value > 0" class="percentage">
                        <span v-if="track.uploadPercentage.value > 0 && track.uploadPercentage.value < 100">{{track.uploadPercentage.value}}%</span>
                        <i v-if="track.uploadPercentage.value == 100" class="closeButton fas fa-check-circle"></i>
                    </div>
                </div>
            </div>
            <i class="addCompilationTrack fas fa-plus" v-on:click="openModal()"></i>

            <q-btn v-if="compilationData.trackDetails.length > 1" class="uploadBtn" v-on:click.prevent="uploadCompilation()">Upload</q-btn>
        </div>
        <div class="uploadCompleteComntainer" v-else>
            <div class="uploadCompleteMessage">Upload complete</div>
            <q-btn v-on:click.prevent="setCompilationUploaded">Upload another compilation</q-btn>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import _ from 'lodash'
import TrackInputModal from '.././TrackInputModal'

export default {
    components: {
        TrackInputModal
    },
    data() {
        return {
            audioFilesToUpload: [],
            artworkFileToUpload: null,
            artworkUrl: null,
            futureReleaseDate: false,
            isCompilation: false
        }
    },
    computed: {
        ...mapState(['compilationData', 'multiFileUploadPercentage', 'trackInputModalOpen', 'compilationUploaded', 'isUserAdmin']),
        modalIsOpen() {
            return this.trackInputModalOpen
        },
        compTracks() {
            return _.sortBy(this.compilationData.trackDetails, 'trackNumber.value', 'asc')
        },
        compDetails() {
            return this.compilationData.compilationDetails
        },
        currentDate() {
            let currentDate = new Date()

            let yyyy = currentDate.getFullYear()
            let mm = currentDate.getMonth()+1
            let dd = currentDate.getDate()

            currentDate = `${yyyy}-${mm < 10 ? '0' + mm : mm}-${dd < 10 ? '0' + dd : dd}`
            return currentDate
        },
        compilationFinished() {
            return this.compilationUploaded
        },
        isUserAdminComp() {
            return this.isUserAdmin
        }
    },
    watch: {
        isCompilation: function(val) {
            this.$store.commit('TOGGLE_IS_COMPILATION', val)
        }
    },
    methods: {
        ...mapMutations(['ADD_COMPILATION_TRACK', 'REMOVE_COMPILATION_TRACK', 'UPDATE_COMPILATION_TRACKS', 'UPLOAD_COMPILATION', 'UPLOAD_COMPILATION_DETAILS','OPEN_CLOSE_TRACK_INPUT_MODAL', 'SET_RELEASE_DATE_TO_TODAY', 'SET_COMPILATION_UPLOADED', 'TOGGLE_IS_COMPILATION']),
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

                        if(detailKey != 'uploadPercentage') {
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
            this.$store.commit('REMOVE_COMPILATION_TRACK', _.sortBy(this.compilationData.trackDetails.filter(track => track != this.compilationData.trackDetails[trackIndex], 'trackNumber.value', 'asc')))
        },
        moveTrack(upDown, trackNum) {
            let tracks = this.compilationData.trackDetails
            if(upDown == 'down') {
                if(trackNum < tracks.length) {
                    tracks[trackNum-1].trackNumber.value = tracks[trackNum-1].trackNumber.value + 1
                    tracks[trackNum].trackNumber.value = tracks[trackNum].trackNumber.value - 1
                }
            }else {
                if(trackNum > 1) {
                    tracks[trackNum-1].trackNumber.value = tracks[trackNum-1].trackNumber.value - 1
                    tracks[trackNum-2].trackNumber.value = tracks[trackNum-2].trackNumber.value + 1
                }
            }
            this.$store.commit('UPDATE_COMPILATION_TRACKS', _.sortBy(tracks, 'trackNumber.value', 'asc'))
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
        uploadCompilation() {
            if (!this.futureReleaseDate) {
                this.$store.commit('SET_RELEASE_DATE_TO_TODAY')
            }
            if(this.isFormValid()) {
                this.$store.commit('UPLOAD_COMPILATION_DETAILS')

                this.compilationData.trackDetails.forEach(track => {
                    this.$store.commit('UPLOAD_TRACK', track)
                })
            }
        },
        openModal() {
            this.$store.commit('OPEN_CLOSE_TRACK_INPUT_MODAL', true)
        },
        setCompilationUploaded() {
            this.$store.commit('RESET_COMPILATION_DATA')
            this.$store.commit('SET_COMPILATION_UPLOADED', false)
        }
    },
}
</script>

<style lang="scss" scoped>
.compilationFieldContainer {
    display: flex;
    align-items: center;
    margin: 10px 0;
    background-image: linear-gradient(#009e98, #256f77);
    position: relative;
    height: 75px;

    .progressBar {
        height: 100%;
        background-color: white;
        opacity: 0.3;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
    }
}

.largeUploadContainer {
    height: auto;
}

.smallUploadContainer {
    height: auto;
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid lightgray;
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

.artworkUploadContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.artworkPreview {
    width: 100%;
}

.uploadProgressContainer {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 15px;

    .trackInfoContainer {
        .artist {
            font-size: 30px;
        }

        .title {
            font-size: 20px;
        }
    }

    .percentage {
        font-size: 20px;
    }
}

.q-datetime {
    width: 100%;
}

.q-field {
    margin-bottom: 15px;
}

.uploadCompleteComntainer {
    display: flex;
    flex-direction: column;
    height: 400px;
    justify-content: space-around;

    .uploadCompleteMessage {
        text-align: center;
        font-size: 30px;
        color: green;    
    }

}
</style>
