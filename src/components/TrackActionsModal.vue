<template>
  <div>
    <q-modal :content-css="{width: '50%', height: '50%', background: '#11363a'}" class="trackActionsModal" transition v-model="trackActionsModalOpen">
      <i class="fas fa-times closeModal" v-on:click="closeModal"></i>
      <div class="modalContent">
        <q-list>
          <div class="menuTitle">Track Menu:</div>
          <a v-on:click="showUsersTracks('currentUser'); closeModal();">
            <q-item class="menuItem">Your tracks</q-item>
          </a>
          <a v-on:click="showAllTracks('all'); closeModal();">
            <q-item class="menuItem">All tracks</q-item>
          </a>
          <a v-on:click="showFavourites(); closeModal();">
            <q-item class="menuItem">Favourites</q-item>
          </a>
          <a v-on:click="showArtistTracks('artist'); closeModal();">
            <q-item class="menuItem">This artist's tracks</q-item>
          </a>
        </q-list>
      </div>
    </q-modal>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import db from "../firestore/firebaseInit"
import firebase from "firebase/app"

export default {
  methods: {
    ...mapMutations(['UPDATE_TRACK_ACTIONS_MODAL', 'UPDATE_TRACK_LIST', 'GET_TRACKS']),
    closeModal: function () {
      this.$store.commit('UPDATE_TRACK_ACTIONS_MODAL', false)
    },
    showUsersTracks: function () {
      this.$store.commit('GET_TRACKS', 'currentUser')
    },
    showAllTracks: function () {
      this.$store.commit('GET_TRACKS', 'all')
    },
    showFavourites: function () {
      let tracks = []
      let favourites;
      db.collection('users').where('userID', '==', this.loggedInUserId).get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            favourites = doc.data().favourites

            favourites.forEach(fav => {
              db.collection('tracks').where('trackID', '==', fav).get()
                .then(querySnapshot => {
                  querySnapshot.forEach(doc => {
                    tracks.push(doc.data())
                  })
                })
            })
            this.$store.commit('UPDATE_TRACK_LIST', tracks)
          })
        })
    },
    showArtistTracks: function() {
      this.$store.commit('GET_TRACKS', 'artist')
    },
    downloadTrack: function () {
      this.stop()
      window.open(this.currentTrack.trackUrl, 'download')
    }
  },
  computed: {
    ...mapState(['trackActionsModalOpen', 'currentTrack', 'loggedInUserId'])
  }
};
</script>

<style>
.closeModal {
  position: relative;
  font-size: 25px;
  padding: 5px;
  float: right;
}

.trackActionsModal {
  background-color: rgba(37, 111, 119, 0.9);
}

.modalContent {
  padding: 40px 30px;
  color: white;
}

.menuItem {
  font-size: 22px;
}

.menuTitle {
  font-size: 27px;
  padding-bottom: 30px;
}
</style>
