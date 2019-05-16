<template>
    <div class="compilationFormContainer">
        <div class="compilationFieldContainer" v-for="(track, index) in compTracks" v-bind:key="index">
            <div class="compilationField">
                Track No. {{track.trackNumber}}
                <q-field label="Artist">
                    <q-input class="" v-model="track.artist" type="text" value="" multiple/>
                </q-field>
                <q-field label="Title">
                    <q-input class="" v-model="track.title" type="text" value="" multiple/>
                </q-field>
                <q-field>
                    <q-input class="" v-model="track.index" type="file" value="" multiple @change="getSelectedFile('audio')"/>
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
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import _ from 'lodash'

export default {
    computed: {
        ...mapState(['compilationTracks']),
        compTracks() {
            return _.sortBy(this.compilationTracks, 'trackNumber', 'asc')
        }
    },
    methods: {
        ...mapMutations(['ADD_COMPILATION_TRACK', 'REMOVE_COMPILATION_TRACK', 'UPDATE_COMPILATION_TRACKS']),
        addTrack() {
            this.$store.commit('ADD_COMPILATION_TRACK')
        },
        removeTrack(trackIndex) {
            this.$store.commit('REMOVE_COMPILATION_TRACK', _.sortBy(this.compilationTracks.filter(track => track != this.compilationTracks[trackIndex], 'trackNumber', 'asc')))
        },
        moveTrack(upDown, trackNum) {
            let tracks = this.compilationTracks
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
        }
    },
}
</script>

<style lang="scss" scoped>
.compilationFieldContainer {
    display: flex;
    align-items: center;
    border-bottom: 1px solid white;
    height: 195px;
}

i {
    opacity: 0.8;
}

.trackActionsContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
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
    padding: 10px 5px 10px 20px;
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
</style>
