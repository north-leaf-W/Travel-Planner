<template>
    <div class="create-trip">
        <h2>创建新旅行计划</h2>
        
        <el-steps :active="currentStep" finish-status="success" simple class="steps">
            <el-step title="基本信息" icon="el-icon-edit"></el-step>
            <el-step title="旅行建议" icon="el-icon-star-on"></el-step>
            <el-step title="完成" icon="el-icon-check"></el-step>
        </el-steps>

        <!-- 步骤1：基本信息 -->
        <div v-if="currentStep === 1" class="step-content">
            <el-form :model="tripData" :rules="rules" ref="tripForm" label-position="top" class="trip-form">
            <!-- 旅行名称 -->
                <el-form-item label="旅行名称" prop="name">
                    <el-input v-model="tripData.name" placeholder="请输入旅行名称"></el-input>
                </el-form-item>

            <!-- 目的地 -->
                <el-form-item label="目的地" prop="destination">
                    <el-autocomplete
                        v-model="tripData.destination"
                        :fetch-suggestions="queryDestinations"
                    placeholder="请输入目的地"
                        @select="handleDestinationSelect"
                        class="destination-input"
                    >
                        <template #default="{ item }">
                            <div class="destination-suggestion">
                                <div class="name">{{ item.name }}</div>
                                <div class="info">
                                    <span>{{ item.attractionsCount }}个景点</span>
                                    <span>{{ item.tipsCount }}个旅行小贴士</span>
                                </div>
            </div>
                        </template>
                    </el-autocomplete>
                </el-form-item>

            <!-- 出发日期 -->
                <el-form-item label="出发日期" prop="startDate">
                    <el-date-picker
                        v-model="tripData.startDate"
                    type="date"
                        placeholder="选择出发日期"
                        :disabled-date="disablePastDates"
                    ></el-date-picker>
                </el-form-item>

            <!-- 返回日期 -->
                <el-form-item label="返回日期" prop="endDate">
                    <el-date-picker
                        v-model="tripData.endDate"
                    type="date"
                        placeholder="选择返回日期"
                        :disabled-date="disableInvalidEndDates"
                    ></el-date-picker>
                </el-form-item>

            <!-- 旅行描述 -->
                <el-form-item label="旅行描述" prop="description">
                    <el-input
                        type="textarea"
                        v-model="tripData.description"
                    placeholder="请输入旅行描述（可选）"
                        :rows="4"
                    ></el-input>
                </el-form-item>

                <!-- 按钮 -->
                <el-form-item>
                    <el-button type="primary" @click="nextStep" :loading="loading">下一步</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 步骤2：旅行建议 -->
        <div v-else-if="currentStep === 2" class="step-content">
            <div class="recommendations-container">
                <!-- 目的地信息 -->
                <div class="destination-header">
                    <h3>{{ tripData.destination }} 旅行建议</h3>
                    <p class="travel-dates">出行日期: {{ formatDate(tripData.startDate) }} - {{ formatDate(tripData.endDate) }}</p>
                </div>
                
                <!-- 旅行小贴士 -->
                <div class="tips-section">
                    <h4>旅行小贴士</h4>
                    <el-alert
                        v-for="(tip, index) in recommendations.tips"
                        :key="index"
                        :title="tip"
                        type="info"
                        :closable="false"
                        show-icon
                    ></el-alert>
                </div>

                <!-- 推荐景点 -->
                <div v-if="recommendations.attractions.length > 0" class="attractions-section">
                    <h4>推荐景点</h4>
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12" :md="8" v-for="(attraction, index) in recommendations.attractions" :key="index">
                            <el-card class="attraction-card" shadow="hover">
                                <template #header>
                                    <div class="attraction-header">
                                        <h5>{{ attraction.name }}</h5>
                                        <el-rate v-model="attraction.rating" disabled></el-rate>
                                    </div>
                                </template>
                                <img v-if="attraction.image" :src="attraction.image" alt="景点图片" class="attraction-image">
                                <div v-else class="attraction-color-block" :style="{ backgroundColor: attraction.color || '#42b983' }"></div>
                                <p class="attraction-address">{{ attraction.address }}</p>
                                <p class="attraction-description">{{ attraction.description }}</p>
                                <div class="attraction-actions">
                                    <el-popover
                                        placement="top"
                                        :width="300"
                                        trigger="click"
                                    >
                                        <template #reference>
                                            <el-button type="primary" size="small">添加到行程</el-button>
                                        </template>
                                        <div class="add-to-itinerary-form">
                                            <h5>添加 {{ attraction.name }} 到行程</h5>
                                            <el-form label-position="top">
                                                <el-form-item label="选择日期">
                                                    <el-date-picker
                                                        v-model="selectedDates[index]"
                                                        type="date"
                                                        placeholder="选择日期"
                                                        style="width: 100%"
                                                        :disabled-date="disableInvalidItineraryDates"
                                                    ></el-date-picker>
                                                </el-form-item>
                                                <el-form-item>
                                                    <el-button 
                                                        type="primary" 
                                                        @click="addAttractionToItinerary(attraction, index)" 
                                                        style="width: 100%"
                                                    >
                                                        确认添加
                                                    </el-button>
                                                </el-form-item>
                                            </el-form>
                                        </div>
                                    </el-popover>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>

                <!-- 推荐餐厅 -->
                <div v-if="recommendations.restaurants.length > 0" class="restaurants-section">
                    <h4>推荐餐厅</h4>
                    <el-table :data="recommendations.restaurants" style="width: 100%">
                        <el-table-column prop="name" label="餐厅名称"></el-table-column>
                        <el-table-column prop="cuisine" label="菜系"></el-table-column>
                        <el-table-column prop="priceRange" label="价格区间"></el-table-column>
                        <el-table-column prop="rating" label="评分">
                            <template #default="scope">
                                <el-rate v-model="scope.row.rating" disabled></el-rate>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180">
                            <template #default="scope">
                                <el-popover
                                    placement="top"
                                    :width="300"
                                    trigger="click"
                                >
                                    <template #reference>
                                        <el-button size="small" type="primary">添加到行程</el-button>
                                    </template>
                                    <div class="add-to-itinerary-form">
                                        <h5>添加 {{ scope.row.name }} 到行程</h5>
                                        <el-form label-position="top">
                                            <el-form-item label="选择日期">
                                                <el-date-picker
                                                    v-model="selectedRestaurantDate"
                                                    type="date"
                                                    placeholder="选择日期"
                                                    style="width: 100%"
                                                    :disabled-date="disableInvalidItineraryDates"
                                                ></el-date-picker>
                                            </el-form-item>
                                            <el-form-item>
                                                <el-button 
                                                    type="primary" 
                                                    @click="addRestaurantToItinerary(scope.row, true)" 
                                                    style="width: 100%"
                                                >
                                                    确认添加
                                                </el-button>
                                            </el-form-item>
                                        </el-form>
                                    </div>
                                </el-popover>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 已添加的行程项目 -->
                <div v-if="tripData.itinerary.length > 0" class="selected-itinerary">
                    <h4>已添加到行程</h4>
                    <el-timeline>
                        <el-timeline-item
                            v-for="(item, index) in tripData.itinerary"
                            :key="index"
                            :timestamp="formatDate(item.date)"
                            placement="top"
                            :type="getTimelineItemType(index)"
                            :color="getTimelineItemColor(index)"
                        >
                            <el-card>
                                <div class="itinerary-card-content">
                                    <div class="itinerary-info">
                                        <h5>{{ item.attraction || '自由活动' }}</h5>
                                        <p v-if="item.restaurant"><strong>餐厅:</strong> {{ item.restaurant }}</p>
                                        <p><strong>活动:</strong> {{ item.activity }}</p>
                                        <p v-if="item.location"><strong>地点:</strong> {{ item.location }}</p>
                                    </div>
                                    <div class="itinerary-actions">
                                        <el-button 
                                            type="danger" 
                                            size="small" 
                                            circle
                                            @click="removeItineraryItem(index)"
                                        >
                                            <el-icon><delete /></el-icon>
                                        </el-button>
                                    </div>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </div>

                <!-- 按钮 -->
                <div class="step-actions">
                    <el-button @click="prevStep">上一步</el-button>
                    <el-button type="primary" @click="nextStep">完成</el-button>
                </div>
            </div>
        </div>

        <!-- 步骤3：完成 -->
        <div v-else-if="currentStep === 3" class="step-content">
            <div class="completion-container">
                <div class="completion-icon">
                    <el-icon><circle-check-filled /></el-icon>
                </div>
                <h3>旅行计划创建成功!</h3>
                <p>您的 "{{ tripData.name }}" 旅行计划已创建成功。</p>
                <p>目的地: {{ tripData.destination }}</p>
                <p>出行日期: {{ formatDate(tripData.startDate) }} - {{ formatDate(tripData.endDate) }}</p>
                <p v-if="tripData.itinerary.length > 0">已添加 {{ tripData.itinerary.length }} 个行程项目</p>
                
                <div class="completion-actions">
                    <el-button @click="goToTripDetails">查看详情</el-button>
                    <el-button type="primary" @click="createAnotherTrip">创建另一个旅行计划</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useTripStore } from '../stores/tripStore';
import { getDestinationRecommendations, getPopularDestinations } from '../services/recommendationService';

export default {
    name: 'CreateTrip',
    setup() {
        const router = useRouter();
        const tripStore = useTripStore();
        const tripForm = ref(null);
        const loading = ref(false);
        const currentStep = ref(1);
        const recommendations = ref({
            attractions: [],
            restaurants: [],
            tips: []
        });
        const destinations = ref([]);
        const componentMounted = ref(false);
        const selectedDates = ref({}); // 存储每个景点选择的日期
        const selectedRestaurantDate = ref(null); // 存储餐厅选择的日期
        const existingTrips = computed(() => tripStore.trips);
        
        // 表单数据
        const tripData = reactive({
            name: '',
            destination: '',
            startDate: '',
            endDate: '',
            description: '',
            budget: 0,
            expenses: 0,
            itinerary: [],
            checklist: []
        });
        
        // 安全地从URL获取目的地参数
        const safelyGetDestinationFromUrl = () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const destination = urlParams.get('destination');
                if (destination) {
                    console.log('从URL获取到目的地:', destination);
                    tripData.destination = destination;
                }
            } catch (error) {
                console.error('获取URL参数出错:', error);
            }
        };
        
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
                { required: true, message: '请选择返回日期', trigger: 'change' }
            ],
            description: [
                { max: 500, message: '旅行描述不能超过500个字符', trigger: 'blur' }
            ]
        };
        
        // 禁用过去日期和晚于返回日期的日期
        const disablePastDates = (date) => {
            // 禁用过去的日期
            const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            // 如果已经选择了返回日期，则禁用晚于返回日期的日期
            if (tripData.endDate) {
                return isPastDate || date > tripData.endDate;
            }
            
            return isPastDate;
        };
        
        // 禁用无效的结束日期（早于开始日期）
        const disableInvalidEndDates = (date) => {
            // 禁用过去的日期
            const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            // 如果已经选择了出发日期，则禁用早于出发日期的日期
            if (tripData.startDate) {
                return isPastDate || date < tripData.startDate;
            }
            
            return isPastDate;
        };
        
        // 禁用无效的行程日期（早于开始日期或晚于结束日期）
        const disableInvalidItineraryDates = (date) => {
            if (!tripData.startDate || !tripData.endDate) return true;
            return date < tripData.startDate || date > tripData.endDate;
        };
        
        // 检查是否与已有旅行日期冲突
        const checkDateConflicts = () => {
            if (!tripData.startDate || !tripData.endDate) return false;
            
            const newStartDate = new Date(tripData.startDate);
            const newEndDate = new Date(tripData.endDate);
            
            // 遍历已有的旅行计划检查日期冲突
            for (const trip of existingTrips.value) {
                const existingStartDate = new Date(trip.startDate);
                const existingEndDate = new Date(trip.endDate);
                
                // 检查日期范围是否有重叠
                // 有四种可能的重叠情况
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
                    const conflictMsg = `与旅行"${trip.name}"（${formatDate(trip.startDate)} 至 ${formatDate(trip.endDate)}）日期冲突`;
                    return conflictMsg;
                }
            }
            
            return false;
        };
        
        // 加载热门目的地，带错误处理
        const loadPopularDestinations = async () => {
            try {
                const result = await getPopularDestinations();
                if (Array.isArray(result)) {
                    destinations.value = result;
                } else {
                    console.warn('获取热门目的地返回了非数组结果');
                    destinations.value = [];
                }
            } catch (error) {
                console.error('加载热门目的地失败:', error);
                destinations.value = [];
                ElMessage.warning('无法加载热门目的地，但您仍可继续创建旅行计划');
            }
        };
        
        // 目的地搜索建议
        const queryDestinations = (query, callback) => {
            try {
                if (!Array.isArray(destinations.value)) {
                    callback([]);
                    return;
                }
                
                if (query.trim() === '') {
                    callback(destinations.value);
                    return;
                }
                
                const results = destinations.value.filter(item => 
                    item && item.name && item.name.toLowerCase().includes(query.toLowerCase())
                );
                callback(results);
            } catch (error) {
                console.error('查询目的地时出错:', error);
                callback([]);
            }
        };
        
        // 选择目的地
        const handleDestinationSelect = (item) => {
            if (item && item.name) {
                tripData.destination = item.name;
            }
        };
        
        // 加载目的地推荐，带完整错误处理
        const loadRecommendations = async () => {
            if (!tripData.destination) {
                console.log('目的地为空，无法加载推荐');
                recommendations.value = {
                    attractions: [],
                    restaurants: [],
                    tips: ['请选择一个目的地以获取推荐信息。']
                };
                return;
            }
            
            loading.value = true;
            
            try {
                console.log('加载目的地推荐:', tripData.destination);
                const result = await getDestinationRecommendations(tripData.destination);
                console.log('获取到目的地推荐结果:', result);
                
                if (result && result.recommendations) {
                    console.log('设置推荐数据:', result.recommendations);
                    recommendations.value = result.recommendations;
                } else {
                    console.warn('未找到目的地推荐数据, 使用默认值');
                    recommendations.value = {
                        attractions: [],
                        restaurants: [],
                        tips: ['暂无该目的地的具体推荐信息，您可以自行添加行程项目。']
                    };
                }
            } catch (error) {
                console.error('加载推荐失败:', error);
                recommendations.value = {
                    attractions: [],
                    restaurants: [],
                    tips: ['加载推荐数据时出错，请稍后重试或手动添加行程。']
                };
                ElMessage.warning('无法加载目的地推荐，但您仍可继续创建旅行计划');
            } finally {
                loading.value = false;
            }
        };
        
        // 获取时间线项目类型
        const getTimelineItemType = (index) => {
            const types = ['primary', 'success', 'warning', 'danger', 'info'];
            return types[index % types.length];
        };
        
        // 获取时间线项目颜色
        const getTimelineItemColor = (index) => {
            const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];
            return colors[index % colors.length];
        };
        
        // 添加景点到行程
        const addAttractionToItinerary = (attraction, index) => {
            try {
                if (!attraction || !attraction.name) return;
                
                // 使用选择的日期或默认日期
                const selectedDate = selectedDates.value[index] || calculateDate(tripData.itinerary.length);
                
                tripData.itinerary.push({
                    date: selectedDate,
                    attraction: attraction.name,
                    restaurant: '',
                    activity: '参观游览',
                    location: attraction.address || ''
                });
                
                // 清除选择的日期
                selectedDates.value[index] = null;
                
                ElMessage.success(`已将 ${attraction.name} 添加到行程`);
            } catch (error) {
                console.error('添加景点到行程时出错:', error);
                ElMessage.error('添加行程项失败');
            }
        };
        
        // 添加餐厅到行程
        const addRestaurantToItinerary = (restaurant, useCustomDate = false) => {
            try {
                if (!restaurant || !restaurant.name) return;
                
                // 使用选定的日期或寻找默认日期
                let tripDate = null;
                
                if (useCustomDate && selectedRestaurantDate.value) {
                    tripDate = selectedRestaurantDate.value;
                    selectedRestaurantDate.value = null;
                } else {
                    // 查找是否已有同天行程
                    const todayIndex = tripData.itinerary.findIndex(item => 
                        !item.restaurant || item.restaurant.trim() === ''
                    );
                    
                    if (todayIndex !== -1) {
                        // 如果找到没有餐厅的行程，添加到该行程
                        tripData.itinerary[todayIndex].restaurant = restaurant.name;
                        ElMessage.success(`已将 ${restaurant.name} 添加到行程`);
                        return;
                    } else {
                        // 默认日期
                        tripDate = calculateDate(tripData.itinerary.length);
                    }
                }
                
                // 创建新行程
                tripData.itinerary.push({
                    date: tripDate,
                    attraction: '',
                    restaurant: restaurant.name,
                    activity: '用餐体验',
                    location: restaurant.address || ''
                });
                ElMessage.success(`已将 ${restaurant.name} 添加到行程`);
            } catch (error) {
                console.error('添加餐厅到行程时出错:', error);
                ElMessage.error('添加行程项失败');
            }
        };
        
        // 移除行程项目
        const removeItineraryItem = (index) => {
            try {
                if (index >= 0 && index < tripData.itinerary.length) {
                    tripData.itinerary.splice(index, 1);
                    ElMessage.success('已移除行程项');
                }
            } catch (error) {
                console.error('移除行程项出错:', error);
                ElMessage.error('移除行程项失败');
            }
        };
        
        // 计算行程日期
        const calculateDate = (index) => {
            try {
                if (!tripData.startDate) return new Date();
                
                const date = new Date(tripData.startDate);
                date.setDate(date.getDate() + index);
                
                // 确保不超过结束日期
                if (tripData.endDate && date > new Date(tripData.endDate)) {
                    return new Date(tripData.endDate);
                }
                
                return date;
            } catch (error) {
                console.error('计算日期出错:', error);
                return new Date();
            }
        };
        
        // 格式化日期
        const formatDate = (date) => {
            try {
                if (!date) return '';
                return new Date(date).toLocaleDateString();
            } catch (error) {
                console.error('格式化日期出错:', error);
                return '';
            }
        };
        
        // 下一步
        const nextStep = async () => {
            try {
                // 步骤一：基本信息验证
                if (currentStep.value === 1) {
                    loading.value = true;
                    
                    // 表单验证
                    await tripForm.value.validate();
                    
                    // 检查日期冲突
                    const conflict = checkDateConflicts();
                    if (conflict) {
                        ElMessage.error(conflict);
                        loading.value = false;
                        return;
                    }
                    
                    try {
                        // 加载目的地推荐
                        await loadRecommendations();
                        currentStep.value += 1;
                    } catch (error) {
                        console.error('加载推荐失败:', error);
                        ElMessage.warning('无法加载推荐信息，但您仍可继续创建旅行计划');
                        currentStep.value += 1;
                    } finally {
                        loading.value = false;
                    }
                } 
                // 步骤二：旅行建议
                else if (currentStep.value === 2) {
                    currentStep.value += 1;
                    await saveTrip();
                } 
                // 其他情况
                else {
                    currentStep.value += 1;
                }
            } catch (error) {
                console.error('表单验证失败:', error);
                // 如果是表单验证错误，错误信息会由Element UI自动显示
                // 如果是其他错误，则显示通用错误消息
                if (!(error && error.message && error.message.includes('validate'))) {
                    ElMessage.error('表单验证失败，请检查输入');
                }
                loading.value = false;
            }
        };
        
        // 上一步
        const prevStep = () => {
            try {
                if (currentStep.value > 1) {
                    currentStep.value--;
                }
            } catch (error) {
                console.error('处理上一步时出错:', error);
                ElMessage.error('操作出错，请重试');
            }
        };
        
        // 保存旅行计划
        const saveTrip = async () => {
            loading.value = true;
            
            try {
                await tripStore.addTrip({
                    name: tripData.name,
                    destination: tripData.destination,
                    startDate: tripData.startDate,
                    endDate: tripData.endDate,
                    description: tripData.description,
                    budget: tripData.budget,
                    expenses: tripData.expenses,
                    itinerary: tripData.itinerary,
                    checklist: tripData.checklist
                });
                return true;
            } catch (error) {
                console.error('保存旅行计划失败:', error);
                ElMessage.error('创建旅行计划失败');
                throw error;
            } finally {
                loading.value = false;
            }
        };
        
        // 查看旅行详情
        const goToTripDetails = () => {
            try {
                // 获取最新创建的旅行计划ID
                const latestTrip = tripStore.trips[tripStore.trips.length - 1];
                if (latestTrip && latestTrip.id) {
                    console.log('导航到旅行详情页面:', latestTrip.id);
                    router.push(`/trip-details/${latestTrip.id}`);
                } else {
                    console.error('未找到最新的旅行计划');
                    ElMessage.warning('无法找到旅行计划，正在跳转到旅行列表');
                    router.push('/my-trips');
                }
            } catch (error) {
                console.error('导航到旅行详情页面时出错:', error);
                ElMessage.error('导航失败，请前往"我的旅行计划"查看');
                router.push('/my-trips');
            }
        };
        
        // 创建另一个旅行计划
        const createAnotherTrip = () => {
            try {
        // 重置表单
                tripData.name = '';
                tripData.destination = '';
                tripData.startDate = '';
                tripData.endDate = '';
                tripData.description = '';
                tripData.itinerary = [];
                tripData.checklist = [];
                
                // 返回第一步
                currentStep.value = 1;
            } catch (error) {
                console.error('重置表单时出错:', error);
                ElMessage.error('重置表单出错，请刷新页面');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        };
        
        // 初始化函数，包含所有需要在组件挂载时执行的操作
        const initialize = async () => {
            try {
                componentMounted.value = true;
                
                // 异步加载热门目的地，不阻塞UI
                setTimeout(async () => {
                    await loadPopularDestinations();
                }, 100);
                
                // 尝试从URL获取目的地
                setTimeout(() => {
                    safelyGetDestinationFromUrl();
                }, 200);
                
                // 初始化加载旅行计划数据（用于日期冲突检查）
                await tripStore.fetchTrips();
            } catch (error) {
                console.error('初始化组件时出错:', error);
            }
        };
        
        // 监听出发日期和返回日期的变化
        watch(() => tripData.startDate, (newStartDate) => {
            // 如果新的出发日期晚于返回日期，清空返回日期
            if (newStartDate && tripData.endDate && new Date(newStartDate) > new Date(tripData.endDate)) {
                tripData.endDate = '';
                ElMessage.warning('出发日期晚于返回日期，已清空返回日期');
            }
        });
        
        watch(() => tripData.endDate, (newEndDate) => {
            // 如果新的返回日期早于出发日期，清空出发日期
            if (newEndDate && tripData.startDate && new Date(newEndDate) < new Date(tripData.startDate)) {
                tripData.startDate = '';
                ElMessage.warning('返回日期早于出发日期，已清空出发日期');
            }
        });
        
        onMounted(() => {
            // 使用nextTick确保DOM已更新后再执行初始化
            nextTick(() => {
                initialize();
            });
        });
        
        return {
            tripForm,
            tripData,
            rules,
            loading,
            currentStep,
            recommendations,
            disablePastDates,
            disableInvalidEndDates,
            disableInvalidItineraryDates,
            queryDestinations,
            handleDestinationSelect,
            addAttractionToItinerary,
            addRestaurantToItinerary,
            removeItineraryItem,
            calculateDate,
            formatDate,
            nextStep,
            prevStep,
            goToTripDetails,
            createAnotherTrip,
            selectedDates,
            selectedRestaurantDate,
            getTimelineItemType,
            getTimelineItemColor,
            existingTrips,
            checkDateConflicts
        };
    }
};
</script>

<style scoped>
.create-trip {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 2rem;
    color: #42b983;
}

.steps {
    margin-bottom: 30px;
}

.step-content {
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    min-height: 400px;
}

.trip-form {
    max-width: 600px;
    margin: 0 auto;
}

.destination-input {
    width: 100%;
}

.destination-suggestion {
    padding: 5px 0;
}

.destination-suggestion .name {
    font-weight: bold;
    font-size: 14px;
}

.destination-suggestion .info {
    font-size: 12px;
    color: #999;
    display: flex;
    gap: 10px;
}

.recommendations-container {
    margin-bottom: 30px;
}

.destination-header {
    margin-bottom: 20px;
    text-align: center;
}

.destination-header h3 {
    font-size: 1.8rem;
    color: #42b983;
    margin-bottom: 10px;
}

.travel-dates {
    color: #666;
    font-size: 1.1rem;
}

.tips-section, .attractions-section, .restaurants-section, .selected-itinerary {
    margin-bottom: 30px;
}

.tips-section h4, .attractions-section h4, .restaurants-section h4, .selected-itinerary h4 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
}

.tips-section .el-alert {
    margin-bottom: 10px;
}

.attraction-card {
    margin-bottom: 20px;
    height: 100%;
    transition: transform 0.3s;
}

.attraction-card:hover {
    transform: translateY(-5px);
}

.attraction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.attraction-header h5 {
    margin: 0;
    font-size: 1.1rem;
}

.attraction-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
    margin-bottom: 10px;
}

.attraction-color-block {
    width: 100%;
    height: 150px;
    border-radius: 5px;
    margin-bottom: 10px;
}

.attraction-address {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
}

.attraction-description {
    font-size: 0.9rem;
    margin-bottom: 15px;
}

.attraction-actions {
    display: flex;
    justify-content: flex-end;
}

.selected-itinerary .el-timeline {
    padding-left: 0;
    margin-top: 20px;
}

.selected-itinerary .el-timeline-item__content {
    margin-left: 25px;
}

.selected-itinerary .el-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.selected-itinerary .el-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.completion-container {
    text-align: center;
    padding: 20px 0;
    margin-top: -40px;
}

.completion-icon {
    font-size: 5rem;
    color: #42b983;
    margin-bottom: 10px;
}

.completion-container h3 {
    font-size: 2rem;
    color: #42b983;
    margin-bottom: 10px;
}

.completion-container p {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: #666;
}

.completion-actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 20px;
}

@media (max-width: 768px) {
    .step-content {
        padding: 20px;
    }
    
    .attraction-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .attraction-header h5 {
        margin-bottom: 10px;
    }
    
    .completion-actions {
        flex-direction: column;
        gap: 10px;
    }
}

.add-to-itinerary-form {
    padding: 10px 0;
}

.add-to-itinerary-form h5 {
    margin: 0 0 15px 0;
    font-size: 16px;
    text-align: center;
    color: #303133;
}

.itinerary-card-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.itinerary-info {
    flex: 1;
}

.itinerary-info h5 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #303133;
}

.itinerary-info p {
    margin: 5px 0;
    font-size: 14px;
    color: #606266;
}

.itinerary-actions {
    display: flex;
    justify-content: flex-end;
}
</style>