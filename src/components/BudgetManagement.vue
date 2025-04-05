<template>
    <div class="budget-management">
        <h2>预算管理</h2>
        
        <!-- 添加加载状态指示器 -->
        <div v-if="isLoading" class="loading-container">
            <el-spinner></el-spinner>
            <p>加载中，请稍候...</p>
        </div>
        
        <div v-else-if="trip" class="budget-content">
            <!-- 旅行计划基本信息 -->
            <div class="trip-info">
                <h3>{{ trip.name }}</h3>
                <p><strong>目的地：</strong>{{ trip.destination }}</p>
                <p><strong>出发日期：</strong>{{ formatDate(trip.startDate) }}</p>
                <p><strong>返回日期：</strong>{{ formatDate(trip.endDate) }}</p>
            </div>

            <!-- 选项卡 -->
            <el-tabs v-model="activeTab" class="budget-tabs">
                <!-- 总体预算选项卡 -->
                <el-tab-pane label="总体预算" name="overall">
            <div class="budget-form">
                <div class="form-group">
                            <label for="budget">总预算（元）：</label>
                            <el-input
                        type="number"
                        id="budget"
                        v-model="budget"
                        @input="validateBudget"
                                placeholder="请输入总预算"
                        min="0"
                            ></el-input>
                </div>
                        <el-button @click="updateBudget" type="primary" class="update-btn">更新预算</el-button>
            </div>

            <!-- 预算统计 -->
            <div class="budget-summary">
                <h3>预算统计</h3>
                        <p><strong>总预算：</strong>{{ budget || 0 }} 元</p>
                        <p><strong>实际总花费：</strong>{{ totalExpenses }} 元</p>
                <p><strong>剩余预算：</strong>{{ remainingBudget }} 元</p>
                <p>
                    <strong>状态：</strong>
                    <span :class="budgetStatusClass">{{ budgetStatus }}</span>
                </p>

                        <!-- 预算饼图 -->
                        <div class="chart-container" v-if="categoryExpenses.length > 0">
                            <h4>各分类支出占比</h4>
                            <div class="budget-chart" ref="pieChartRef"></div>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 分类预算选项卡 -->
                <el-tab-pane label="分类预算" name="categories">
                    <div class="category-budget">
                        <h3>分类预算设置</h3>
                        
                        <!-- 分类预算总额状态信息 -->
                        <div class="budget-status-summary" :class="categoryBudgetStatus.status">
                            <el-alert
                                :title="categoryBudgetStatus.message"
                                :type="categoryBudgetStatus.status === 'error' ? 'error' : 
                                      categoryBudgetStatus.status === 'success' ? 'success' : 'warning'"
                                :closable="false"
                                show-icon
                            />
                            
                            <!-- 预算分配进度条 -->
                            <div class="budget-allocation-progress" v-if="budget > 0">
                                <span>预算分配进度:</span>
                                <el-progress 
                                    :percentage="(categoryBudgetSum / budget) * 100"
                                    :status="categoryBudgetStatus.status === 'error' ? 'exception' : 
                                            categoryBudgetStatus.status === 'success' ? 'success' : 'warning'"
                                    :format="percentageFormat"
                                />
                            </div>
                        </div>
                        
                        <!-- 分类预算列表 -->
                        <div class="category-list">
                            <div v-for="(category, index) in categories" :key="index" class="category-item">
                                <el-row :gutter="20">
                                    <el-col :span="6">
                                        <el-input v-model="category.name" placeholder="分类名称"></el-input>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-input 
                                            type="number" 
                                            v-model="category.budget" 
                                            placeholder="预算金额"
                                            @input="validateCategoryBudget(index)"
                                        ></el-input>
                                    </el-col>
                                    <el-col :span="6">
                                        <div class="label">已用：{{ getCategoryExpense(category.name) }} 元</div>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-button 
                                            @click="removeCategory(index)" 
                                            type="danger" 
                                            circle 
                                            icon="el-icon-delete"
                                        ></el-button>
                                    </el-col>
                                </el-row>
                                <el-progress 
                                    :percentage="getCategoryPercentage(category)" 
                                    :status="getCategoryStatus(category)"
                                ></el-progress>
                            </div>
                        </div>
                        
                        <!-- 添加新分类 -->
                        <div class="add-category">
                            <el-button @click="addCategory" type="primary">添加新分类</el-button>
                        </div>
                        
                        <!-- 保存分类按钮 -->
                        <div class="save-categories">
                            <el-button 
                                @click="saveCategories" 
                                type="success" 
                                :disabled="categoryBudgetStatus.status === 'error'"
                            >保存分类预算</el-button>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 消费记录选项卡 -->
                <el-tab-pane label="消费记录" name="expenses">
                    <div class="expense-records">
                        <h3>消费记录</h3>
                        
                        <!-- 添加新消费 -->
                        <div class="add-expense">
                            <el-form :model="newExpense" label-position="top" class="expense-form">
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <el-form-item label="消费类别">
                                            <el-select v-model="newExpense.category" placeholder="选择类别">
                                                <el-option 
                                                    v-for="category in categories" 
                                                    :key="category.name" 
                                                    :label="category.name" 
                                                    :value="category.name"
                                                ></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-form-item label="金额">
                                            <el-input 
                                                type="number" 
                                                v-model="newExpense.amount" 
                                                placeholder="消费金额"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-form-item label="日期">
                                            <el-date-picker 
                                                v-model="newExpense.date" 
                                                type="date" 
                                                placeholder="选择日期"
                                                :disabled-date="disableInvalidDates"
                                            ></el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="24">
                                        <el-form-item label="描述">
                                            <el-input 
                                                v-model="newExpense.description" 
                                                placeholder="消费描述"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-form-item>
                                    <el-button @click="addExpense" type="primary">添加消费记录</el-button>
                                </el-form-item>
                            </el-form>
            </div>
                        
                        <!-- 消费记录列表 -->
                        <div class="expense-list">
                            <el-table 
                                :data="expenses" 
                                style="width: 100%"
                                :empty-text="'暂无消费记录'"
                            >
                                <el-table-column prop="date" label="日期" sortable>
                                    <template #default="scope">
                                        {{ formatDate(scope.row.date) }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="category" label="类别"></el-table-column>
                                <el-table-column prop="description" label="描述"></el-table-column>
                                <el-table-column prop="amount" label="金额" sortable>
                                    <template #default="scope">
                                        {{ scope.row.amount }} 元
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作">
                                    <template #default="scope">
                                        <el-button 
                                            @click="deleteExpense(scope.$index)" 
                                            type="danger" 
                                            size="small"
                                        >删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <!-- 操作按钮 -->
            <div class="trip-actions">
                <el-button @click="goBack" class="back-btn">返回</el-button>
            </div>
        </div>
        <div v-else class="no-trip">
            <p>未找到该旅行计划。</p>
            <router-link to="/my-trips" class="btn">返回我的旅行计划</router-link>
        </div>
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useTripStore } from '../stores/tripStore';
import * as echarts from 'echarts';  // 直接导入完整的echarts包

export default {
    name: 'BudgetManagement',
    props: ['id'],
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const tripStore = useTripStore();
        
        const trip = ref(null);
        const isLoading = ref(true); // 添加加载状态
        const budget = ref(0);
        const activeTab = ref('overall');
        
        // 默认分类
        const defaultCategories = [
            { name: '交通', budget: 0 },
            { name: '住宿', budget: 0 },
            { name: '餐饮', budget: 0 },
            { name: '景点门票', budget: 0 },
            { name: '购物', budget: 0 },
            { name: '其他', budget: 0 }
        ];
        
        const categories = ref([]);
        const expenses = ref([]);
        
        // 初始化新消费记录
        const newExpense = reactive({
            category: '',
            amount: '',
            description: '',
            date: new Date()
        });
        
        const pieChartRef = ref(null);
        let pieChart = null;
        
        // 从路由参数或props获取旅行ID
        const getTripId = () => {
            return props.id || route.params.id;
        };
        
        // 加载旅行计划详情
        const loadTrip = async () => {
            isLoading.value = true;
            const tripId = getTripId();
            
            try {
                console.log("正在加载预算管理数据：", tripId);
                await tripStore.fetchTrips();
                trip.value = tripStore.trips.find(t => t.id === tripId);
                
                if (trip.value) {
                    console.log("预算管理数据加载成功");
                    budget.value = trip.value.budget || 0;
                    categories.value = trip.value.categories || [...defaultCategories];
                    expenses.value = trip.value.expenses || [];
                } else {
                    console.error("未找到旅行计划：", tripId);
                    ElMessage.error('未找到该旅行计划');
                }
            } catch (error) {
                console.error("加载旅行计划失败：", error);
                ElMessage.error('加载预算数据失败');
            } finally {
                isLoading.value = false;
            }
            // 返回promise以支持链式调用
            return Promise.resolve();
        };
        
        // 计算总支出
        const totalExpenses = computed(() => {
            return expenses.value.reduce((sum, expense) => sum + Number(expense.amount), 0);
        });
        
        // 计算剩余预算
        const remainingBudget = computed(() => {
            return (budget.value - totalExpenses.value).toFixed(2);
        });
        
        // 预算状态
        const budgetStatus = computed(() => {
            if (remainingBudget.value < 0) return '超支';
                return '正常';
        });
        
        // 预算状态样式
        const budgetStatusClass = computed(() => {
            return {
                'budget-status': true,
                'over-budget': remainingBudget.value < 0,
                'within-budget': remainingBudget.value >= 0,
            };
        });
        
        // 各分类支出数据（用于饼图）
        const categoryExpenses = computed(() => {
            const result = [];
            const categoryMap = {};
            
            expenses.value.forEach(expense => {
                if (!categoryMap[expense.category]) {
                    categoryMap[expense.category] = 0;
                }
                categoryMap[expense.category] += Number(expense.amount);
            });
            
            Object.keys(categoryMap).forEach(category => {
                result.push({
                    name: category,
                    value: categoryMap[category]
                });
            });
            
            return result;
        });
        
        // 格式化日期
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        };
        
        // 验证预算输入
        const validateBudget = (event) => {
            const value = parseFloat(event.target.value);
            if (isNaN(value) || value < 0) {
                budget.value = 0;
            }
        };
        
        // 计算分类预算总和
        const categoryBudgetSum = computed(() => {
            return categories.value.reduce((sum, category) => sum + Number(category.budget || 0), 0);
        });
        
        // 分类预算与总预算的比较状态
        const categoryBudgetStatus = computed(() => {
            if (!budget.value) return { status: 'normal', message: '请先设置总预算' };
            
            const sum = categoryBudgetSum.value;
            if (sum > budget.value) {
                return { 
                    status: 'error', 
                    message: `分类预算总和(${sum}元)超出总预算(${budget.value}元)，请调整` 
                };
            } else if (sum === budget.value) {
                return { 
                    status: 'success', 
                    message: '分类预算已分配完毕' 
                };
            } else {
                return { 
                    status: 'warning', 
                    message: `总预算还有${(budget.value - sum).toFixed(2)}元未分配` 
                };
            }
        });
        
        // 验证分类预算输入
        const validateCategoryBudget = (index) => {
            const value = parseFloat(categories.value[index].budget);
            if (isNaN(value) || value < 0) {
                categories.value[index].budget = 0;
            }
        };
        
        // 更新总预算
        const updateBudget = async () => {
            try {
                await tripStore.updateTrip(trip.value.id, { budget: Number(budget.value) });
                ElMessage.success('预算更新成功');
                
                // 如果新设置的总预算小于分类预算总和，提示用户
                if (budget.value < categoryBudgetSum.value) {
                    ElMessage.warning(`总预算(${budget.value}元)小于分类预算总和(${categoryBudgetSum.value}元)，请及时调整分类预算`);
                }
            } catch (error) {
                ElMessage.error('预算更新失败');
            }
        };
        
        // 添加分类
        const addCategory = () => {
            categories.value.push({ name: '', budget: 0 });
        };
        
        // 删除分类
        const removeCategory = (index) => {
            categories.value.splice(index, 1);
        };
        
        // 保存分类预算
        const saveCategories = async () => {
            // 验证分类名称不为空
            const invalidCategory = categories.value.find(cat => !cat.name.trim());
            if (invalidCategory) {
                ElMessage.warning('分类名称不能为空');
                return;
            }
            
            // 验证分类预算总和不超过总预算
            if (categoryBudgetSum.value > budget.value) {
                ElMessage.error(`分类预算总和(${categoryBudgetSum.value}元)超出总预算(${budget.value}元)，请调整后再保存`);
                return;
            }
            
            try {
                // 更新分类预算
                await tripStore.updateTrip(trip.value.id, { categories: categories.value });
                
                // 更新消费记录中的分类
                const updatedExpenses = expenses.value.map(expense => {
                    // 检查当前消费记录的分类是否还存在
                    const categoryExists = categories.value.some(cat => cat.name === expense.category);
                    
                    // 如果分类不存在，将其设为"其他"
                    if (!categoryExists) {
                        return { ...expense, category: '其他' };
                    }
                    return expense;
                });
                
                // 如果消费记录有变化，保存更新
                if (JSON.stringify(updatedExpenses) !== JSON.stringify(expenses.value)) {
                    console.log('更新消费记录中的分类...');
                    await tripStore.updateTrip(trip.value.id, { expenses: updatedExpenses });
                    expenses.value = updatedExpenses;
                }
                
                ElMessage.success('分类预算保存成功，相关消费记录已更新');
            } catch (error) {
                console.error('保存分类预算失败:', error);
                ElMessage.error('保存失败');
            }
        };
        
        // 获取分类的支出总额
        const getCategoryExpense = (categoryName) => {
            return expenses.value
                .filter(expense => expense.category === categoryName)
                .reduce((sum, expense) => sum + Number(expense.amount), 0);
        };
        
        // 获取分类的预算使用百分比
        const getCategoryPercentage = (category) => {
            if (!category.budget) return 0;
            const expense = getCategoryExpense(category.name);
            const percentage = (expense / category.budget) * 100;
            return Math.min(percentage, 100);
        };
        
        // 获取分类的状态（用于进度条颜色）
        const getCategoryStatus = (category) => {
            if (!category.budget) return '';
            const expense = getCategoryExpense(category.name);
            if (expense > category.budget) return 'exception';
            if (expense >= category.budget * 0.8) return 'warning';
            return 'success';
        };
        
        // 禁用无效日期（不在旅行时间范围内的日期）
        const disableInvalidDates = (date) => {
            if (!trip.value || !trip.value.startDate || !trip.value.endDate) return true;
            
            const startDate = new Date(trip.value.startDate);
            const endDate = new Date(trip.value.endDate);
            
            // 设置时间为0点，只比较日期
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            return date < startDate || date > endDate;
        };
        
        // 添加消费记录
        const addExpense = async () => {
            if (!newExpense.category) {
                ElMessage.warning('请选择消费类别');
                return;
            }
            
            if (!newExpense.amount || isNaN(Number(newExpense.amount)) || Number(newExpense.amount) <= 0) {
                ElMessage.warning('请输入有效的消费金额');
                return;
            }
            
            if (!newExpense.date) {
                ElMessage.warning('请选择消费日期');
                return;
            }
            
            // 检查日期是否在旅行有效期内
            if (disableInvalidDates(newExpense.date)) {
                ElMessage.warning('消费日期必须在旅行的有效期内');
                return;
            }
            
            const expense = {
                category: newExpense.category,
                amount: Number(newExpense.amount),
                date: newExpense.date,
                description: newExpense.description || '无描述'
            };
            
            const updatedExpenses = [...expenses.value, expense];
            
            try {
                await tripStore.updateTrip(trip.value.id, { expenses: updatedExpenses });
                expenses.value = updatedExpenses;
                
                // 重置表单
                newExpense.category = '';
                newExpense.amount = '';
                newExpense.description = '';
                newExpense.date = new Date();
                
                ElMessage.success('消费记录添加成功');
            } catch (error) {
                ElMessage.error('添加失败');
            }
        };
        
        // 删除消费记录
        const deleteExpense = async (index) => {
            const updatedExpenses = [...expenses.value];
            updatedExpenses.splice(index, 1);
            
            try {
                await tripStore.updateTrip(trip.value.id, { expenses: updatedExpenses });
                expenses.value = updatedExpenses;
                ElMessage.success('消费记录删除成功');
            } catch (error) {
                ElMessage.error('删除失败');
            }
        };
        
        // 返回上一页
        const goBack = () => {
            router.push('/my-trips');
        };
        
        // 监听路由变化重新加载数据
        watch(() => route.params.id, (newId, oldId) => {
            if (newId && newId !== oldId) {
                loadTrip();
            }
        });
        
        // 渲染饼图
        const renderPieChart = () => {
            if (!pieChartRef.value || categoryExpenses.value.length === 0) return;
            
            // 确保DOM已经更新
            nextTick(() => {
                // 如果图表已经存在，先销毁它
                if (pieChart) {
                    pieChart.dispose();
                }
                
                // 初始化图表
                pieChart = echarts.init(pieChartRef.value);
                
                // 设置颜色数组
                const colors = [
                    '#f56c6c', // 红色
                    '#409eff', // 蓝色
                    '#67c23a', // 绿色
                    '#e6a23c', // 橙色
                    '#909399', // 灰色
                    '#8e44ad', // 紫色
                    '#3498db', // 天蓝色
                    '#1abc9c', // 青绿色
                    '#f39c12', // 黄色
                    '#d35400'  // 深橙色
                ];
                
                // 准备数据
                const data = categoryExpenses.value.map((item, index) => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: {
                        color: colors[index % colors.length]
                    }
                }));
                
                // 配置选项
                const option = {
                    title: {
                        text: '支出分布',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c}元 ({d}%)'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: data.map(item => item.name)
                    },
                    series: [
                        {
                            name: '支出金额',
                            type: 'pie',
                            radius: '60%',
                            center: ['50%', '60%'],
                            data: data,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            label: {
                                normal: {
                                    formatter: '{b}: {c}元 ({d}%)'
                                }
                            }
                        }
                    ]
                };
                
                // 设置选项并渲染图表
                pieChart.setOption(option);
                
                // 适应容器大小变化
                window.addEventListener('resize', () => {
                    pieChart && pieChart.resize();
                });
            });
        };
        
        // 监听分类支出数据变化，重新渲染图表
        watch(categoryExpenses, () => {
            renderPieChart();
        }, { deep: true });
        
        // 监听活动选项卡变化，当切换到总体预算选项卡时渲染图表
        watch(activeTab, (newTab) => {
            if (newTab === 'overall') {
                renderPieChart();
            }
        });
        
        // 组件挂载后初始渲染图表
        onMounted(() => {
            loadTrip().then(() => {
                if (activeTab.value === 'overall') {
                    renderPieChart();
                }
            });
        });
        
        // 格式化进度条显示的百分比
        const percentageFormat = (percentage) => {
            const sum = categoryBudgetSum.value;
            return sum > budget.value 
                ? `超出 ${(sum - budget.value).toFixed(2)}元` 
                : `${percentage.toFixed(0)}%`;
        };
        
        return {
            trip,
            isLoading,
            budget,
            totalExpenses,
            remainingBudget,
            budgetStatus,
            budgetStatusClass,
            formatDate,
            validateBudget,
            updateBudget,
            goBack,
            activeTab,
            categories,
            expenses,
            newExpense,
            categoryExpenses,
            addCategory,
            removeCategory,
            saveCategories,
            getCategoryExpense,
            getCategoryPercentage,
            getCategoryStatus,
            validateCategoryBudget,
            addExpense,
            deleteExpense,
            pieChartRef,
            categoryBudgetSum,
            categoryBudgetStatus,
            percentageFormat,
            disableInvalidDates
        };
    }
};
</script>

<style scoped>
.budget-management {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: #42b983;
}

.budget-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.trip-info h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #333;
}

.trip-info p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 10px;
}

.budget-tabs {
    margin-top: 20px;
}

.budget-form {
    margin: 20px 0;
}

.form-group {
    margin-bottom: 15px;
}

.budget-summary {
    margin-top: 30px;
}

.budget-summary h3, .category-budget h3, .expense-records h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #42b983;
}

.budget-summary p {
    margin-bottom: 10px;
    font-size: 1.1rem;
}

.budget-status {
    font-weight: bold;
}

.over-budget {
    color: #ff4d4f;
}

.within-budget {
    color: #42b983;
}

.chart-container {
    margin-top: 20px;
}

.budget-chart {
    height: 400px;
    width: 100%;
}

.category-budget {
    margin-top: 20px;
}

.category-list {
    margin-bottom: 20px;
}

.category-item {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 5px;
}

.add-category, .save-categories {
    margin-top: 20px;
}

.expense-records {
    margin-top: 20px;
}

.expense-form {
    margin-bottom: 30px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.expense-list {
    margin-top: 20px;
}

.trip-actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
}

.back-btn {
    margin-right: 10px;
}

.update-btn {
    margin-top: 10px;
}

.no-trip {
    text-align: center;
    margin-top: 50px;
}

.label {
    line-height: 40px;
}

/* 响应式样式 */
@media (max-width: 768px) {
    .budget-management {
        padding: 10px;
    }
    
    .budget-content {
        padding: 15px;
    }
    
    .chart-container {
        height: 250px;
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
    color: #999;
}

.budget-status-summary {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ebeef5;
}

.budget-status-summary.error {
    background-color: #fff0f0;
}

.budget-status-summary.success {
    background-color: #f0fff0;
}

.budget-status-summary.warning {
    background-color: #fffbf0;
}

.budget-status-summary.normal {
    background-color: #f5f7fa;
}

.budget-allocation-progress {
    margin-top: 10px;
    padding: 5px;
}

.budget-allocation-progress span {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
</style>



