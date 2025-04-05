<template>
    <div class="trip-details">
        <h2>旅行计划详情</h2>
        
        <!-- 添加加载状态指示器 -->
        <div v-if="isLoading" class="loading-container">
            <el-spinner></el-spinner>
            <p>加载中，请稍候...</p>
        </div>
        
        <div v-else-if="trip" class="trip-content">
            <!-- 旅行计划基本信息 -->
            <div class="trip-info">
                <div class="main-info">
                <h3>{{ trip.name }}</h3>
                <p><strong>目的地：</strong>{{ trip.destination }}</p>
                <p><strong>出发日期：</strong>{{ formatDate(trip.startDate) }}</p>
                <p><strong>返回日期：</strong>{{ formatDate(trip.endDate) }}</p>
                <p><strong>预算状态：</strong>
                    <span :class="getBudgetStatusClass(trip)">{{ getBudgetStatus(trip) }}</span>
                </p>
                <p v-if="trip.description" class="description">
                    <strong>描述：</strong>{{ trip.description }}
                </p>
            </div>
            </div>
            
            <!-- 选项卡切换 -->
            <el-tabs v-model="activeTab" class="detail-tabs">
                <!-- 行程安排选项卡 -->
                <el-tab-pane label="行程安排" name="itinerary">
                    <div class="itinerary-section">
                        <div v-if="trip.itinerary?.length === 0" class="no-itinerary">
                            <el-empty description="暂无行程安排"></el-empty>
                            <el-button @click="showAddDialog = true" type="primary" class="add-btn" size="large" icon="plus">添加第一个行程</el-button>
                        </div>
                        <div v-else class="itinerary-list">
                            <div class="itinerary-header">
                                <h3>行程安排</h3>
                                <el-button @click="showAddDialog = true" type="primary" class="add-btn" size="small">
                                    <el-icon><Plus /></el-icon> 添加行程
                                </el-button>
                            </div>
                            
                            <el-timeline>
                                <el-timeline-item
                                    v-for="(item, index) in sortedItinerary"
                                    :key="index"
                                    :timestamp="formatDate(item.date)"
                                    :type="getTimelineItemType(index)"
                                    :color="getTimelineItemColor(index)"
                                >
                                    <el-card class="itinerary-card">
                                        <template #header>
                                            <div class="itinerary-card-header">
                                                <h4>第 {{ index + 1 }} 个行程</h4>
                                                <div class="header-actions">
                                                    <el-button @click="editingItem = index" type="primary" size="small">
                                                        <el-icon><Edit /></el-icon>
                                                    </el-button>
                                                    <el-popconfirm
                                                        title="确定要删除这个行程吗？"
                                                        confirm-button-text="确定"
                                                        cancel-button-text="取消"
                                                        icon-color="#F56C6C"
                                                        @confirm="deleteItineraryItem(index)"
                                                    >
                                                        <template #reference>
                                                            <el-button type="danger" size="small">
                                                                <el-icon><Delete /></el-icon>
                                                            </el-button>
                                                        </template>
                                                    </el-popconfirm>
                                                </div>
                                            </div>
                                        </template>
                                        
                                        <div v-if="editingItem === index" class="itinerary-edit-form">
                                            <div class="itinerary-row">
                                                <label>日期：</label>
                                                <el-date-picker
                                                    v-model="item.date"
                                                    type="date"
                                                    placeholder="选择日期"
                                                    class="date-picker-field"
                                                ></el-date-picker>
                                            </div>
                                            <div class="itinerary-row">
                                                <label>景点：</label>
                                                <el-input
                                                    v-model="item.attraction"
                                                    placeholder="请输入景点名称"
                                                ></el-input>
                                            </div>
                                            <div class="itinerary-row">
                                                <label>餐厅：</label>
                                                <el-input
                                                    v-model="item.restaurant"
                                                    placeholder="请输入餐厅名称"
                                                ></el-input>
                                            </div>
                                            <div class="itinerary-row">
                                                <label>活动：</label>
                                                <el-input
                                                    v-model="item.activity"
                                                    placeholder="请输入活动内容"
                                                ></el-input>
                                            </div>
                                            <div class="itinerary-row">
                                                <label>地点：</label>
                                                <el-input
                                                    v-model="item.location"
                                                    placeholder="请输入详细地点"
                                                    @change="updateMarkers"
                                                ></el-input>
                                            </div>
                                            <div class="itinerary-row">
                                                <label>备注：</label>
                                                <el-input
                                                    v-model="item.notes"
                                                    type="textarea"
                                                    :rows="3"
                                                    placeholder="请输入备注信息"
                                                ></el-input>
                                            </div>
                                            <div class="itinerary-actions">
                                                <el-button @click="saveItineraryItem(index); editingItem = null" type="primary">保存</el-button>
                                                <el-button @click="editingItem = null">取消</el-button>
                                            </div>
                                        </div>
                                        <div v-else class="itinerary-view">
                                            <div class="itinerary-detail-item" v-if="item.attraction">
                                                <el-icon><Location /></el-icon>
                                                <span>景点：{{ item.attraction }}</span>
                                            </div>
                                            <div class="itinerary-detail-item" v-if="item.restaurant">
                                                <el-icon><ForkSpoon /></el-icon>
                                                <span>餐厅：{{ item.restaurant }}</span>
                                            </div>
                                            <div class="itinerary-detail-item" v-if="item.activity">
                                                <el-icon><Calendar /></el-icon>
                                                <span>活动：{{ item.activity }}</span>
                                            </div>
                                            <div class="itinerary-detail-item" v-if="item.location">
                                                <el-icon><MapLocation /></el-icon>
                                                <span>地点：{{ item.location }}</span>
                                            </div>
                                            <div class="itinerary-detail-item" v-if="item.notes">
                                                <el-icon><Document /></el-icon>
                                                <span>备注：{{ item.notes }}</span>
                                            </div>
                                        </div>
                                    </el-card>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 旅行清单选项卡 -->
                <el-tab-pane label="旅行清单" name="checklist">
                    <div class="checklist-section">
                        <div class="checklist-header">
                            <h3>旅行物品清单</h3>
                            <div class="checklist-stats">
                                <span class="completed-items">{{ getCompletedItemsCount() }}/{{ getTotalItemsCount() }}</span>
                                <el-progress 
                                    :percentage="getCompletionPercentage()" 
                                    :status="getCompletionPercentage() === 100 ? 'success' : ''"
                                    :stroke-width="10"
                                ></el-progress>
                            </div>
                        </div>
                        
                        <div v-if="trip.checklist?.length === 0" class="no-checklist">
                            <el-empty description="暂无旅行清单"></el-empty>
                        </div>
                        <div v-else class="checklist-container">
                            <el-card class="checklist-card">
                                <div class="checklist-group">
                                    <div v-for="(item, index) in trip.checklist" :key="index" 
                                        class="checklist-item" 
                                        :class="{'item-checked': isItemChecked(item.id)}">
                                        <el-checkbox 
                                            :label="item.id" 
                                            v-model="checkedItems" 
                                            @change="updateChecklistStatus(item.id)" 
                                            class="checklist-checkbox"
                                        >
                                            <span :class="{ 'checked-item': isItemChecked(item.id) }">{{ item.name }}</span>
                                        </el-checkbox>
                                        <el-popconfirm
                                            title="确定要删除这个物品吗？"
                                            confirm-button-text="确定"
                                            cancel-button-text="取消"
                                            icon-color="#F56C6C"
                                            @confirm="deleteChecklistItem(index)"
                                        >
                                            <template #reference>
                                                <el-button type="danger" size="small">
                                                    <el-icon><Delete /></el-icon>
                                                </el-button>
                                            </template>
                                        </el-popconfirm>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                        
                        <div class="add-checklist-item">
                            <h4>添加新物品</h4>
                            <el-input
                                v-model="newChecklistItem"
                                placeholder="请输入物品名称"
                                maxlength="30"
                                class="checklist-input"
                                @keyup.enter="addChecklistItem"
                            >
                                <template #append>
                                    <el-button @click="addChecklistItem" :disabled="!newChecklistItem.trim()">
                                        <el-icon><Plus /></el-icon> 添加
                                    </el-button>
                                </template>
                            </el-input>
                            
                            <div class="quick-add-section">
                                <h4>常用物品快速添加</h4>
                                <div class="quick-add-buttons">
                                    <el-button @click="quickAddItem('护照/身份证')" size="small">护照/身份证</el-button>
                                    <el-button @click="quickAddItem('现金/信用卡')" size="small">现金/信用卡</el-button>
                                    <el-button @click="quickAddItem('手机充电器')" size="small">手机充电器</el-button>
                                    <el-button @click="quickAddItem('换洗衣物')" size="small">换洗衣物</el-button>
                                    <el-button @click="quickAddItem('洗漱用品')" size="small">洗漱用品</el-button>
                                    <el-button @click="quickAddItem('雨伞')" size="small">雨伞</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <!-- 操作按钮 -->
            <div class="trip-actions">
                <el-button @click="goBack" plain>返回</el-button>
                <el-button @click="editTrip" type="primary">编辑</el-button>
                <el-button @click="confirmDelete" type="danger">删除</el-button>
            </div>
        </div>
        <div v-else class="no-trip">
            <p>未找到该旅行计划。</p>
            <router-link to="/my-trips" class="btn">返回我的旅行计划</router-link>
        </div>

        <!-- 添加行程对话框 -->
        <el-dialog
            v-model="showAddDialog"
            title="添加新行程"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form :model="newItineraryItem" label-position="top">
                <el-form-item label="日期">
                    <el-date-picker
                        v-model="newItineraryItem.date"
                        type="date"
                        placeholder="选择日期"
                        style="width: 100%"
                        :disabled-date="disableInvalidDates"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item label="景点">
                    <el-input
                        v-model="newItineraryItem.attraction"
                        placeholder="请输入景点名称"
                    ></el-input>
                </el-form-item>
                <el-form-item label="餐厅">
                    <el-input
                        v-model="newItineraryItem.restaurant"
                        placeholder="请输入餐厅名称"
                    ></el-input>
                </el-form-item>
                <el-form-item label="活动">
                    <el-input
                        v-model="newItineraryItem.activity"
                        placeholder="请输入活动内容"
                    ></el-input>
                </el-form-item>
                <el-form-item label="地点">
                    <el-input
                        v-model="newItineraryItem.location"
                        placeholder="请输入详细地点"
                    ></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input
                        v-model="newItineraryItem.notes"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入备注信息"
                    ></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showAddDialog = false">取消</el-button>
                    <el-button type="primary" @click="confirmAddItinerary">确认添加</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 保存成功提示 -->
        <el-notification
            v-model:visible="showSuccessMessage"
            title="保存成功"
            message="行程安排保存成功！"
            type="success"
            :duration="3000"
        ></el-notification>
    </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as Icons from '@element-plus/icons-vue';  // 导入所有图标
import { useTripStore } from '../stores/tripStore';

export default {
    name: 'TripDetails',
    props: ['id'],
    components: {
        ...Icons  // 注册所有图标组件
    },
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const tripStore = useTripStore();
        
        const trip = ref(null);
        const isLoading = ref(true); // 添加加载状态
        const showSuccessMessage = ref(false);
        const newChecklistItem = ref('');
        const activeTab = ref('itinerary');
        const checkedItems = ref([]);
        const editingItem = ref(null); // 添加一个变量来跟踪正在编辑的行程项
        const showAddDialog = ref(false); // 控制添加行程对话框的显示
        const newItineraryItem = ref({ // 新行程项的数据
            date: new Date(),
            attraction: '',
            restaurant: '',
            activity: '',
            location: '',
            notes: '',
            createdAt: Date.now() // 添加创建时间字段
        });
        
        // 从路由参数或props获取旅行ID
        const getTripId = () => {
            return props.id || route.params.id;
        };
        
        // 加载旅行计划详情
        const loadTrip = async () => {
            isLoading.value = true;
            const tripId = getTripId();
            
            try {
                console.log("正在加载旅行计划：", tripId);
                await tripStore.fetchTrips();
                trip.value = tripStore.trips.find(t => t.id === tripId);
                
                if (trip.value) {
                    console.log("旅行计划加载成功");
                    // 确保 itinerary 和 checklist 字段存在
                    if (!trip.value.itinerary) trip.value.itinerary = [];
                    if (!trip.value.checklist) trip.value.checklist = [];
                    
                    // 初始化选中的清单项
                    checkedItems.value = trip.value.checklist
                        .filter(item => item.checked)
                        .map(item => item.id);
                } else {
                    console.error("未找到旅行计划：", tripId);
                    ElMessage.error('未找到该旅行计划');
                }
            } catch (error) {
                console.error("加载旅行计划失败：", error);
                ElMessage.error('加载旅行计划失败');
            } finally {
                isLoading.value = false;
            }
        };
        
        // 格式化日期
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        };
        
        // 替换原来地图标记功能的空函数
        const updateMarkers = () => {
            // 这个函数原来可能用于地图功能，现在是空函数
            console.log('updateMarkers被调用，但没有执行任何操作');
        };
        
        // 获取预算状态
        const getBudgetStatus = (trip) => {
            if (!trip.budget) return '未设置预算';
            
            // 计算总支出
            let totalExpense = 0;
            if (trip.expenses && Array.isArray(trip.expenses)) {
                totalExpense = trip.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
            }
            
            if (totalExpense === 0) return '未记录支出';
            
            // 计算预算使用百分比
            const usagePercentage = (totalExpense / trip.budget) * 100;
            
            if (usagePercentage > 100) {
                return `超支 (${usagePercentage.toFixed(0)}%)`;
            } else if (usagePercentage >= 80) {
                return `接近预算 (${usagePercentage.toFixed(0)}%)`;
            } else {
                return `正常 (${usagePercentage.toFixed(0)}%)`;
            }
        };
        
        // 获取预算状态样式
        const getBudgetStatusClass = (trip) => {
            if (!trip.budget) return { 'budget-status': true, 'budget-not-set': true };
            
            // 计算总支出
            let totalExpense = 0;
            if (trip.expenses && Array.isArray(trip.expenses)) {
                totalExpense = trip.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
            }
            
            if (totalExpense === 0) return { 'budget-status': true, 'budget-no-expense': true };
            
            // 计算预算使用百分比
            const usagePercentage = (totalExpense / trip.budget) * 100;
            
            return {
                'budget-status': true,
                'over-budget': usagePercentage > 100,
                'approaching-budget': usagePercentage >= 80 && usagePercentage <= 100,
                'within-budget': usagePercentage < 80,
            };
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
        
        // 获取已完成物品数量
        const getCompletedItemsCount = () => {
            if (!trip.value || !trip.value.checklist) return 0;
            return trip.value.checklist.filter(item => item.checked).length;
        };
        
        // 获取物品总数
        const getTotalItemsCount = () => {
            if (!trip.value || !trip.value.checklist) return 0;
            return trip.value.checklist.length;
        };
        
        // 获取完成百分比
        const getCompletionPercentage = () => {
            const total = getTotalItemsCount();
            if (total === 0) return 0;
            return Math.round((getCompletedItemsCount() / total) * 100);
        };
        
        // 快速添加物品
        const quickAddItem = async (itemName) => {
            if (!trip.value) return;
            
            // 检查物品是否已存在
            const exists = trip.value.checklist.some(item => item.name === itemName);
            if (exists) {
                ElMessage.warning(`${itemName} 已在清单中`);
                return;
            }
            
            const newItem = {
                id: Date.now().toString(),
                name: itemName,
                checked: false
            };
            
            trip.value.checklist.push(newItem);
            await tripStore.updateTrip(props.id, trip.value);
            ElMessage.success(`已添加 ${itemName} 到清单`);
        };
        
        // 添加行程安排项
        const addItineraryItem = () => {
            if (!trip.value) return;
            
            showAddDialog.value = true;
            newItineraryItem.value = {
                date: new Date(),
                attraction: '',
                restaurant: '',
                activity: '',
                location: '',
                notes: '',
                createdAt: Date.now() // 添加创建时间
            };
        };

        // 获取按日期排序的行程列表
        const sortedItinerary = computed(() => {
            if (!trip.value || !trip.value.itinerary || trip.value.itinerary.length === 0) {
                return [];
            }
            
            // 确保每个行程项都有 createdAt 字段
            const itineraryWithCreatedAt = trip.value.itinerary.map((item, index) => {
                if (!item.createdAt) {
                    item.createdAt = Date.now() - (trip.value.itinerary.length - index) * 1000;
                }
                return item;
            });
            
            // 按日期和创建时间排序
            return [...itineraryWithCreatedAt].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                
                // 如果日期相同，按创建时间排序
                if (dateA === dateB) {
                    return a.createdAt - b.createdAt;
                }
                
                // 否则按日期排序
                return dateA - dateB;
            });
        });
        
        // 确认添加行程
        const confirmAddItinerary = async () => {
            if (!trip.value) return;
            
            try {
                // 验证日期字段
                if (!newItineraryItem.value.date) {
                    ElMessage.warning('请选择行程日期');
                    return;
                }
                
                // 添加到行程列表
                trip.value.itinerary.push({
                    date: newItineraryItem.value.date,
                    attraction: newItineraryItem.value.attraction,
                    restaurant: newItineraryItem.value.restaurant,
                    activity: newItineraryItem.value.activity || '自由活动',
                    location: newItineraryItem.value.location,
                    notes: newItineraryItem.value.notes,
                    createdAt: Date.now() // 添加创建时间
                });
                
                // 保存到数据库
                await tripStore.updateTrip(props.id, trip.value);
                
                // 显示成功消息并关闭对话框
                ElMessage.success('行程添加成功');
                showAddDialog.value = false;
            } catch (error) {
                console.error('添加行程失败:', error);
                ElMessage.error('添加行程失败，请重试');
            }
        };
        
        // 保存行程安排项
        const saveItineraryItem = async (index) => {
            if (!trip.value) return;
            
            try {
                console.log("正在保存行程项...", index);
                
                // 从排序后的数组中找到对应的行程项
                const itemToSave = sortedItinerary.value[index];
                
                if (!itemToSave.date) {
                    itemToSave.date = new Date();
                }
                
                // 更新整个行程数据
                console.log("更新行程数据...");
                await tripStore.updateTrip(props.id, trip.value);
                console.log("行程数据更新成功");
                
                // 显示成功消息
                showSuccessMessage.value = true;
                ElMessage.success('行程安排已保存');
            } catch (error) {
                console.error("保存行程安排失败:", error);
                ElMessage.error('保存失败，请重试');
            }
        };
        
        // 删除行程安排项
        const deleteItineraryItem = async (index) => {
            if (!trip.value) return;
            
            try {
                // 从排序后的数组中找到对应的行程项
                const itemToDelete = sortedItinerary.value[index];
                const originalIndex = trip.value.itinerary.findIndex(
                    item => item === itemToDelete
                );
                
                // 显示加载状态
                ElMessage.info({
                    message: '正在删除...',
                    duration: 1000
                });
                
                // 删除原始数组中的行程项
                if (originalIndex !== -1) {
                    trip.value.itinerary.splice(originalIndex, 1);
                    await tripStore.updateTrip(props.id, trip.value);
                    ElMessage.success({
                        message: '行程已删除',
                        type: 'success',
                        duration: 2000
                    });
                } else {
                    ElMessage.error('未找到要删除的行程项');
                }
            } catch (error) {
                // 删除出错
                if (error && error.message) {
                    console.error('删除行程项出错:', error);
                    ElMessage.error('删除失败，请重试');
                }
            }
        };
        
        // 添加旅行清单项
        const addChecklistItem = async () => {
            if (!trip.value || !newChecklistItem.value.trim()) return;
            
            const newItem = {
                id: Date.now().toString(),
                name: newChecklistItem.value.trim(),
                checked: false
            };
            
            trip.value.checklist.push(newItem);
            await tripStore.updateTrip(props.id, trip.value);
            newChecklistItem.value = '';
            ElMessage.success('清单项已添加');
        };
        
        // 删除旅行清单项
        const deleteChecklistItem = async (index) => {
            if (!trip.value) return;
            
            try {
                // 显示加载状态
                ElMessage.info({
                    message: '正在删除...',
                    duration: 1000
                });
                
                trip.value.checklist.splice(index, 1);
                await tripStore.updateTrip(props.id, trip.value);
                
                // 更新选中状态
                checkedItems.value = trip.value.checklist
                    .filter(item => item.checked)
                    .map(item => item.id);
                
                ElMessage.success({
                    message: '物品已删除',
                    type: 'success',
                    duration: 2000
                });
            } catch (error) {
                // 删除出错
                console.error('删除清单项出错:', error);
                ElMessage.error('删除失败，请重试');
            }
        };
        
        // 更新清单项的选中状态
        const updateChecklistStatus = async (id) => {
            if (!trip.value) return;
            
            const item = trip.value.checklist.find(item => item.id === id);
            if (item) {
                item.checked = checkedItems.value.includes(id);
                await tripStore.updateTrip(props.id, trip.value);
            }
        };
        
        // 检查清单项是否已选中
        const isItemChecked = (id) => {
            return checkedItems.value.includes(id);
        };
        
        // 返回上一页
        const goBack = () => {
            router.push('/my-trips');
        };
        
        // 编辑旅行计划
        const editTrip = () => {
            router.push(`/edit-trip/${props.id}`);
        };
        
        // 确认删除
        const confirmDelete = async () => {
            try {
                await ElMessageBox.confirm('确定要删除这个旅行计划吗？此操作不可恢复。', '警告', {
                    confirmButtonText: '确定删除',
                    cancelButtonText: '取消',
                    type: 'error'
                });
                
                await tripStore.deleteTrip(props.id);
                ElMessage.success('旅行计划已删除');
                router.push('/my-trips');
            } catch (error) {
                // 用户取消删除
            }
        };
        
        // 保存旅行计划
        const saveTrip = async () => {
            await tripStore.updateTrip(props.id, trip.value);
        };
        
        // 监听路由变化重新加载数据
        watch(() => route.params.id, (newId, oldId) => {
            if (newId && newId !== oldId) {
                loadTrip();
            }
        });
        
        // 组件挂载时加载数据
        onMounted(() => {
            loadTrip();
        });
        
        // 禁用无效日期（不在旅行时间范围内的日期）
        const disableInvalidDates = (date) => {
            if (!trip.value || !trip.value.startDate || !trip.value.endDate) return true;
            
            const startDate = new Date(trip.value.startDate);
            const endDate = new Date(trip.value.endDate);
            
            return date < startDate || date > endDate;
        };
        
        return {
            trip,
            isLoading,
            showSuccessMessage,
            newChecklistItem,
            activeTab,
            checkedItems,
            editingItem,
            showAddDialog,
            newItineraryItem,
            sortedItinerary,
            loadTrip,
            formatDate,
            getBudgetStatus,
            getBudgetStatusClass,
            getTimelineItemType,
            getTimelineItemColor,
            getCompletedItemsCount,
            getTotalItemsCount,
            getCompletionPercentage,
            quickAddItem,
            addItineraryItem,
            confirmAddItinerary,
            saveItineraryItem,
            deleteItineraryItem,
            addChecklistItem,
            deleteChecklistItem,
            updateChecklistStatus,
            isItemChecked,
            disableInvalidDates,
            goBack,
            editTrip,
            confirmDelete
        };
    }
};
</script>

<style scoped>
.trip-details {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #42b983;
    font-size: 2rem;
}

.trip-content {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 40px;
}

.trip-info {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
}

.main-info {
    flex: 1;
}

.main-info h3 {
    font-size: 1.6rem;
    color: #333;
    margin-bottom: 15px;
}

.main-info p {
    margin-bottom: 8px;
    font-size: 1.1rem;
}

.description {
    margin-top: 15px;
    color: #666;
    line-height: 1.6;
}

.budget-status {
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: bold;
    display: inline-block;
}

.budget-not-set {
    color: #909399;
    background-color: #f4f4f5;
}

.budget-no-expense {
    color: #909399;
    background-color: #f4f4f5;
}

.over-budget {
    color: #fff;
    background-color: #f56c6c;
}

.approaching-budget {
    color: #fff;
    background-color: #e6a23c;
}

.within-budget {
    color: #fff;
    background-color: #67c23a;
}

.detail-tabs {
    margin-top: 30px;
}

.itinerary-section, .checklist-section {
    padding: 20px 0;
}

.no-itinerary, .no-checklist {
    text-align: center;
    color: #999;
    padding: 40px 0;
}

.itinerary-item {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.itinerary-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.itinerary-row label {
    width: 80px;
    font-weight: bold;
    color: #333;
    flex-shrink: 0;
}

.itinerary-row .el-input, .itinerary-row .el-date-picker {
    flex: 1;
}

.itinerary-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.add-btn {
    margin: 20px 0;
}

.checklist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.checked-item {
    text-decoration: line-through;
    color: #999;
}

.add-checklist-item {
    margin-top: 20px;
}

.trip-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.no-trip {
    text-align: center;
    color: #999;
    padding: 40px 0;
}

.btn {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #36a46f;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
    color: #999;
}

@media (max-width: 768px) {
    .trip-info {
        flex-direction: column;
    }
    
    .itinerary-row {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .itinerary-row label {
        margin-bottom: 5px;
    }
    
    .itinerary-actions {
        flex-direction: column;
    }
    
    .trip-actions {
        flex-direction: column;
        gap: 10px;
    }
}

.itinerary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.itinerary-header h3 {
    margin: 0;
    color: #42b983;
    font-size: 1.4rem;
}

.itinerary-collapse-title {
    display: flex;
    align-items: center;
    gap: 15px;
}

.itinerary-day {
    font-weight: bold;
    color: #42b983;
    min-width: 60px;
}

.itinerary-date {
    color: #909399;
    min-width: 100px;
}

.itinerary-attraction {
    font-weight: 500;
    flex: 1;
}

.date-picker-field {
    width: 100%;
}

.checklist-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.checklist-card {
    margin-bottom: 20px;
}

.checklist-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.checklist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.checklist-item:hover {
    background-color: #f9f9f9;
}

.checklist-checkbox {
    flex: 1;
}

.checklist-input {
    width: 100%;
    max-width: 500px;
}

.checklist-section h3,
.add-checklist-item h3 {
    margin: 0 0 15px 0;
    color: #42b983;
    font-size: 1.4rem;
}

/* 添加响应式样式 */
@media (max-width: 768px) {
    .itinerary-collapse-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .itinerary-day, .itinerary-date {
        min-width: auto;
    }
}

.itinerary-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.itinerary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.itinerary-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.itinerary-card-header h4 {
    margin: 0;
    font-size: 1.2rem;
    color: #409EFF;
}

.header-actions {
    display: flex;
    gap: 5px;
}

.itinerary-edit-form {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 15px;
}

.itinerary-view {
    padding: 10px 0;
}

.itinerary-detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    color: #606266;
}

.itinerary-detail-item .el-icon {
    color: #409EFF;
    font-size: 1.2em;
}

.checklist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.checklist-stats {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 200px;
}

.completed-items {
    font-weight: bold;
    color: #409EFF;
}

.checklist-container {
    margin-bottom: 30px;
}

.item-checked {
    background-color: #f0f9eb;
    transition: background-color 0.3s ease;
}

.checklist-item {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
}

.checklist-item:hover {
    background-color: #f5f7fa;
}

.quick-add-section {
    margin-top: 25px;
}

.quick-add-section h4 {
    margin-bottom: 15px;
    color: #606266;
}

.quick-add-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.el-timeline {
    padding-left: 0;
}

.el-timeline-item__content {
    margin-left: 25px;
}

@media (max-width: 768px) {
    .checklist-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .quick-add-buttons {
        justify-content: center;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
}

@media (max-width: 768px) {
    .dialog-footer {
        flex-direction: column;
    }
}

.checklist-item .delete-btn {
    opacity: 0.5;
    transition: opacity 0.2s;
}

.checklist-item:hover .delete-btn {
    opacity: 1;
}

.el-popconfirm {
    display: flex;
    align-items: center;
}

.header-actions button {
    margin: 0 3px;
}

.checklist-item .el-button {
    margin-left: 8px;
}
</style>