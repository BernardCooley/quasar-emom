<script>
import { mapMutations } from 'vuex'
import db from '../firestore/firebaseInit'
import firebase from 'firebase/app'

export default {
  methods: {
    ...mapMutations(['UPDATE_TRACKS_ARRAY', 'CLEAR_TRACKS_ARRAY']),
    loadTracks(user) {
      var trackNames = []
      if (user) {
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then(doc => {
          this.getTracks(doc.data().tracks)
        }).catch(error => {
          console.log(error)
        })
      } else {
        db.collection('users').get().then(users => {
          users.docs.map(user => {
            trackNames = user.data().tracks
              ? [...user.data().tracks, ...trackNames]
              : trackNames
          })
          this.getTracks(trackNames)
        })
      }
    },
    getTracks(trackNames) {
      let trackData = []
      this.$store.commit('CLEAR_TRACKS_ARRAY')
      trackNames.forEach(trackFilename => {
        let trackRef = firebase.storage().ref().child('tracks/' + trackFilename)
        trackRef.getMetadata().then(metadata => {
          let artworkRef = firebase.storage().ref().child('artwork/' + metadata.customMetadata.artworkName)

          artworkRef.getDownloadURL().then(artworkUrl => {
            trackRef.getDownloadURL().then(trackURL => {
              trackData.push({
                metaData: {
                  artist: metadata.customMetadata.artist,
                  title: metadata.customMetadata.title,
                  artworkUrl: artworkUrl
                },
                downloadURL: trackURL,
                filename: trackFilename
              })
              this.$store.commit('UPDATE_TRACKS_ARRAY', trackData)
            }).catch(error => {
              console.log(error)
            })
          })
          this.dataLoaded = true
        }).catch(error => { })
      })
    }
  }
}
</script>
