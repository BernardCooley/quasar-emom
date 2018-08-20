<template>
    <div id="q-app">
        <div class="appContainer">
            <tabs></tabs>
        </div>
    </div>
</template>

<script>
import Tabs from "./components/Tabs";

export default {
    components: {
        Tabs
    }
};
</script>

<style>
.pageContainer {
    height: 100%;
    overflow: hidden;
}
</style>
