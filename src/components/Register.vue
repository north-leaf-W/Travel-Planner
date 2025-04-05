<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>注册</h2>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="registerForm" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="el-icon-message"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" class="register-button">注册</el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-link">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';

export default {
  name: 'Register',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const registerForm = ref(null);
    const loading = ref(false);
    
    const form = reactive({
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== form.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };
    
    const rules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' }
      ]
    };
    
    const handleRegister = async () => {
      if (!registerForm.value) return;
      
      await registerForm.value.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          
          try {
            await userStore.register(form.email, form.password);
            ElMessage.success('注册成功');
            router.push('/');
          } catch (error) {
            let errorMsg = '注册失败，请稍后再试';
            
            if (error.code === 'auth/email-already-in-use') {
              errorMsg = '该邮箱已被注册';
            } else if (error.code === 'auth/invalid-email') {
              errorMsg = '邮箱格式不正确';
            } else if (error.code === 'auth/weak-password') {
              errorMsg = '密码强度不够';
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
      registerForm,
      loading,
      handleRegister
    };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 150px);
  background-color: #f5f5f5;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  display: flex;
  justify-content: center;
}

.register-button {
  width: 100%;
}

.login-link {
  margin-top: 15px;
  text-align: center;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 