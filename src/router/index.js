import Vue from 'vue'
import Router from 'vue-router'

import basic from '../pages/basic';
import secondSelect from '../pages/secondSelect';


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect:'/basic'
    },
    {
      path:"/basic",
      component:basic
    },
    {
      path:"/secondSelect",
      component:secondSelect
    }
  ]
})
