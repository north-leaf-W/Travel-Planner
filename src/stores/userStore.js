import { defineStore } from 'pinia';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from '../firebase';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const isAuthenticated = ref(false);
  const currentUser = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 初始化函数，从localStorage恢复用户状态
  function initAuth() {
    console.log('初始化用户认证状态');
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        currentUser.value = userData;
        isAuthenticated.value = true;
        console.log('从本地存储恢复用户登录状态:', userData.email);
      }
    } catch (err) {
      console.error('恢复用户状态失败:', err);
    }
  }

  // 用户注册
  const register = async (email, password) => {
    error.value = null;
    isLoading.value = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      currentUser.value = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: email.split('@')[0]
      };
      isLoading.value = false;
      return userCredential.user;
    } catch (err) {
      error.value = err.message;
      isLoading.value = false;
      throw err;
    }
  };

  // 用户登录
  const login = async (email, password) => {
    error.value = null;
    isLoading.value = true;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      currentUser.value = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0]
      };
      
      // 保存用户信息到localStorage以便页面刷新后恢复状态
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
      
      isLoading.value = false;
      return userCredential.user;
    } catch (err) {
      error.value = err.message;
      isLoading.value = false;
      throw err;
    }
  };

  // 用户登出
  const logout = async () => {
    error.value = null;
    try {
      await signOut(auth);
      currentUser.value = null;
      
      // 清除localStorage中的用户信息
      localStorage.removeItem('currentUser');
      
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    error,
    initAuth,
    register,
    login,
    logout
  };
}); 