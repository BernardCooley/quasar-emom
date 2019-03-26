<template>
    <div class="musicContainer">
        <explore></explore>
        <play :class="exploreExpanded ? 'fixedBottom' : ''"></play>
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
    ...mapState(['exploreExpanded'])
    }
}
</script>

<style lang="scss">
@import "../css/commonStyles.scss";

.fixedBottom {
    height: 50px;
    position: fixed;
    bottom: 49px;
    width: 100%;
}
</style>
