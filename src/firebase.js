// 导入所需的模块
import { reactive } from 'vue';

// 模拟用户数据
const mockUsers = reactive({
  'demo@example.com': {
    uid: 'user1',
    email: 'demo@example.com',
    password: 'password123',
    displayName: 'Demo User'
  },
  'test@example.com': {
    uid: 'user2',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  }
});

// 从localStorage获取用户信息（如果存在）
const savedUser = localStorage.getItem('currentUser');
let currentUser = savedUser ? JSON.parse(savedUser) : null;
let authStateChangeCallback = null;

// 更新localStorage中的用户信息
const updateLocalStorage = (user) => {
  if (user) {
    // 不存储密码到localStorage
    const { password, ...safeUser } = user;
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// 模拟Firebase Auth功能
const auth = {
  currentUser: currentUser
};

// 模拟注册功能
const createUserWithEmailAndPassword = async (auth, email, password) => {
  return new Promise((resolve, reject) => {
    // 检查邮箱是否已存在
    if (mockUsers[email]) {
      reject(new Error('账号已存在'));
      return;
    }
    
    // 创建新用户
    const newUser = {
      uid: `user${Date.now()}`,
      email,
      password,
      displayName: email.split('@')[0]
    };
    
    mockUsers[email] = newUser;
    currentUser = { ...newUser };
    auth.currentUser = currentUser;
    
    // 将用户信息保存到localStorage
    updateLocalStorage(currentUser);
    
    // 触发状态改变回调
    if (authStateChangeCallback) {
      authStateChangeCallback(currentUser);
    }
    
    resolve({ user: currentUser });
  });
};

// 模拟登录功能
const signInWithEmailAndPassword = async (auth, email, password) => {
  return new Promise((resolve, reject) => {
    // 检查用户是否存在
    const user = mockUsers[email];
    if (!user) {
      reject(new Error('用户不存在'));
      return;
    }
    
    // 验证密码
    if (user.password !== password) {
      reject(new Error('密码错误'));
      return;
    }
    
    currentUser = { ...user };
    auth.currentUser = currentUser;
    
    // 将用户信息保存到localStorage
    updateLocalStorage(currentUser);
    
    // 触发状态改变回调
    if (authStateChangeCallback) {
      authStateChangeCallback(currentUser);
    }
    
    resolve({ user: currentUser });
  });
};

// 模拟退出功能
const signOut = async (auth) => {
  return new Promise((resolve) => {
    currentUser = null;
    auth.currentUser = null;
    
    // 从localStorage中移除用户信息
    updateLocalStorage(null);
    
    // 触发状态改变回调
    if (authStateChangeCallback) {
      authStateChangeCallback(null);
    }
    
    resolve();
  });
};

// 模拟监听用户状态变化
const onAuthStateChanged = (auth, callback) => {
  authStateChangeCallback = callback;
  // 立即执行一次回调
  callback(currentUser);
  
  // 返回取消订阅函数
  return () => {
    authStateChangeCallback = null;
  };
};

// 模拟Firestore功能
const db = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => ({
        exists: true,
        data: () => ({}),
        id
      }),
      set: async (data) => {},
      update: async (data) => {}
    }),
    add: async (data) => ({
      id: `doc${Date.now()}`
    }),
    where: () => ({
      get: async () => ({
        docs: []
      })
    })
  })
};

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
}; 