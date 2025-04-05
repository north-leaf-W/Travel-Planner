import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserStore } from './stores/userStore';

// 创建Vue应用
const app = createApp(App);

// 使用插件
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 初始化用户认证状态
const userStore = useUserStore(pinia);
userStore.initAuth();

// 挂载应用
app.mount('#app');