<template>
  <q-pull-to-refresh :handler="refreshTracks">
    <div :class="[exploreIsExpanded ? 'exploreExpanded' : 'exploreCollapsed', 'exploreContainer']">
      <div class="searchBar">
        <div class="searchAndFilterContainer" v-if="!openFilterModal && !resultsFiltered">
          <q-item :class="[searchExpanded ? 'searchBoxContainerExpanded' : 'searchBoxContainerCollapsed', 'searchBoxContainer']">
            <q-search v-model="searchModel" :no-icon="false" v-on:click.prevent="searchExpanded = true" :hide-underline="!searchExpanded" @change="submitSearch(searchModel)" placeholder=" "/>
            <div class="searchActions" v-if="searchExpanded">
              <i class="fas fa-times" v-on:click="searchExpanded = false; searchModel = ''"></i>
              <i class="fas fa-arrow-right" v-on:click="submitSearch(searchModel)"></i>
            </div>
          </q-item>
          <i class="fas fa-filter filterButton" v-on:click="openFilterModal = true" v-if="!searchExpanded"></i>
        </div>
        <div class="filterContainer" v-if="openFilterModal">
          <q-list>
            <i class="closeSearchIcon fas fa-arrow-left" v-on:click="openFilterModal = false"></i>
            <div>Filter by:</div>
            <div class="filterOptionsContainer">
              <q-item>
                <q-btn v-on:click="filterByArtist(currentUserName)">YOURS</q-btn>
              </q-item>
              <q-item>
                <q-btn>FAVOURITES</q-btn>
              </q-item>
              <q-item>
                <q-btn-dropdown style="background-image: linear-gradient(#009e98, #256f77)" split label="Artists">
                  <q-list class="filterDropdown" link>
                    <div v-for="(artist, index) in allArtists" :key="index" >
                      <q-item @click.native="filterByArtist(artist)" v-close-overlay>
                        <q-item-main>
                          <q-item-tile class="dropdownLabel" label>{{artist}}</q-item-tile>
                        </q-item-main>
                      </q-item>
                    </div>
                  </q-list>
                </q-btn-dropdown>
              </q-item>
              <q-item>
                <q-btn-dropdown style="background-image: linear-gradient(#009e98, #256f77)" split label="EMOM Compilations">
                  <q-list class="filterDropdown" link>
                    <div v-for="(compilation, index) in allCompilations" :key="index" >
                      <q-item @click.native="filterByCompilation(compilation)" v-close-overlay>
                        <q-item-main>
                          <q-item-tile class="dropdownLabel" label>{{compilation}}</q-item-tile>
                        </q-item-main>
                      </q-item>
                    </div>
                  </q-list>
                </q-btn-dropdown>
              </q-item>
            </div>
          </q-list>
        </div>
        <div class="resultsMessageContainer" v-if="resultsFiltered">
          <div class="resultsMessage">Results for: "{{resultsMessage}}"</div>
          <i class="closeSearchIcon fas fa-arrow-left" v-on:click="resultsFiltered = !resultsFiltered"></i>
        </div>
      </div>
      <div v-on:click="toggleExplore(); changeTrack(track)" class="trackCard" v-for="(track, index) in allOrFilteredTracksArray" :key="index">
        <div class="trackImageContainer">
          <img class="cardImage" :src="track.metaData.artworkUrl">
        </div>
        <div class="trackInfoContainer">
          <div class="artist">{{track.metaData.artist}}</div>
          <div class="title">{{track.metaData.title}}</div>
        </div>
      </div>
    </div>
    <div class="collapsedExplore exploreContainer" v-if="!exploreIsExpanded" v-on:click="toggleExplore()">
      <i class="fas fa-chevron-down"></i>
      <div class="">Traklist</div>
      <i class="fas fa-chevron-down"></i>
    </div>
  </q-pull-to-refresh>
</template>

<script>
import { mapMutations, mapState } from "vuex"
import Play from './Play'

export default {
  name: "explore",
  components: {
    Play
  },
  props: {
    collapsed : {
      type: Boolean,
      default: null
    }
  },
  data: function() {
    return {
      searchTerm: {
        value: null
      },
      searchModel: null,
      searchExpanded: false,
      resultsFiltered: false,
      resultsMessage: '',
      openFilterModal: false,
      currentUserArtistName: ''
    }
  },
  computed: {
    ...mapState(['exploreOpen', 'exploreExpanded', 'tracksArray', 'filteredTracksArray', 'filterModalOpen', 'loggedInUserName']),
    exploreslideClosed() {
      return this.exploreOpen
    },
    exploreIsExpanded() {
      return this.exploreExpanded
    },
    allOrFilteredTracksArray() {
      return this.resultsFiltered ? this.filteredTracksArray : this.tracksArray
    },
    allArtists() {
      let artists = []
      this.tracksArray.map(track => {
        artists.push(track.metaData.artist)
      })
      return [...new Set(artists)]
    },
    allCompilations() {
      let compilations = []
      this.tracksArray.map(track => {
        track.metaData.compilation != '' ? compilations.push(track.metaData.compilation) : null
      })
      return [...new Set(compilations)]
    },
    currentUserName() {
      return this.loggedInUserName
    }
  },
  methods: {
    ...mapMutations(['UPDATE_CURRENT_TRACK', 'GET_TRACKS', 'UPDATE_FILTERED_TRACKS_ARRAY', 'GET_TRACK_COMMENTS', 'TOGGLE_COMMENTS']),
    playTrack(filename) {
      this.$store.commit('UPDATE_CURRENT_TRACK', this.$store.currentTrack = this.tracksArray.filter(track => track.filename == filename)[0])
    },
    toggleExplore() {
      this.$store.commit('TOGGLE_EXPLORE')
    },
    submitSearch(searchTerm) {
      let newTracksArray = this.tracksArray.filter(track => 
        track.metaData.artist.toLowerCase().includes(searchTerm.toLowerCase()) || 
        track.metaData.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        track.metaData.compilation.toLowerCase().includes(searchTerm.toLowerCase())
      )

      this.$store.commit('UPDATE_FILTERED_TRACKS_ARRAY', newTracksArray)

      this.searchExpanded = false
      this.resultsMessage = searchTerm;
      this.searchModel = ''

      this.resultsFiltered = true;
    },
    changeTrack(selectedTrack) {
      this.$store.commit('UPDATE_CURR_TRACK', this.tracksArray.indexOf(selectedTrack))
      this.$store.commit('GET_TRACK_COMMENTS')
      this.$store.commit('TOGGLE_COMMENTS', 'false')
    },
    filterByArtist(artist) {
      this.openFilterModal = false
      this.submitSearch(artist)
    },
    filterByCompilation(compilation) {
      this.openFilterModal = false
      this.submitSearch(compilation)
    },
    getAllArtists() {
      let artists = []
      this.tracksArray.map(track => {
        artists.push(track.metaData.artist)
      })
      return [...new Set(artists)]
    },
    refreshTracks(done) {
      this.$store.commit('GET_TRACKS')
      setTimeout(() => {
        done()
      }, 3000)
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.trackCard {
    width: 100%;
    height: 70px;
    padding: 8px;
    background-color: $light-gray;
    display: flex;
    border-bottom: 1px solid $turquois-light;
    justify-content: flex-start;
    align-items: center;

  .trackInfoContainer {

    .artist {
      font-size: 20px;
    }
    .title {
      font-size: 15px;
    }
  }

  .trackImageContainer {
    width: 65px;
    display: flex;
    justify-content: center;
    height: 100%;

    .cardImage {
      height: 100%;
    }
  }
}
.trackInfoItem {
  height: 35px;
  img {
    height: 100%;
    opacity: 0.8;
  }
  .counter {
    width: auto;
    position: relative;
    top: -39px;
    font-size: 22px;
    text-align: center;
    height: 30px;
    left: 3px;
  }
}
.collapsedExplore {
    height: 50px;
    border-bottom: 1px solid gray;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    position: fixed;
    z-index: 1;
    top: 0;
    width: 100%;
    background-image: linear-gradient(#009e98, #256f77);
    color: $white;

    i {
      font-size: 20px;
      color: $white;
    }
}
.exploreContainer {
  position: relative;
  overflow-y: hidden;
	max-height: 10000px;
	transition-property: all;
	transition-duration: .5s;
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1);

  .refreshIcon {
    position: fixed;
    bottom: 70px;
    right: 15px;
    font-size: 30px;
    opacity: 0.7;
  }
}
.exploreCollapsed {
  max-height: 0;
}
.searchBar {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: flex-start;
  height: auto;
  
  .searchAndFilterContainer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: auto;

    .filterButton {
      margin-right: 10px;
      color: $turquois-light;
    }
  }

  .filterContainer {
    height: auto;
    width: 100%;
  }

  .resultsMessageContainer {
    border-top: 1px solid lightgray;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .resultsMessage {
      font-size: 20px;
      padding: 10px;
    }
  }
}
.closeSearchIcon {
  margin-right: 10px;
  position: absolute;
  right: 0;
  color: $turquois-light;
}
.searchBoxContainerCollapsed {
  width: 150px;
}
.searchBoxContainerExpanded {
  width: 100%;
}
.q-search {
  width: 100%;
}
.q-if-control.q-icon {
  width: auto;
}
.searchBoxContainer input {
  color: white;
  margin-left: 10px;
}
input.q-input-target {
  color: white;
}
.searchActions {
  display: flex;
  width: 50px;
  justify-content: space-between;

  i {
    font-size: 20px;
    color: $turquois-light;
  }
}

.filterDropdown {
  color: white;
  background-color: #256f77;
}

.filterOptionsContainer {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  flex-wrap: wrap;
}
</style>
