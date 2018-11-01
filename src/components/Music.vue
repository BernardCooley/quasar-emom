<template>
  <div class="musicContainer">

    <div class="content" v-if="dataLoaded">
      <div class="pageContainer">

        <!-- <q-item class="searchContainer">
          <q-field class="inputField" label="Search" error-label="">
            <q-input type="text" v-model="search"/>
          </q-field>
        </q-item> -->
        <div class="playerAndAllTracksContainer">
          <div class="playerContainer">
            <div id="audio" class="player-wrapper">
              <audio-player :currenttracknumber='currentTrackIndexNumber+1' :totaltracks='tracks.length' :trackurl='currentTrack.trackUrl' :artist='currentTrack.artist' :title='currentTrack.title' :artworkurl='currentTrack.artworkurl' :trackid='currentTrack.trackid' :uploadedby='currentTrack.uploadedBy'></audio-player>
            </div>
            <q-item class="trackControls">
              <q-btn class="trackControlButton" v-on:click="previousTrack">
                <i class="fas fa-fast-backward"></i>
              </q-btn>
              <q-btn class="trackControlButton" v-on:click="nextTrack">
                <i class="fas fa-fast-forward"></i>
              </q-btn>
            </q-item>
          </div>
        </div>
        <div class="allTracksContainer">
          <q-list>
            <h3 class="trackListTitle">All tracks</h3>
            <q-item class="row" v-for="(track, index) in trackList" :key="index">
              <div class="allTracksArtistAndTitle col-11" v-on:click="changeTrack(track.artist, track.title)">
                <div class="allTracksArtists">{{track.artist}}</div>
                <div class="allTracksTitles">{{track.title}}</div>
              </div>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AudioPlayer from "./AudioPlayer"
import db from "../firestore/firebaseInit"
import firebase from "firebase/app"
import { mapMutations, mapState } from "vuex"
import BoxSDK from 'box-node-sdk'


export default {
  name: "music",
  data: function () {
    return {
      tracks: [],
      dataLoaded: false,
      search: "",
      currentTrackIndexNumber: 0,
      uploadedByName: null
      // sdk: new BoxSDK({
      //   clientID: 'bob8ehwlaa6mthjlisu6giaf2h72t034',
      //   clientSecret: 'oA4Px9RYSj1Pni1ZZ1cSIabNVwUuD99B'
      // })
    }
  },
  components: {
    AudioPlayer
  },
  methods: {
    ...mapMutations(['UPDATE_CURRENT_TRACK', 'UPDATE_TRACK_LIST']),
    loadTracks: function () {
      this.tracks = [];
      db.collection("tracks").get()
        .then(querySnapshot => {
          var index = 0
          querySnapshot.forEach(doc => {
            var data = doc.data()
            data['trackIndex'] = index
            this.tracks.push(data)
            index++
          });
          this.$store.commit("UPDATE_TRACK_LIST", this.tracks)
          if (this.tracks) {
            this.dataLoaded = true;
          }
          this.$store.commit('UPDATE_CURRENT_TRACK', this.tracks[this.currentTrackIndexNumber])
          this.$store.commit('UPDATE_LIKES', this.tracks[this.currentTrackIndexNumber].likes)
        });
    },
    getTrackUrl: function () {
      let storageRef = firebase.storage().ref()
      // Create a reference to the file we want to download
      var starsRef = storageRef.child('tracks/Logic_-_44_More.mp3');

      console.log(starsRef.getMetadata())

      // Get the download URL
      starsRef.getDownloadURL().then(function (url) {
        console.log(url)
        this.trackurl = url
        // Insert url into an <img> tag to "download"
      }).catch(function (error) {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;

          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
    },
    getTracks: function () {
      // let client = this.sdk.getBasicClient('kQ2wdszzI69gnF0U4sYun9FIa0x3wJwu')
      // client.users.get(client.CURRENT_USER_ID, null, function (err, currentUser) {
      //   if (err) throw err;
      //   console.log('Hello, ' + currentUser.name + '!');
      // });
      const token = 'Ek7KVd8kjUHSuvIujbGsR1iFN1olULbk'
      return fetch('https://api.box.com/2.0/folders/0/items', {
        headers: {
          Authorization: `token ${token}`
        }
      })
        .then(res => res.json())
        .then(tracks => alert(tracks))
    },
    previousTrack: function () {
      if (this.currentTrackIndexNumber > 0) {
        this.currentTrackIndexNumber--
      }
    },
    nextTrack: function () {
      if (this.currentTrackIndexNumber < (this.tracks.length - 1)) {
        this.currentTrackIndexNumber++
      }
    },
    changeTrack: function (artist, title) {
      this.getTrackUrl()
      this.currentTrackIndexNumber = this.tracks.filter(track => track.title.toLowerCase() == title.toLowerCase() && track.artist.toLowerCase() == artist.toLowerCase())[0].trackIndex
      this.$store.commit('UPDATE_CURRENT_TRACK', this.tracks[this.currentTrackIndexNumber])
    }
  },
  created() {
    this.loadTracks()
  },
  computed: {
    filteredList() {
      return this.tracks.filter(track => track.title.toLowerCase().includes(this.search.toLowerCase()) || track.artist.toLowerCase().includes(this.search.toLowerCase()))
    },
    currentTrack() {
      return this.tracks[this.currentTrackIndexNumber]
    },
    ...mapState(["trackList"])
  }
};
</script>

<style lang="scss">
.searchContainer {
  padding-bottom: 30px;
}

.track {
  margin: auto;
}

.trackContainer {
  margin: 5px;
  padding: 5px;
}

.loggedInUser {
  float: right;
  font-size: 15px;
  color: white;
}

.trackControls {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trackControlButton {
  width: 50%;
  font-size: 20px;
}

.playerAndAllTracksContainer {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid white;
  padding-bottom: 10px;
}

.playerContainer {
  width: 100%;
  height: 70%;
}

.allTracksContainer {
  width: 100%;
  overflow: auto;

  .q-list {
    border: none;
  }

  .q-item {
    padding: 0;
  }
}

.allTracksArtistAndTitle {
  margin: auto;
  width: 100%;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.allTracksArtists {
  font-size: 20px;
  width: 60%;
  margin-right: 20px;
}

.allTracksTitles {
  font-size: 15px;
  width: 40%;
}

.trackListTitle {
  padding-left: 15px;
  margin: 0;
}

.thumbNail {
  height: 100% !important;
}

.trackInfoPopover {
  position: fixed;
  top: 100px;
}
.trackMenuIcon {
  text-align: center;
  background-color: red;
}
.musicContainer .content {
  height: 100%;
}
</style>