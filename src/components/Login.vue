<template>
  <div class="loginContainer">
      <div class="content">
        <div class="pageContainer">
          <q-list>
            <q-item>
              <q-field class="inputField" label="Email" error-label="">
                <q-input id="email" v-model="user.email.value" />
              </q-field>
            </q-item>

            <q-item>
              <q-field class="inputField" label="Password" error-label="">
                <q-input type="password" id="password" v-model="user.password.value" />
              </q-field>
            </q-item>
            <q-btn v-on:click="login">Log In</q-btn>
          </q-list>
        </div>
      </div>

  </div>
</template>

<script>
import db from "../firestore/firebaseInit"
import firebase from "firebase"
import { mapMutations } from "vuex"

export default {
  name: "login",
  data: function() {
    return {
      user: {
        email: {
          value: null,
          errors: []
        },
        password: {
          value: null,
          errors: []
        }
      },
      errorsBool: null,
      userID: null,
      loginMessage: null,
      mailHasError: false
    }
  },
  methods: {
    ...mapMutations(["UPDATE_ISLOGGED_IN"]),
    validation: function(e) {
      this.errorsBool = false
      this.user.email.errors = []
      this.user.password.errors = []

      if (!this.user.email.value) {
        this.user.email.errors.push("Email required.")
      }

      var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.")
      }

      if (!this.user.password.value) {
        this.user.password.errors.push("Password required.")
      }

      for (var x in this.user) {
        if (this.user[x].errors.length > 0) {
          this.errorsBool = true;
        }
      }
    },
    login: function() {
      this.validation();
      if (!this.errorsBool) {
        console.log("Logging in.....")

        firebase
          .auth()
          .signInWithEmailAndPassword(
          this.user.email.value,
          this.user.password.value
          )
          .then(data => {
            this.$store.commit("UPDATE_ISLOGGED_IN", true)
            this.$store.commit("UPDATE_PAGE_TITLE", 'music')
            this.$store.commit('UPDATE_LOGGED_IN_USER', firebase.auth().currentUser.uid)
            console.log(firebase.auth().currentUser)
          });
      }
    }
  }
};
</script>

<style>
.transparent {
  background-color: transparent;
}

.pageContainer {
  padding-top: 50px;
}

.inputField {
  width: 100%;
}

.q-if-control {
  width: 50%;
}
</style>
