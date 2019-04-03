<template>
    <div class="musicContainer">
        <explore></explore>
        <play :class="exploreExpanded ? 'fixedBottom' : ''"></play>
    </div>
</template>

<script>
import Play from './Play'
import Explore from './Explore'
import { mapMutations, mapState } from 'vuex'

export default {
    name: 'music',
    components: {
        Play,
        Explore
    },
    mounted() {
        this.$store.commit('UPDATE_LOGGED_IN_USER_ID')
        this.$store.commit('UPDATE_BAND_IMAGE')
        this.$store.commit('GET_TRACKS')
        this.$store.commit('GET_ACCOUNT_DETAILS')
    },
    computed: {
    ...mapState(['exploreExpanded', 'tracksArray'])
    },
    methods: {
        ...mapMutations(['GET_TRACKS', 'GET_ACCOUNT_DETAILS'])
    }
}
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.fixedBottom {
    height: 50px;
    position: fixed;
    bottom: 49px;
    width: 100%;
}
.musicContainer .content {
  height: 100%;
}
</style>
