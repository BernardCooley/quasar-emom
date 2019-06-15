<template>
  <div class="uploadContainer">
    <div class="content">
      <div v-if="isUserAdminComp" class="singleOrCompilation">
        <div :class="[singleUpload ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="singleUpload = true">Single track</div>
        <div :class="[!singleUpload ? 'active' : '', 'singleCompilationTab']" v-on:click.prevent="singleUpload = false">Compilation</div>
      </div>

      <div class="compilationUpload" v-if="!singleUpload">
        <compilation-form></compilation-form>
      </div>
      <div v-else>
        <single-form></single-form>
      </div>
      <q-btn class="uploadBtn" v-on:click.prevent="upload()">Upload</q-btn>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import CompilationForm from "./forms/CompilationForm";
import SingleForm from "./forms/SingleForm";

export default {
  components: {
    CompilationForm,
    SingleForm
  },
  data() {
    return {
      singleUpload: true
    };
  },
  computed: {
    ...mapState(["isUserAdmin"]),
    isUserAdminComp() {
      return this.isUserAdmin;
    }
  },
  methods: {
    upload() {
        
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  .singleOrCompilation {
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-bottom: 30px;

    .singleCompilationTab {
      height: 50px;
      width: 50%;
      text-align: center;
      font-size: 20px;
      line-height: 50px;
      opacity: 0.3;
    }

    .active {
      opacity: 1;
    }
  }
  .compilationUpload {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 30px;
  }
}
</style>
