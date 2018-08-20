<template>
  <div class="registerContainer">
    <div class="content">
      <div class="pageContainer">
        <q-list>
          <q-item>
            <q-field class="inputField" label="Artist name" error-label="">
              <q-input id="artistName" v-model="user.artistName.value" />
            </q-field>
          </q-item>

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

          <q-item>
            <q-field class="inputField" label="Confirm password" error-label="">
              <q-input type="password" id="passwordConfirm" v-model="user.passwordConfirm.value" />
            </q-field>
          </q-item>

          <q-btn v-on:click="register">Register</q-btn>

          <span>{{registerMessage}}</span>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import db from "../firestore/firebaseInit";
import firebase from "firebase";

export default {
  name: 'register',
  data: function() {
    return {
      user: {
        artistName: {
          value: "",
          errors: []
        },
        email: {
          value: "",
          errors: []
        },
        password: {
          value: "",
          errors: []
        },
        passwordConfirm: {
          value: "",
          errors: []
        }
      },
      errorsBool: null,
      userID: null,
      registerMessage: null
    };
  },
  methods: {
    validation: function(e) {
      this.errorsBool = false;
      this.user.artistName.errors = [];
      this.user.email.errors = [];
      this.user.password.errors = [];
      this.user.passwordConfirm.errors = [];

      if (!this.user.artistName.value) {
        this.user.artistName.errors.push("Artist name required.");
      }
      if (!this.user.email.value) {
        this.user.email.errors.push("Email required.");
      }

      var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(this.user.email.value)) {
        this.user.email.errors.push("Invalid email format.");
      }

      if (this.user.password.value.length < 6) {
        this.user.password.errors.push("Minimum 6 characters.");
      }

      if (!this.user.password.value) {
        this.user.password.errors.push("Password required.");
      }

      if (this.user.password.value != this.user.passwordConfirm.value) {
        this.user.passwordConfirm.errors.push("Password does not match.");
      }

      if (!this.user.passwordConfirm.value) {
        this.user.passwordConfirm.errors.push(
          "Password confirmation required."
        );
      }

      for (var x in this.user) {
        if (this.user[x].errors.length > 0) {
          this.errorsBool = true;
        }
      }
    },
    register: function(e) {
      this.validation();
      if (!this.errorsBool) {
        console.log("registering.....");
        this.registerUser();
        e.preventDefault()
      }
    },
    registerUser: function() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(
        this.user.email.value,
        this.user.password.value
        )
        .then(data => {
          this.createUserAccount(data.user.uid);
        })
    },
    createUserAccount: function(userID) {
      db.collection("users").doc(userID).set({
          userID: userID,
          artistName: this.user.artistName.value,
          tracks: []
        })
        .then(data => {
          if (data.id) {
            this.registerMessage = "Registration successful";
            this.registerMessage = null
          }
        })
        .catch(error => console.log(err));
    }
  }
};
</script>

<style>
.validationMessage {
  color: red;
  text-align: center;
}

.inputField {
  width: 100%;
}
</style>
