import Vue from 'vue'
import VueRouter from 'vue-router'
// 配置路由规则
import SellerPage from '@/views/SellerPage'
import TrendPage from '@/views/TrendPage'
import AtlasPage from '@/views/AtlasPage'
import RankPage from '@/views/RankPage'
import HotPage from '@/views/HotPage'
import StockPage from '@/views/StockPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/sellerpage',
    component: SellerPage
  },
  {
    path: '/trendpage',
    component: TrendPage
  },
  {
    path: '/atlaspage',
    component: AtlasPage
  },
  {
    path: '/rankpage',
    component: RankPage
  },
  {
    path: '/hotpage',
    component: HotPage
  },
  {
    path: '/stockpage',
    component: StockPage
  }
]

const router = new VueRouter({
  routes
})

export default router
