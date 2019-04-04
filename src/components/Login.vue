<template>
  <div class="loginContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field class="inputField" label="Email" error-label>
              <q-input id="email" v-model="user.email.value"/>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Password" error-label>
              <q-input type="password" id="password" v-model="user.password.value" initial-show-password="false"/>
            </q-field>
          </q-item>
          <q-btn v-on:click.prevent="login()">Log In</q-btn>
        </q-list>
        <div class="errorMessage">{{errorMsgComputed}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit"
import firebase from "firebase/app"
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
      mailHasError: false,
      errorMessage: null
    }
  },
  computed: {
    errorMsgComputed() {
      return this.errorMessage
    }
  },
  methods: {
    ...mapMutations(['UPDATE_ISLOGGED_IN']),
    validation(e) {
      this.errorsBool = false
      this.user.email.errors = []
      this.user.password.errors = []

      if (!this.user.email.value) {
        this.user.email.errors.push('Email required.')
      }

      var emailRegex = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.")
      }

      if (!this.user.password.value) {
        this.user.password.errors.push("Password required.")
      }

      for (var x in this.user) {
        if (this.user[x].errors.length > 0) {
          this.errorsBool = true
        }
      }
    },
    login() {
      this.validation()
      if (!this.errorsBool) {
        firebase.auth().signInWithEmailAndPassword(
            this.user.email.value,
            this.user.password.value
          ).then(() => {
            this.$store.commit("UPDATE_ISLOGGED_IN", true)
            this.errorMessage = ""
            this.$router.push('/music')
          }).catch(error => {
            this.errorMessage = "Email or password incorrect"
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.transparent {
  background-color: transparent;
}
.q-if-control {
  width: 50%;
}
.errorMessage {
  color: red;
  width: 100%;
  text-align: center;
  font-size: 20px;
  padding-top: 20px;
}
</style>
