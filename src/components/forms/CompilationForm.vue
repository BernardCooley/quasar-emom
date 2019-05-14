<template>
    <div class="compilationFormContainer">
        <div v-for="(track, index) in trackAmount" v-bind:key="index" class="row">
            <div class="compilationField">
                <q-field label="">
                    <q-input v-model="track.index" type="file" value="" multiple @change="getSelectedFile('audio')" class=""/>
                </q-field>
                <i class="fas fa-times" v-on:click="removeTrack($event)"></i>
            </div>
        </div>
        <div class="addCompilationTrack" v-on:click="addTrack()">Add track</div>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
    computed: {
        ...mapState(['compilationTrackAmount']),
        trackAmount() {
            return this.compilationTrackAmount
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
.compilationField {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 20px;

    i {
        margin-left: 20px;
        font-size: 30px;
    }
}

.addCompilationTrack {
  font-size: 30px;
  text-align: center;
}
</style>
