<template>
    <div class="accountContainer">
        <div class="accountDetails accountSection">
            <div class="accountSectionContainer" v-on:click.prevent="toggleAccountDetails">
                <div class="accountSectionTitle">Account Details</div>
                <img class="chevron" :class="[displayAccountDetails ? 'open' : 'closed']" src="assets/icons/right-chevron.svg" />
            </div>
            <div v-if="displayAccountDetails">
                <q-item>Artist Name: {{computedUserDetails.artistName}}</q-item>
                <q-item>Email address: {{computedUserDetails.email}}</q-item>
                <q-btn class="deleteAccountButton" v-on:click="deleteAccount">Delete Account</q-btn>
            </div>
        </div>

        <div class="userTracks accountSection">
            <div class="accountSectionContainer" v-on:click.prevent="toggleAccountTracks">
                <div class="accountSectionTitle">User Tracks</div>
                <img class="chevron" :class="[displayAccountTracks ? 'open' : 'closed']" src="assets/icons/right-chevron.svg" />
            </div>
            <div v-if="displayAccountTracks">
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
        <q-btn class="logoutButton" v-on:click="logout">Logout</q-btn>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import firebase from "firebase/app";
import db from "../firestore/firebaseInit"

export default {
    data() {
        return {
            deleteMessage: null,
            displayAccountTracks: false,
            displayAccountDetails: false,
            user: []
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
                usersRef.update({ tracks: snapshot.data().tracks.filter(item => item !== trackName) }).then(res => {
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
        },
        getUserDetails() {
            this.user = []
            this.user['email'] = firebase.auth().currentUser.email
            let userRef = db.collection('users').doc(firebase.auth().currentUser.uid)
            userRef.get().then(userSnapshot => {
                this.user['artistName'] = userSnapshot.data().artistName
                console.log(JSON.stringify(this.user))
            })

        },
        toggleAccountTracks() {
            this.displayAccountTracks = !this.displayAccountTracks
        },
        toggleAccountDetails() {
            this.displayAccountDetails = !this.displayAccountDetails
        },
        deleteAccount() {
            let user = firebase.auth().currentUser




            // let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)


            let usersRef = db.collection('users').doc(user.uid)
            usersRef.get().then(snapshot => {
                let artworkNames = []
                snapshot.data().tracks.map(track => {
                    let trackRef = firebase.storage().ref().child('tracks/' + track)
                    trackRef.getMetadata().then(metadata => {
                        let artworkRef = firebase.storage().ref().child('artwork/' + metadata.customMetadata.artworkName)
                        if (metadata.customMetadata.artworkName != 'default.gif') {
                            artworkNames.push(metadata.customMetadata.artworkName)
                            // artworkRef.delete.then(() => {
                            //     console.log('Artwork deleted')
                            // }).catch((error) => {
                            //     console.log('Error deleting artwork')
                            // })
                        }
                    })
                })
            })




            // usersRef.delete().then(() => {
            //     console.log('User details deleted')
            //     user.delete().then(() => {
            //         console.log('Account deleted')
            //     }).catch((error) => {
            //         console.log('Error deleting user account')
            //     });
            // }).catch((error) => {
            //     console.log('Error deleting user details')
            // })
        }
    },
    created() {
        this.getLoggedInUserTracks()
        this.getUserDetails()
    },
    computed: {
        ...mapState(['userTracksArray']),
        computedDeleteMesage() {
            return this.deleteMessage
        },
        computedUserDetails() {
            return this.user
        }
    }
}
</script>

<style>
.accountTracks {
    padding: 0;
}

.userTracks,
.accountDetails {
    margin: 10px;
    padding-bottom: 10px;
}

.accountSection {
    border-bottom: 1px solid gray;
}

.accountSectionTitle {
    font-size: 25px;
}

.chevron {
    height: 20px;
    margin-left: 5px;
}

.open {
    transform: rotate(-90deg);
}

.closed {
    transform: rotate(90deg);
}

.accountSectionContainer {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
}

.logoutButton {
    position: fixed;
    bottom: 20px;
    right: 20px;
}

.deleteAccountButton {
    color: red;
}
</style>
