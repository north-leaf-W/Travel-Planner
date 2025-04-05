import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { db } from '../firebase';
import { useUserStore } from './userStore';

// 模拟本地存储的旅行数据
const mockTrips = reactive([
  {
    id: 'trip1',
    name: '北京之旅',
    destination: '北京',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-07'),
    description: '探索中国首都的历史与现代魅力',
    budget: 5000,
    categories: [
      { name: '交通', budget: 1500 },
      { name: '住宿', budget: 1800 },
      { name: '餐饮', budget: 1000 },
      { name: '景点门票', budget: 500 },
      { name: '购物', budget: 200 }
    ],
    expenses: [
      { category: '交通', amount: 600, date: new Date('2025-05-01'), description: '机票' },
      { category: '住宿', amount: 450, date: new Date('2025-05-01'), description: '酒店第一晚' }
    ],
    userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'user1',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: 'trip2',
    name: '上海周末游',
    destination: '上海',
    startDate: new Date('2025-06-12'),
    endDate: new Date('2025-06-14'),
    description: '体验魔都的繁华与文化',
    budget: 3000,
    categories: [
      { name: '交通', budget: 800 },
      { name: '住宿', budget: 1000 },
      { name: '餐饮', budget: 800 },
      { name: '景点门票', budget: 300 },
      { name: '购物', budget: 100 }
    ],
    expenses: [],
    userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).id : 'user1',
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-02')
  }
]);

export const useTripStore = defineStore('trip', () => {
  const trips = ref([]);
  const selectedTrip = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isLoading = ref(false);

  // 保存旅行计划到本地存储
  const saveTripsToLocalStorage = () => {
    try {
      localStorage.setItem('userTrips', JSON.stringify(trips.value));
      console.log('旅行计划已保存到本地存储');
    } catch (error) {
      console.error('保存旅行计划到本地存储失败:', error);
    }
  };

  // 获取用户的所有旅行计划
  const fetchTrips = async () => {
    isLoading.value = true;
    console.log('开始加载旅行计划');
    
    // 从localStorage加载旅行计划
    try {
      const savedTrips = localStorage.getItem('userTrips');
      const userStore = useUserStore();
      
      if (savedTrips) {
        console.log('从本地存储找到旅行计划数据');
        const parsedTrips = JSON.parse(savedTrips);
        
        // 确保只加载当前用户的旅行
        if (userStore.currentUser) {
          const userTrips = parsedTrips.filter(trip => trip.userId === userStore.currentUser.id);
          
          if (userTrips.length > 0) {
            console.log(`找到${userTrips.length}个属于当前用户的旅行计划`);
            
            // 处理日期字段，将字符串转换回Date对象
            const processedTrips = userTrips.map(trip => {
              return {
                ...trip,
                startDate: trip.startDate ? new Date(trip.startDate) : null,
                endDate: trip.endDate ? new Date(trip.endDate) : null,
                createdAt: trip.createdAt ? new Date(trip.createdAt) : new Date(),
                updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : new Date(),
                expenses: (trip.expenses || []).map(expense => ({
                  ...expense,
                  date: expense.date ? new Date(expense.date) : new Date()
                }))
              };
            });
            
            trips.value = processedTrips;
            console.log('日期处理完成，数据加载成功');
            isLoading.value = false;
            return;
          } else {
            console.log('本地存储中没有当前用户的旅行计划');
          }
        }
      }
    } catch (error) {
      console.error('加载本地存储的旅行计划失败:', error);
    }
    
    // 如果本地存储没有数据或出错，使用模拟数据
    console.log('使用模拟数据');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API请求延迟
    
    const userStore = useUserStore();
    if (userStore.currentUser) {
      // 过滤出当前用户的旅行计划
      const userTrips = mockTrips.filter(trip => trip.userId === userStore.currentUser.id);
      trips.value = userTrips;
    } else {
      // 未登录状态，显示默认数据
      trips.value = [...mockTrips];
    }
    
    // 将加载的数据保存到localStorage
    saveTripsToLocalStorage();
    
    isLoading.value = false;
    console.log('旅行计划加载完成');
  };

  // 添加新旅行计划
  const addTrip = async (trip) => {
    const userStore = useUserStore();
    
    if (!userStore.currentUser) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      // 模拟从服务器获取数据的延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTrip = {
        id: `trip${Date.now()}`,
        ...trip,
        userId: userStore.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 添加到模拟数据
      mockTrips.push(newTrip);
      
      // 更新本地数据
      trips.value.push(newTrip);
      
      // 更新本地存储
      saveTripsToLocalStorage();
      return newTrip;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 更新旅行计划
  const updateTrip = async (id, updatedData) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('正在更新旅行计划:', id, updatedData);
      // 模拟从服务器获取数据的延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      // 尝试更新模拟数据，但不强制要求能找到
      const mockIndex = mockTrips.findIndex(trip => trip.id === id);
      if (mockIndex !== -1) {
        mockTrips[mockIndex] = { ...mockTrips[mockIndex], ...dataToUpdate };
        console.log('更新了mockTrips中的数据');
      } else {
        console.log('mockTrips中未找到该旅行计划，仅更新本地存储中的数据');
      }
      
      // 更新本地数据
      const index = trips.value.findIndex(trip => trip.id === id);
      if (index !== -1) {
        console.log('在trips中找到了要更新的旅行计划');
        trips.value[index] = { ...trips.value[index], ...dataToUpdate };
        
        // 更新本地存储
        saveTripsToLocalStorage();
        console.log('旅行计划更新成功并保存到localStorage');
        return trips.value[index];
      } else {
        console.error('本地数据中未找到要更新的旅行计划:', id);
        throw new Error('本地数据中未找到要更新的旅行计划');
      }
    } catch (err) {
      console.error('更新旅行计划失败:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 删除旅行计划
  const deleteTrip = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 模拟从服务器获取数据的延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 从模拟数据中删除
      const mockIndex = mockTrips.findIndex(trip => trip.id === id);
      if (mockIndex !== -1) {
        mockTrips.splice(mockIndex, 1);
      }
      
      // 更新本地数据
      trips.value = trips.value.filter(trip => trip.id !== id);
      
      // 更新本地存储
      saveTripsToLocalStorage();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    trips,
    selectedTrip,
    loading,
    error,
    isLoading,
    fetchTrips,
    addTrip,
    updateTrip,
    deleteTrip
  };
}); 