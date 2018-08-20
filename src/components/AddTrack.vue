<template>
  <div class="addTrackContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field label="Artist" error-label="">
              <q-input id="artist" v-model="track.artist.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Title" error-label="">
              <q-input id="trackTitle" v-model="track.title.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Track Url" error-label="">
              <q-input id="trackUrl" v-model="track.trackUrl.value" />
            </q-field>
          </q-item>

          <q-item>
            <q-field label="Artwork Url (optional)" error-label="">
              <q-input id="artworkUrl" v-model="track.artworkUrl.value" />
            </q-field>
          </q-item>

          <q-btn v-on:click="addTrack">Add Track</q-btn>
          <q-btn v-on:click="cancel">Cancel</q-btn>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase";
import { mapMutations } from "vuex"

export default {
  name: "add-track",
  data: function() {
    return {
      track: {
        artist: { value: null, errors: [] },
        title: { value: null, errors: [] },
        trackUrl: { value: null, errors: [] },
        artworkUrl: { value: null, errors: [] }
      },
      errorsBool: null,
      userID: null,
      addTrackMessage: null
    };
  },
  methods: {
    ...mapMutations(['UPDATE_ADD_TRACK']),
    validation: function(e) {
      this.errorsBool = false;
      this.track.artist.errors = [];
      this.track.title.errors = [];
      this.track.trackUrl.errors = [];
      this.track.artworkUrl.errors = [];

      if (!this.track.artist.value) {
        this.track.artist.errors.push("Artist name required.");
      }

      if (!this.track.title.value) {
        this.track.title.errors.push("Track title required.");
      }

      if (!this.track.trackUrl.value) {
        this.track.trackUrl.errors.push("Track Url required.");
      }

      for (var x in this.track) {
        if (this.track[x].errors.length > 0) {
          this.errorsBool = true;
        }
      }
    },
    addTrack: function() {
      this.validation();
      if (!this.errorsBool) {
        db
          .collection("tracks")
          .add({
            artist: this.track.artist.value,
            title: this.track.title.value,
            trackUrl: this.track.trackUrl.value,
            artworkUrl: this.track.artworkUrl.value
          })
          .then(data => {
            if (data.id) {
              this.addTrackMessage = "Track added successfully";
              this.$router.push("/music");
              this.addTrackMessage = null;
            }
          })
          .catch(error => console.log(err));
      }
    },
    cancel: function() {
      this.$store.commit("UPDATE_ADD_TRACK", false)
    }
  }
};
</script>

<style>
.validationMessage {
  color: red;
  text-align: center;
}

.native-input:active,
.native-input:focus {
  outline: none;
}
</style>
