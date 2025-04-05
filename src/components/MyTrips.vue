<template>
    <div class="my-trips">
        <h2>我的旅行计划</h2>
        
        <!-- 添加加载状态 -->
        <div v-if="isLoading" class="loading-container">
            <el-loading></el-loading>
            <p>正在加载旅行计划...</p>
        </div>
        
        <div v-else-if="trips.length === 0" class="no-trips">
            <p>暂无旅行计划，快去创建一个吧！</p>
            <router-link to="/create-trip" class="btn">创建新旅行计划</router-link>
        </div>
        <div v-else>
            <!-- 添加日历视图按钮 -->
            <div class="view-toggle">
                <el-radio-group v-model="viewMode" size="small">
                    <el-radio-button label="list">列表视图</el-radio-button>
                    <el-radio-button label="calendar">日历视图</el-radio-button>
                </el-radio-group>
            </div>
            
            <!-- 日历视图 -->
            <div v-if="viewMode === 'calendar'" class="calendar-view">
                <div class="calendar-header">
                    <el-button @click="changeMonth(-1)" type="text" size="small">
                        <el-icon><ArrowLeft /></el-icon>
                    </el-button>
                    <h3>{{ currentMonthYear }}</h3>
                    <el-button @click="changeMonth(1)" type="text" size="small">
                        <el-icon><ArrowRight /></el-icon>
                    </el-button>
                </div>
                
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                    </div>
                    <div class="calendar-days">
                        <!-- 上个月占位 -->
                        <div v-for="day in firstDayOfMonth" :key="'prev-' + day" class="day prev-month"></div>
                        
                        <!-- 当前月份日期 -->
                        <div 
                            v-for="day in daysInMonth" 
                            :key="day" 
                            class="day"
                            :class="{'today': isToday(day), 'has-trips': hasTripOnDate(day)}"
                            @click="showTripsForDate(day)"
                        >
                            <div class="day-number">{{ day }}</div>
                            <div v-if="hasTripOnDate(day)" class="trip-indicator">
                                <!-- 由于旅行计划不会有日期冲突，直接显示旅行名称 -->
                                <div 
                                    v-for="trip in getTripsForDate(day)" 
                                    :key="trip.id" 
                                    class="trip-name-tag"
                                    :style="{ backgroundColor: getTripColor(0) }"
                                >
                                    {{ getTruncatedName(trip.name) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 特定日期的旅行计划对话框 -->
                <el-dialog 
                    v-model="showDateTripsDialog" 
                    :title="selectedDateFormatted ? `${selectedDateFormatted} 的旅行计划` : ''" 
                    width="600px"
                >
                    <div v-if="selectedDateTrips.length > 0">
                        <div v-for="trip in selectedDateTrips" :key="trip.id" class="dialog-trip-item">
                            <div class="trip-color-dot" :style="{ backgroundColor: getTripColor(0) }"></div>
                            <div class="trip-details">
                                <h4>{{ trip.name }}</h4>
                                <div class="trip-info-grid">
                                    <div class="info-item">
                                        <el-icon><Location /></el-icon>
                                        <span>{{ trip.destination }}</span>
                                    </div>
                                    <div class="info-item">
                                        <el-icon><Calendar /></el-icon>
                                        <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <el-icon><Money /></el-icon>
                                        <span :class="getBudgetStatusClass(trip)">{{ getBudgetStatus(trip) }}</span>
                                    </div>
                                    <div class="info-item" v-if="trip.itinerary && trip.itinerary.length > 0">
                                        <el-icon><List /></el-icon>
                                        <span>行程: {{ trip.itinerary.length }}个</span>
                                    </div>
                                    <div class="info-item" v-if="trip.checklist && trip.checklist.length > 0">
                                        <el-icon><Checked /></el-icon>
                                        <span>物品清单: {{ getCompletedItemsCount(trip) }}/{{ trip.checklist.length }}</span>
                                    </div>
                                    <div class="info-item" v-if="isDateToday(trip, selectedDate)">
                                        <el-icon><Star /></el-icon>
                                        <span class="highlight">今日行程!</span>
                                    </div>
                                </div>
                                <div class="trip-description" v-if="trip.description">
                                    <p>{{ trip.description }}</p>
                                </div>
                                
                                <!-- 当天行程内容展示 -->
                                <div class="today-itinerary" v-if="getTodayItineraryItems(trip, selectedDate).length > 0">
                                    <h5>当日行程安排</h5>
                                    <ul class="itinerary-list">
                                        <li v-for="(item, idx) in getTodayItineraryItems(trip, selectedDate)" :key="idx">
                                            <strong v-if="item.attraction">{{ item.attraction }}</strong>
                                            <span v-if="item.activity"> - {{ item.activity }}</span>
                                            <span v-if="item.location"> ({{ item.location }})</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="trip-actions">
                                <el-button size="small" type="primary" @click="viewTripDetails(trip.id)">查看详情</el-button>
                                <el-button size="small" type="success" @click="viewBudget(trip.id)">预算管理</el-button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-trips-for-date">
                        <el-empty description="当天没有旅行计划"></el-empty>
                        <el-button type="primary" @click="goToCreateTrip">创建新旅行</el-button>
                    </div>
                </el-dialog>
            </div>
            
            <!-- 列表视图 -->
            <div v-else class="trip-list">
                <div v-for="trip in sortedTrips" :key="trip.id" class="trip-card">
                    <div class="trip-info">
                        <h3>{{ trip.name }}</h3>
                        <p><strong>目的地：</strong>{{ trip.destination }}</p>
                        <p><strong>出发日期：</strong>{{ formatDate(trip.startDate) }}</p>
                        <p><strong>返回日期：</strong>{{ formatDate(trip.endDate) }}</p>
                        <p>
                            <strong>预算状态：</strong>
                            <span :class="getBudgetStatusClass(trip)">{{ getBudgetStatus(trip) }}</span>
                        </p>
                        <p v-if="trip.description">
                            <strong>描述：</strong>{{ trip.description }}
                        </p>
                        <!-- 添加旅行清单提醒 -->
                        <div v-if="hasUncompletedItems(trip)" class="reminder-box">
                            <el-icon><Warning /></el-icon>
                            <span>你还有物品没有带哦~别忘了！</span>
                        </div>
                    </div>
                    <div class="trip-actions">
                        <router-link :to="`/trip-details/${trip.id}`" class="btn view-details">查看详情</router-link>
                        <router-link :to="`/budget-management/${trip.id}`" class="btn budget-btn">预算管理</router-link>
                        <button @click="confirmDelete(trip.id)" class="btn delete-btn">删除</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import { useTripStore } from '../stores/tripStore';
import { ref, onMounted, computed } from 'vue';
import { Warning, ArrowLeft, ArrowRight, Location, Calendar, Money, List, Checked, Star } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

export default {
    name: 'MyTrips',
    components: {
        Warning,
        ArrowLeft,
        ArrowRight,
        Location,
        Calendar,
        Money,
        List,
        Checked,
        Star
    },
    setup() {
        const router = useRouter();
        const tripStore = useTripStore();
        const trips = computed(() => tripStore.trips);
        const viewMode = ref('list'); // 默认列表视图
        
        // 按出发日期排序的旅行计划
        const sortedTrips = computed(() => {
            // 创建副本以避免修改原始数据
            const tripsCopy = [...trips.value];
            // 按出发日期升序排序
            return tripsCopy.sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateA - dateB;
            });
        });
        
        // 日历相关状态
        const currentMonth = ref(new Date().getMonth());
        const currentYear = ref(new Date().getFullYear());
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        
        // 选中日期的旅行计划
        const selectedDate = ref(null);
        const showDateTripsDialog = ref(false);
        const selectedDateTrips = ref([]);
        
        // 当前月份的名称和年份
        const currentMonthYear = computed(() => {
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            return `${currentYear.value}年 ${monthNames[currentMonth.value]}`;
        });
        
        // 当前月份第一天是星期几（0-6）
        const firstDayOfMonth = computed(() => {
            return new Date(currentYear.value, currentMonth.value, 1).getDay();
        });
        
        // 当前月份的天数
        const daysInMonth = computed(() => {
            return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
        });
        
        // 切换月份
        const changeMonth = (delta) => {
            let newMonth = currentMonth.value + delta;
            let newYear = currentYear.value;
            
            if (newMonth > 11) {
                newMonth = 0;
                newYear += 1;
            } else if (newMonth < 0) {
                newMonth = 11;
                newYear -= 1;
            }
            
            currentMonth.value = newMonth;
            currentYear.value = newYear;
        };
        
        // 判断是否是今天
        const isToday = (day) => {
            const today = new Date();
            return day === today.getDate() && 
                   currentMonth.value === today.getMonth() && 
                   currentYear.value === today.getFullYear();
        };
        
        // 判断指定日期是否有旅行计划
        const hasTripOnDate = (day) => {
            const date = new Date(currentYear.value, currentMonth.value, day);
            return trips.value.some(trip => {
                const startDate = new Date(trip.startDate);
                const endDate = new Date(trip.endDate);
                return date >= startDate && date <= endDate;
            });
        };
        
        // 获取指定日期的旅行计划
        const getTripsForDate = (day) => {
            const date = new Date(currentYear.value, currentMonth.value, day);
            return trips.value.filter(trip => {
                const startDate = new Date(trip.startDate);
                const endDate = new Date(trip.endDate);
                return date >= startDate && date <= endDate;
            });
        };
        
        // 显示指定日期的旅行计划对话框
        const showTripsForDate = (day) => {
            selectedDate.value = new Date(currentYear.value, currentMonth.value, day);
            selectedDateTrips.value = getTripsForDate(day);
            showDateTripsDialog.value = true;
        };
        
        // 格式化选中的日期
        const selectedDateFormatted = computed(() => {
            if (!selectedDate.value) return '';
            return `${selectedDate.value.getFullYear()}年${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日`;
        });
        
        // 获取旅行计划的颜色
        const getTripColor = (index) => {
            const colors = [
                '#409EFF', // 蓝色
                '#67C23A', // 绿色
                '#E6A23C', // 橙色
                '#F56C6C', // 红色
                '#909399', // 灰色
                '#8E44AD', // 紫色
                '#16A085', // 青绿色
                '#D35400'  // 深橙色
            ];
            return colors[index % colors.length];
        };
        
        // 格式化日期范围
        const formatDateRange = (start, end) => {
            const startDate = new Date(start);
            const endDate = new Date(end);
            return `${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getFullYear()}/${endDate.getMonth() + 1}/${endDate.getDate()}`;
        };
        
        // 加载旅行计划
        const loadTrips = async () => {
            try {
                await tripStore.fetchTrips();
                console.log("加载到旅行计划数量:", trips.value.length);
            } catch (error) {
                console.error("加载旅行计划失败:", error);
                ElMessage.error("加载旅行计划失败");
            }
        };
        
        // 获取加载状态
        const isLoading = computed(() => tripStore.isLoading);
        
        // 格式化日期
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString();
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
        
        // 检查旅行是否有未完成的物品清单
        const hasUncompletedItems = (trip) => {
            if (!trip.checklist || !Array.isArray(trip.checklist) || trip.checklist.length === 0) {
                return false;
            }
            
            // 旅行日期已经到了或即将到来（3天内）
            const today = new Date();
            const startDate = new Date(trip.startDate);
            const daysUntilTrip = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
            
            // 如果旅行开始日期已经过去，或者距离旅行开始还有3天以内，并且有未勾选的物品，则显示提醒
            if (daysUntilTrip <= 3 && daysUntilTrip >= -1) {
                return trip.checklist.some(item => !item.checked);
            }
            
            return false;
        };
        
        // 确认删除旅行计划
        const confirmDelete = (tripId) => {
            ElMessageBox.confirm(
                '确定要删除该旅行计划吗？此操作不可恢复。',
                '删除确认',
                {
                    confirmButtonText: '确定删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }
            ).then(() => {
                deleteTrip(tripId);
            }).catch(() => {
                // 用户取消删除操作
                ElMessage({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        };
        
        // 删除旅行计划
        const deleteTrip = async (tripId) => {
            try {
                await tripStore.deleteTrip(tripId);
                ElMessage.success('旅行计划已删除');
            } catch (error) {
                console.error('删除旅行计划失败:', error);
                ElMessage.error('删除失败，请重试');
            }
        };
        
        // 截断旅行名称（日历视图中显示）
        const getTruncatedName = (name) => {
            if (!name) return '';
            return name.length > 6 ? name.substring(0, 6) + '...' : name;
        };
        
        // 检查指定日期是否是旅行的某一天
        const isDateToday = (trip, date) => {
            if (!trip || !date) return false;
            
            const checkDate = new Date(date);
            const today = new Date();
            
            // 检查是否是今天日期
            return checkDate.getDate() === today.getDate() && 
                   checkDate.getMonth() === today.getMonth() && 
                   checkDate.getFullYear() === today.getFullYear();
        };
        
        // 获取当天的行程项目
        const getTodayItineraryItems = (trip, date) => {
            if (!trip || !trip.itinerary || !date) return [];
            
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            
            return trip.itinerary.filter(item => {
                if (!item.date) return false;
                const itemDate = new Date(item.date);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate.getTime() === checkDate.getTime();
            });
        };
        
        // 获取旅行清单已完成项目数量
        const getCompletedItemsCount = (trip) => {
            if (!trip || !trip.checklist || !Array.isArray(trip.checklist)) return 0;
            return trip.checklist.filter(item => item.checked).length;
        };
        
        // 导航到旅行详情页
        const viewTripDetails = (tripId) => {
            router.push(`/trip-details/${tripId}`);
        };
        
        // 导航到预算管理页
        const viewBudget = (tripId) => {
            router.push(`/budget-management/${tripId}`);
        };
        
        // 导航到创建旅行页
        const goToCreateTrip = () => {
            router.push('/create-trip');
        };
        
        onMounted(() => {
            loadTrips();
        });
        
        return {
            trips,
            sortedTrips,
            isLoading,
            formatDate,
            getBudgetStatus,
            getBudgetStatusClass,
            confirmDelete,
            hasUncompletedItems,
            viewMode,
            currentMonth,
            currentYear,
            currentMonthYear,
            weekdays,
            firstDayOfMonth,
            daysInMonth,
            changeMonth,
            isToday,
            hasTripOnDate,
            getTripsForDate,
            showTripsForDate,
            selectedDate,
            selectedDateFormatted,
            selectedDateTrips,
            showDateTripsDialog,
            getTripColor,
            formatDateRange,
            getTruncatedName,
            isDateToday,
            getTodayItineraryItems,
            getCompletedItemsCount,
            viewTripDetails,
            viewBudget,
            goToCreateTrip
        };
    }
};
</script>

<style scoped>
.my-trips {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: #42b983;
}

.no-trips {
    text-align: center;
    margin-top: 40px;
}

.no-trips p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 20px;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1rem;
    transition: background-color 0.3s ease;
    border: none;
    cursor: pointer;
}

.btn:hover {
    background-color: #369f6e;
}

.trip-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.trip-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.trip-card:hover {
    transform: translateY(-5px);
}

.trip-info {
    flex: 1;
    text-align: left; /* 旅行计划基本信息左对齐 */
}

.trip-info h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #333;
    max-width: 300px; /* 限制最大宽度 */
    word-wrap: break-word; /* 允许长单词换行 */
}

.trip-info p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 5px;
    max-width: 300px;
    word-wrap: break-word;
}

.trip-actions {
    display: flex;
    gap: 10px;
}

.view-details {
    background-color: #42b983;
}

.budget-btn {
    background-color: #ffa500;
}

.budget-btn:hover {
    background-color: #e59400;
}

.delete-btn {
    background-color: #ff4d4f;
}

.delete-btn:hover {
    background-color: #e04345;
}

.budget-status {
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 4px;
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

/* 添加加载样式 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #666;
}

.budget-within {
    color: #67c23a;
    font-weight: bold;
}

/* 添加旅行清单提醒样式 */
.reminder-box {
    margin-top: 10px;
    padding: 10px;
    background-color: #fef0f0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #f56c6c;
    animation: bounce 2s infinite;
    border-left: 3px solid #f56c6c;
}

.reminder-box .el-icon {
    font-size: 18px;
    color: #f56c6c;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-5px);
    }
    60% {
        transform: translateY(-3px);
    }
}

/* 视图切换按钮样式 */
.view-toggle {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

/* 日历视图样式 */
.calendar-view {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.calendar-header h3 {
    font-size: 1.3rem;
    color: #333;
    margin: 0;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 8px;
}

.weekday {
    text-align: center;
    font-weight: bold;
    color: #606266;
    padding: 8px 0;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.day {
    position: relative;
    height: 80px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 5px;
    cursor: pointer;
    transition: all 0.2s;
}

.day:hover {
    background-color: #f5f7fa;
}

.day.prev-month {
    background-color: #f5f7fa;
    cursor: default;
}

.day.today {
    border-color: #409EFF;
    background-color: #ecf5ff;
}

.day-number {
    font-weight: bold;
    color: #606266;
}

.today .day-number {
    color: #409EFF;
}

.trip-indicator {
    position: absolute;
    bottom: 5px;
    left: 5px;
    right: 5px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.trip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #409EFF;
}

/* 旅行名称标签（日历单元格中） */
.trip-name-tag {
    padding: 2px 4px;
    border-radius: 4px;
    color: white;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    width: 100%;
    margin-top: 2px;
}

/* 对话框内旅行计划项样式 */
.dialog-trip-item {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 10px;
    background-color: #f5f7fa;
    transition: all 0.2s;
}

.dialog-trip-item:hover {
    background-color: #ecf5ff;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trip-color-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 12px;
    align-self: flex-start;
}

.trip-details {
    flex: 1;
    margin-top: 10px;
}

.trip-details h4 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: #303133;
    border-bottom: 1px solid #dcdfe6;
    padding-bottom: 8px;
}

.trip-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #606266;
}

.info-item .el-icon {
    color: #409EFF;
}

.trip-description {
    margin: 10px 0;
    color: #606266;
    font-style: italic;
    padding: 8px;
    background-color: #f0f2f5;
    border-radius: 4px;
}

.today-itinerary {
    margin-top: 12px;
    padding: 10px;
    background-color: #ecf5ff;
    border-radius: 6px;
    border-left: 3px solid #409EFF;
}

.today-itinerary h5 {
    margin: 0 0 8px 0;
    color: #409EFF;
    font-size: 15px;
}

.itinerary-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.itinerary-list li {
    padding: 6px 0;
    border-bottom: 1px dashed #e0e0e0;
}

.itinerary-list li:last-child {
    border-bottom: none;
}

.highlight {
    color: #E6A23C;
    font-weight: bold;
}

.trip-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .trip-info-grid {
        grid-template-columns: 1fr;
    }

    .trip-actions {
        flex-direction: column;
    }
}
</style>