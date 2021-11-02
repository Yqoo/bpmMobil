import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: () => import('../components/Layout/index.vue'),
      redirect: '/advertisement',
      children: [
        {
          path: '/advertisement',
          name: 'Advertisement',
          component: () => import('../components/Advertisement/index.vue')
        },
        {
          path: '/customform',
          name: 'Customform',
          component: () => import('../components/Customform/index.vue')
        }
      ]
    }
  ]
})
