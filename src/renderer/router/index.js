import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Login/login').default,
      meta: {
        login: false,
        title: '登录'
      }
    },
    {
      path: '/update',
      name: 'update',
      component: require('@/components/Update/update').default,
      meta: {
        login: false,
        title: '更新说明'
      }
    },
    {
      path: '/main',
      name: 'main',
      component: require('@/components/Main/main').default,
      meta: {
        login: true,
        title: '浙金客服10.18.13.150'
      }
    },
    {
      path: '/history',
      name: 'history',
      component: require('@/components/History/history').default,
      meta: {
        login: true,
        title: '历史记录'
      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/Setting/setting').default,
      meta: {
        login: true,
        title: '设置'
      }
    },
    {
      path: '/captureScreen',
      name: 'captureScreen',
      component: require('@/components/CaptureScreen/captureScreen').default,
      meta: {
        login: true,
        title: '截图'
      }
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
// 路由加载完成后
router.afterEach(to => {
  document.title = to.meta.title
  window.scrollTo(0, 0)
})

export default router
