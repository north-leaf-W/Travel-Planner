<template>
  <div class="app">
      <!-- 导航栏 -->
      <header class="header">
          <h1>旅行计划助手</h1>
          <nav class="nav">
              <router-link to="/" class="nav-link">首页</router-link>
              <template v-if="userStore.currentUser">
                <router-link to="/create-trip" class="nav-link">创建旅行计划</router-link>
                <router-link to="/my-trips" class="nav-link">我的旅行计划</router-link>
                <span class="nav-link user-info">
                  欢迎, {{ userStore.currentUser.displayName || userStore.currentUser.email }}
                  <el-button type="text" @click="logout" size="small" class="logout-btn">退出</el-button>
                </span>
              </template>
              <template v-else>
                <router-link to="/login" class="nav-link">登录</router-link>
                <router-link to="/register" class="nav-link">注册</router-link>
              </template>
          </nav>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
          <div v-if="userStore.isLoading" class="global-loading" v-loading="true">
              <span>加载中...</span>
          </div>
          <router-view v-else></router-view>
      </main>

      <!-- 页脚 -->
      <footer class="footer">
          <p>&copy; 2025 旅行计划助手. 版权所有.</p>
      </footer>
  </div>
</template>

<script>
import { useUserStore } from './stores/userStore';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    // 初始化用户认证状态
    onMounted(() => {
      userStore.initAuth();
    });

    // 登出方法
    const logout = async () => {
      try {
        await userStore.logout();
        ElMessage.success('退出成功');
        router.push('/login');
      } catch (error) {
        ElMessage.error('退出失败，请稍后再试');
      }
    };

    return {
      userStore,
      logout
    };
  }
};
</script>

<style scoped>
/* 全局布局 */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏样式 */
.header {
  background-color: #42b983;
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
}

.nav {
  display: flex;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  margin: 0 15px;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #e0f7fa;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn {
  color: white;
  font-weight: bold;
}

.logout-btn:hover {
  text-decoration: underline;
}

/* 页面内容样式 */
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 页脚样式 */
.footer {
  background-color: #42b983;
  color: white;
  text-align: center;
  padding: 10px;
  margin-top: auto;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
}

.global-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 10px;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }
  
  .nav-link {
    margin: 5px 10px;
  }
}
</style>