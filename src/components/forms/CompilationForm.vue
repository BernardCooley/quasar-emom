<template>
    <div class="compilationFormContainer">
        <div class="compilationFieldContainer" v-for="(track, index) in compTracks" v-bind:key="index">
            <div class="compilationField">
                <q-field label="Artist">
                    <q-input class="" v-model="track.index" type="text" value="" multiple/>
                </q-field>
                <q-field label="Title">
                    <q-input class="" v-model="track.index" type="text" value="" multiple/>
                </q-field>
                <q-field>
                    <q-input class="" v-model="track.index" type="file" value="" multiple @change="getSelectedFile('audio')"/>
                </q-field>
            </div>
            <i class="fas fa-times" v-on:click="removeTrack($event)"></i>
        </div>
        <div class="addCompilationTrack" v-on:click="addTrack()">Add track</div>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
    computed: {
        ...mapState(['compilationTrackAmount', 'compilationTracks']),
        trackAmount() {
            return this.compilationTrackAmount
        },
        compTracks() {
            return this.compilationTracks
        }
    },
    methods: {
        ...mapMutations(['UPDATE_COMPILATION_TRACK_AMOUNT']),
        addTrack() {
            this.$store.commit('UPDATE_COMPILATION_TRACK_AMOUNT', 'add')
        },
        removeTrack(e) {
            console.log(e.target)
        }
    }
}
</script>

<style lang="scss" scoped>
.compilationFieldContainer {
    display: flex;

    .compilationField {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 10px 20px;

        i {
            margin-left: 20px;
            font-size: 30px;
        }
    }
}

.addCompilationTrack {
  font-size: 30px;
  text-align: center;
}
</style>
