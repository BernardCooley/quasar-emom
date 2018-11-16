import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */


const store = new Vuex.Store({
    state: {
        isLoggedIn: false,
        loggedInUser: null,
        loggedInUserId: null,
        menuDisplayed: false,
        pageTitle: null,
        currentTab: null,
        addTrack: false,
        trackActionsModalOpen: false,
        currentTrack: null,
        trackList: null,
        likes: null,
        fileUploadPercentage: null,
        tracksArray: []
    },
    mutations: {
        UPDATE_ISLOGGED_IN(state, value) {
            state.isLoggedIn = value
        },
        UPDATE_LOGGED_IN_USER(state, value) {
            state.loggedInUser = value
        },
        UPDATE_LOGGED_IN_USER_ID(state, value) {
            state.loggedInUserId = value
        },
        TOGGLE_MENU(state, value) {
            state.menuDisplayed = value
        },
        UPDATE_PAGE_TITLE(state, value) {
            state.pageTitle = value
        },
        UPDATE_CURRENT_TAB(state, value) {
            state.currentTab = value
        },
        UPDATE_ADD_TRACK(state, value) {
            state.addTrack = value
        },
        UPDATE_TRACK_ACTIONS_MODAL(state, value) {
            state.trackActionsModalOpen = value
        },
        UPDATE_CURRENT_TRACK(state, value) {
            state.currentTrack = value
        },
        UPDATE_TRACK_LIST(state, value) {
            state.trackList = value
        },
        UPDATE_LIKES(state, value) {
            state.likes = value
        },
        UPDATE_FILE_UPLOAD_PERCENTAGE(state, value) {
            state.fileUploadPercentage = value
        },
        UPDATE_TRACKS_ARRAY(state, value) {
            state.tracksArray.push(value)
        },
        CLEAR_TRACKS_ARRAY(state, value) {
            state.tracksArray = []
        }
    }
})

export default store


