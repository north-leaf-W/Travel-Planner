<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>登录</h2>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="loginForm" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="el-icon-message"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-link">
        <p>还没有账号？ <router-link to="/register">立即注册</router-link></p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';
import { useTripStore } from '../stores/tripStore';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const tripStore = useTripStore();
    const loginForm = ref(null);
    const loading = ref(false);
    
    const form = reactive({
      email: '',
      password: ''
    });
    
    const rules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
      ]
    };
    
    const handleLogin = async () => {
      if (!loginForm.value) return;
      
      await loginForm.value.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          
          try {
            await userStore.login(form.email, form.password);
            ElMessage.success('登录成功');
            
            // 登录成功后加载用户旅行计划数据
            await tripStore.fetchTrips();
            
            // 跳转到首页
            router.push('/');
          } catch (error) {
            let errorMsg = '登录失败，请检查您的邮箱和密码';
            
            if (error.code === 'auth/user-not-found') {
              errorMsg = '用户不存在';
            } else if (error.code === 'auth/wrong-password') {
              errorMsg = '密码错误';
            }
            
            ElMessage.error(errorMsg);
          } finally {
            loading.value = false;
          }
        }
      });
    };
    
    return {
      form,
      rules,
      loginForm,
      loading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 150px);
  background-color: #f5f5f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  display: flex;
  justify-content: center;
}

.login-button {
  width: 100%;
}

.register-link {
  margin-top: 15px;
  text-align: center;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 