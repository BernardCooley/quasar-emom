import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login"
import Register from "../components/Register"
import Account from "../components/Account"
import Music from "../components/Music"
import AddTrack from "../components/AddTrack"
import Explore from "../components/Explore"
import Home from "../components/Home"
import CompilationForm from "../components/forms/CompilationForm"
import UploadForm from '../components/forms/UploadForm'

Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/music',
      name: 'music',
      component: Music
    },
    {
      path: '/explore',
      name: 'explore',
      component: Explore
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadForm
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    }
  ],
  linkActiveClass: "active",
  linkExactActiveClass: "exact-active"
})
