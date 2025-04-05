import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/Home.vue';
import CreateTrip from './components/CreateTrip.vue';
import MyTrips from './components/MyTrips.vue';
import TripDetails from './components/TripDetails.vue';
import BudgetManagement from './components/BudgetManagement.vue';
import EditTrip from './components/EditTrip.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import { auth } from './firebase';

// 定义路由
const routes = [
    { path: '/', name: 'Home', component: Home },
    { 
        path: '/create-trip', 
        name: 'CreateTrip',
        component: CreateTrip, 
        meta: { requiresAuth: true }
    },
    { 
        path: '/my-trips', 
        name: 'MyTrips',
        component: MyTrips, 
        meta: { requiresAuth: true } 
    },
    { 
        path: '/trip-details/:id', 
        name: 'TripDetails',
        component: TripDetails, 
        props: true, 
        meta: { requiresAuth: true } 
    },
    { 
        path: '/budget-management/:id', 
        name: 'BudgetManagement',
        component: BudgetManagement, 
        props: true, 
        meta: { requiresAuth: true } 
    },
    { 
        path: '/edit-trip/:id', 
        name: 'EditTrip',
        component: EditTrip, 
        props: true, 
        meta: { requiresAuth: true } 
    },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: Home }
];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const currentUser = auth.currentUser;

    if (requiresAuth && !currentUser) {
        next('/login');
    } else {
        next();
    }
});

// 全局错误处理
router.onError((error) => {
    console.error('路由错误:', error);
    // 可以在这里添加错误处理逻辑
});

export default router;