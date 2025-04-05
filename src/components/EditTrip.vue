<template>
    <div class="edit-trip">
        <h2>编辑旅行计划</h2>
        
        <div v-if="isLoading" class="loading-container">
            <el-loading></el-loading>
            <p>正在加载旅行计划...</p>
        </div>
        
        <div v-else>
            <el-form 
                v-if="trip"
                :model="trip" 
                :rules="rules" 
                ref="tripForm" 
                label-position="top" 
                class="trip-form"
            >
                <!-- 旅行名称 -->
                <el-form-item label="旅行名称" prop="name">
                    <el-input 
                        v-model="trip.name" 
                        placeholder="请输入旅行名称"
                    ></el-input>
                </el-form-item>

                <!-- 目的地 -->
                <el-form-item label="目的地" prop="destination">
                    <el-input 
                        v-model="trip.destination" 
                        placeholder="请输入目的地"
                    ></el-input>
                </el-form-item>

                <!-- 出发日期 -->
                <el-form-item label="出发日期" prop="startDate">
                    <el-date-picker
                        v-model="trip.startDate"
                        type="date"
                        placeholder="选择出发日期"
                        :disabled-date="disablePastDates"
                    ></el-date-picker>
                </el-form-item>

                <!-- 返回日期 -->
                <el-form-item label="返回日期" prop="endDate">
                    <el-date-picker
                        v-model="trip.endDate"
                        type="date"
                        placeholder="选择返回日期"
                        :disabled-date="disableInvalidEndDates"
                    ></el-date-picker>
                </el-form-item>

                <!-- 旅行描述 -->
                <el-form-item label="旅行描述" prop="description">
                    <el-input
                        type="textarea"
                        v-model="trip.description"
                        placeholder="请输入旅行描述（可选）"
                        :rows="4"
                    ></el-input>
                </el-form-item>

                <!-- 操作按钮 -->
                <el-form-item>
                    <div class="form-actions">
                        <el-button @click="goBack" class="back-btn">返回</el-button>
                        <el-button type="primary" @click="saveTrip" :loading="saveLoading">保存更改</el-button>
                    </div>
                </el-form-item>
            </el-form>
            
            <div v-else class="no-trip">
                <p>未找到该旅行计划。</p>
                <el-button @click="goBack">返回我的旅行计划</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { ElMessage } from 'element-plus';

export default {
    name: 'EditTrip',
    props: ['id'],
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const tripStore = useTripStore();
        
        const trip = ref(null);
        const isLoading = ref(true);
        const saveLoading = ref(false);
        const tripForm = ref(null);
        
        // 从路由参数或props获取旅行ID
        const getTripId = () => {
            return props.id || route.params.id;
        };
        
        // 获取所有旅行计划
        const allTrips = computed(() => tripStore.trips);
        
        // 其他旅行计划（排除当前正在编辑的旅行）
        const otherTrips = computed(() => {
            const currentId = getTripId();
            return allTrips.value.filter(t => t.id !== currentId);
        });
        
        // 验证规则
        const rules = {
            name: [
                { required: true, message: '请输入旅行名称', trigger: 'blur' },
                { max: 50, message: '旅行名称不能超过50个字符', trigger: 'blur' }
            ],
            destination: [
                { required: true, message: '请输入目的地', trigger: 'blur' },
                { max: 100, message: '目的地不能超过100个字符', trigger: 'blur' }
            ],
            startDate: [
                { required: true, message: '请选择出发日期', trigger: 'change' }
            ],
            endDate: [
                { required: true, message: '请选择返回日期', trigger: 'change' },
                { 
                    validator: (rule, value, callback) => {
                        if (trip.value && trip.value.startDate && value && new Date(value) < new Date(trip.value.startDate)) {
                            callback(new Error('返回日期不能早于出发日期'));
                        } else {
                            callback();
                        }
                    }, 
                    trigger: 'change' 
                }
            ],
            description: [
                { max: 500, message: '旅行描述不能超过500个字符', trigger: 'blur' }
            ]
        };
        
        // 检查是否与其他旅行日期冲突
        const checkDateConflicts = (startDate, endDate) => {
            if (!startDate || !endDate) return false;
            
            const newStartDate = new Date(startDate);
            const newEndDate = new Date(endDate);
            
            // 遍历其他旅行计划检查日期冲突
            for (const otherTrip of otherTrips.value) {
                const existingStartDate = new Date(otherTrip.startDate);
                const existingEndDate = new Date(otherTrip.endDate);
                
                // 检查日期范围是否有重叠
                const hasOverlap = (
                    // 新旅行的开始日期在已有旅行的日期范围内
                    (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
                    // 新旅行的结束日期在已有旅行的日期范围内
                    (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
                    // 新旅行的日期范围完全包含已有旅行
                    (newStartDate <= existingStartDate && newEndDate >= existingEndDate) ||
                    // 已有旅行的日期范围完全包含新旅行
                    (newStartDate >= existingStartDate && newEndDate <= existingEndDate)
                );
                
                if (hasOverlap) {
                    const conflictMsg = `与旅行"${otherTrip.name}"（${formatDate(otherTrip.startDate)} 至 ${formatDate(otherTrip.endDate)}）日期冲突`;
                    return conflictMsg;
                }
            }
            
            return false;
        };
        
        // 加载旅行计划详情
        const loadTrip = async () => {
            isLoading.value = true;
            const tripId = getTripId();
            
            try {
                console.log("正在加载旅行计划：", tripId);
                await tripStore.fetchTrips();
                const foundTrip = tripStore.trips.find(t => t.id === tripId);
                
                if (foundTrip) {
                    console.log("旅行计划加载成功");
                    trip.value = { ...foundTrip };
                } else {
                    console.error("未找到旅行计划：", tripId);
                    ElMessage.error('未找到该旅行计划');
                    router.push('/my-trips');
                }
            } catch (error) {
                console.error("加载旅行计划失败：", error);
                ElMessage.error('加载旅行计划失败');
                router.push('/my-trips');
            } finally {
                isLoading.value = false;
            }
        };
        
        // 格式化日期
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        };
        
        // 禁用过去日期
        const disablePastDates = (date) => {
            return date < new Date(new Date().setHours(0, 0, 0, 0));
        };
        
        // 禁用无效的结束日期（早于开始日期）
        const disableInvalidEndDates = (date) => {
            if (!trip.value || !trip.value.startDate) {
                return disablePastDates(date);
            }
            return date < trip.value.startDate;
        };
        
        // 保存编辑
        const saveTrip = async () => {
            if (!tripForm.value) return;
            
            try {
                saveLoading.value = true;
                
                // 表单验证
                await tripForm.value.validate();
                
                // 检查日期冲突
                const conflict = checkDateConflicts(trip.value.startDate, trip.value.endDate);
                if (conflict) {
                    ElMessage.error(conflict);
                    saveLoading.value = false;
                    return;
                }
                
                console.log("正在保存旅行计划...");
                await tripStore.updateTrip(getTripId(), trip.value);
                ElMessage.success('旅行计划保存成功');
                router.push('/my-trips');
            } catch (error) {
                console.error("保存旅行计划失败:", error);
                ElMessage.error('保存失败，请重试');
            } finally {
                saveLoading.value = false;
            }
        };
        
        // 返回上一级
        const goBack = () => {
            router.push('/my-trips');
        };
        
        // 组件挂载时加载数据
        onMounted(() => {
            loadTrip();
        });
        
        return {
            trip,
            isLoading,
            saveLoading,
            tripForm,
            rules,
            formatDate,
            disablePastDates,
            disableInvalidEndDates,
            saveTrip,
            goBack,
            checkDateConflicts,
            otherTrips,
            allTrips
        };
    }
};
</script>

<style scoped>
.edit-trip {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: #42b983;
}

.trip-form {
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
}

.back-btn {
    background-color: #909399;
    color: white;
    border: none;
}

.back-btn:hover {
    background-color: #606266;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #666;
}

.no-trip {
    text-align: center;
    margin-top: 40px;
    color: #666;
}

.no-trip p {
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .edit-trip {
        padding: 10px;
    }
    
    .trip-form {
        padding: 20px;
    }
}
</style>