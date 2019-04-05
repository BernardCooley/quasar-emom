<template>
  <div class="loginContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field class="inputField" label="Email" error-label>
              <q-input id="email" v-model="user.email.value"/>
              <div class="validationMessage" v-for="(emailValidationMessage, index) in user.email.errors" :key="index">
                {{emailValidationMessage}}
              </div>
            </q-field>
          </q-item>
          <q-item>
            <q-field class="inputField" label="Password" error-label>
              <q-input type="password" id="password" v-model="user.password.value" initial-show-password="false"/>
              <div class="validationMessage" v-for="(passwordValidationMessage, index) in user.password.errors" :key="index">
                {{passwordValidationMessage}}
              </div>
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
    validation() {
      this.errorsBool = false
      this.user.email.errors = []
      this.user.password.errors = []

      if (!this.user.email.value) {
        this.user.email.errors.push('Email required.')
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
      this.errorMessage = ''
      this.validation()
      if (!this.errorsBool) {
        firebase.auth().signInWithEmailAndPassword(
            this.user.email.value,
            this.user.password.value
          ).then(() => {
            if(firebase.auth().currentUser.emailVerified) {
              this.$store.commit("UPDATE_ISLOGGED_IN", true)
              this.errorMessage = ""
              this.$router.push('/music')
            }else {
              alert('Email address not verified.')
              firebase.auth().signOut().then(() => {
                this.$store.commit("UPDATE_ISLOGGED_IN", false)
              }).catch(error => {
                console.error(error)
              })
            }
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
