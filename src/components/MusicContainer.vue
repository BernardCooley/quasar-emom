<template>
    <div>
        <music v-if="!addTrack"/>
        <add-track v-else/>
        <q-item class="row self-center">
            <i class="fas fa-plus-circle uploadIcon" v-if="!addTrack" v-on:click="addtrack"></i>
        </q-item>
    </div>
</template>

<script>
import Music from '../components/Music'
import AddTrack from '../components/AddTrack'
import { mapMutations, mapState } from "vuex"

export default {
    components: {
        Music,
        AddTrack
    },
    methods: {
        ...mapMutations(['UPDATE_ADD_TRACK']),
        addtrack: function() {
            console.log('argesthrth')
            this.$store.commit("UPDATE_ADD_TRACK", true)
        }
    },
    computed: {
        ...mapState(["addTrack"])
    }
    
}
</script>

<style>
.uploadIcon {
  font-size: 30px;
  color: white;
  background-color: rgb(2, 123, 227);
  border-radius: 24px;
  width: 49px;
  padding: 10px;
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 2;
  text-align: center;
}
</style>
