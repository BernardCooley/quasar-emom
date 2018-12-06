<template>
    <div class="accountContainer">
        <q-btn v-on:click="logout">Logout</q-btn>

        <div class="userTracks">
            <div class="accountTracksTitle">User Tracks</div>
            <q-item class="accountTracks" v-for="(track, index) in userTracksArray" :key="index">
                <div v-if="computedDeleteMesage === null" class="allTracksArtistAndTitle">
                    <div class="">
                        <div class="trackArtist">{{track.metaData.artist}}</div>
                        <div class="trackTitle">{{track.metaData.title}}</div>
                    </div>
                    <q-btn v-on:click.prevent="deleteTrack(track.metaData.name)">Delete</q-btn>
                    <a>
                        <img class="trackInfoIcon" src="assets/icons/menu-white.svg">
                    </a>
                </div>
                <div v-else>{{computedDeleteMesage}}</div>
            </q-item>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import firebase from "firebase/app";
import db from "../firestore/firebaseInit"

export default {
    data() {
        return {
            deleteMessage: null
        }
    },
    methods: {
        logout() {
            firebase.auth().signOut().then(() => {
                this.$store.commit('UPDATE_ISLOGGED_IN', false);
                this.$store.commit('TOGGLE_MENU', false);
            });
        },
        getLoggedInUserTracks() {
            let store = this.$store
            let usersRef = db.collection("users").doc(firebase.auth().currentUser.uid)
            usersRef.get().then(doc => {
                let trackData = []
                doc.data().tracks.forEach(trackFilename => {
                    let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
                    trackRef.getMetadata().then(function(metadata) {
                        let artworkRef = firebase.storage().ref().child('artwork/' + metadata.customMetadata.artworkName)

                        artworkRef.getDownloadURL().then(artworkUrl => {
                            trackRef.getDownloadURL().then(trackURL => {
                                trackData.push({
                                    metaData: {
                                        artist: metadata.customMetadata.artist,
                                        title: metadata.customMetadata.title,
                                        artworkUrl: artworkUrl,
                                        name: metadata.name
                                    },
                                    downloadURL: trackURL,
                                    filename: trackFilename
                                })
                                store.commit("UPDATE_USER_TRACKS_ARRAY", null)
                                store.commit("UPDATE_USER_TRACKS_ARRAY", trackData)
                            }).catch(function(error) {
                                console.log(error)
                            })
                        })
                    }).catch(function(error) {

                    });
                })
            }).catch(function(error) {
                console.log("Error getting cached document:", error);
            });
        },
        deleteTrackFromUserAccount(trackName) {
            let usersRef = db.collection('users').doc(`${firebase.auth().currentUser.uid}`)
            usersRef.get().then(snapshot => {
                usersRef.update({tracks: snapshot.data().tracks.filter(item => item !== trackName)}).then(res => {
                    console.log('Successfully deleted')
                }).catch(error => {
                    console.error(error)
                })
            })
        },
        deleteTrack(trackName) {
            this.deleteMessage = 'Deleting. Please wait...'
            let trackRef = firebase.storage().ref().child(`tracks/${trackName}`);
            let artworkUrl;

            trackRef.getMetadata().then(metadata => {
                let artworkRef = firebase.storage().ref().child(`artwork/${metadata.customMetadata.artworkName}`);
                trackRef.delete().then(() => {
                    metadata.customMetadata.artworkName != 'default.gif' ? artworkRef.delete() : false
                    this.deleteTrackFromUserAccount(trackName)
                    this.getLoggedInUserTracks()
                    this.deleteMessage = 'Completed'
                    setTimeout(() => {
                        this.deleteMessage = null
                    }, 2000)
                }).catch(error => {
                    console.error(error)
                });
            })
        }
    },
    created() {
        this.getLoggedInUserTracks()
    },
    computed: {
        ...mapState(['userTracksArray']),
        computedDeleteMesage() {
            return this.deleteMessage
        }
    }
}
</script>

<style>
.accountTracks {
    padding: 0;
}

.userTracks {
    margin: 10px;
}

.accountTracksTitle {
    font-size: 20px;
}
</style>
