<template>
<div id="q-app">
    <div class="appContainer">
        <app-header />
        <slide-menu />
        <div class="pageContainer">
            <router-view />
        </div>
        <navigation />
    </div>
    </div>
</template>

<script>
import Navigation from "./components/Navigation";
import AppHeader from "./components/AppHeader";
import SlideMenu from "./components/SlideMenu";
import { directive as onClickaway } from 'vue-clickaway';

export default {
    components: {
        Navigation,
        AppHeader,
        SlideMenu
    }
};
</script>

<style>
.pageContainer {
    padding-top: 50px;
    height: 100%;
    overflow: hidden;
}
</style>
