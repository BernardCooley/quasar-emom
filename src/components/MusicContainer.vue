<template>
    <div>
        <music v-if="!addTrack"/>
    </div>
</template>

<script>
import Music from '../components/Music'

export default {
    components: {
        Music
    }
}
</script>

<style>

</style>
