<template>
    <div class="musicContainer">
        <explore></explore>
        <play :class="exploreOpen ? 'fixedBottom' : ''"></play>
    </div>
</template>

<script>
import Play from './Play'
import Explore from './Explore'
import { mapState } from 'vuex'

export default {
    name: 'music',
    components: {
        Play,
        Explore
    },
    computed: {
    ...mapState(['exploreOpen'])
    }
}
</script>

<style lang="scss">
.fixedBottom {
    height: 50px;
    position: fixed;
    bottom: 49px;
    width: 100%;
}
</style>
