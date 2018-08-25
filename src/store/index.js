import Vue from 'vue'
import Vuex from 'vuex'

import musicModule from './modules/music-module'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function() {
    const store = new Vuex.Store({
        state: {
            isLoggedIn: false,
            loggedInUser: null,
            menuDisplayed: false,
            pageTitle: null,
            currentTab: null,
            addTrack: false
        },
        mutations: {
            UPDATE_ISLOGGED_IN (state, value) {
                state.isLoggedIn = value
            },
            UPDATE_LOGGED_IN_USER (state, value) {
                state.loggedInUser = value
            },
            TOGGLE_MENU (state, value) {
                state.menuDisplayed = value
            },
            UPDATE_PAGE_TITLE (state, value) {
                state.pageTitle = value
            },
            UPDATE_CURRENT_TAB (state, value) {
                state.currentTab = value
            },
            UPDATE_ADD_TRACK (state, value) {
                state.addTrack = value
            }
        }
    })

    return store
}

