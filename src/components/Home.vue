<template>
    <div class="home">
        <!-- 轮播图 -->
        <el-carousel :interval="5000" type="card" height="500px" class="hero-carousel">
            <el-carousel-item v-for="(slide, index) in slides" :key="index">
                <div class="carousel-content" :style="{ backgroundImage: `url(${slide.image})` }">
                    <div class="carousel-caption">
                        <h3>{{ slide.title }}</h3>
                        <p>{{ slide.description }}</p>
                    </div>
                </div>
            </el-carousel-item>
        </el-carousel>

        <!-- 欢迎信息和创建旅行计划按钮 -->
        <div class="welcome-section">
            <h2>欢迎使用旅行计划助手</h2>
            <p>开始规划你的下一次旅行吧！</p>
            
            <div class="action-buttons">
                <router-link v-if="userStore.currentUser" to="/create-trip" class="btn primary-btn">
                    <el-icon><plus /></el-icon>创建新旅行计划
                </router-link>
                <router-link v-else to="/login" class="btn primary-btn">
                    <el-icon><user /></el-icon>登录以创建旅行计划
                </router-link>
                
                <router-link v-if="userStore.currentUser" to="/my-trips" class="btn secondary-btn">
                    <el-icon><tickets /></el-icon>查看我的旅行计划
                </router-link>
            </div>
        </div>

        <!-- 功能介绍卡片 -->
        <div class="features-section">
            <h2>功能特点</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="el-icon-edit"></i>
                    </div>
                    <h3>个性化行程</h3>
                    <p>根据您的兴趣和预算，创建定制的旅行计划。</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="el-icon-money"></i>
                    </div>
                    <h3>预算管理</h3>
                    <p>记录和跟踪您的旅行支出，确保不超出预算。</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="el-icon-star-on"></i>
                    </div>
                    <h3>目的地推荐</h3>
                    <p>获取热门旅游目的地的推荐及当地景点介绍。</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="el-icon-notebook"></i>
                    </div>
                    <h3>行程备忘录</h3>
                    <p>记录您需要携带的物品和旅行前准备事项。</p>
                </div>
            </div>
        </div>

        <!-- 热门旅行目的地推荐 -->
        <div class="destination-section">
            <h3>热门旅行目的地推荐</h3>
            <el-row :gutter="20" class="destination-grid">
                <el-col :xs="24" :sm="12" :md="6" v-for="(destination, index) in popularDestinations" :key="index">
                    <div 
                        class="destination-card" 
                        :style="{ backgroundImage: `url(${destination.image})` }"
                        @mouseenter="destination.hover = true"
                        @mouseleave="destination.hover = false"
                    >
                        <div class="destination-overlay" :class="{ 'active': destination.hover }">
                            <div class="destination-info">
                                <h4>{{ destination.name }}</h4>
                                <p>{{ destination.description }}</p>
                                <a 
                                    v-if="userStore.currentUser" 
                                    :href="'/create-trip?destination=' + encodeURIComponent(destination.name)" 
                                    class="destination-btn"
                                >
                                    选择此目的地
                                </a>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 用户评价 -->
        <div class="testimonials-section">
            <h3>用户评价</h3>
            <el-carousel :interval="4000" type="card" height="200px">
                <el-carousel-item v-for="(testimonial, index) in testimonials" :key="index">
                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <p class="testimonial-text">{{ testimonial.text }}</p>
                            <div class="testimonial-author">
                                <div class="avatar" :style="{ backgroundColor: testimonial.color }">{{ testimonial.avatar }}</div>
                                <div>
                                    <h4>{{ testimonial.name }}</h4>
                                    <el-rate v-model="testimonial.rating" disabled></el-rate>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { ElMessage } from 'element-plus';

export default {
    name: 'Home',
    setup() {
        const userStore = useUserStore();
        const router = useRouter();
        const isLoading = ref(false);

        // 轮播图数据
        const slides = ref([
            {
                image: new URL('../assets/SunshineBeach.jpg', import.meta.url).href,
                alt: '海滩度假',
                title: '探索美丽的海滩',
                description: '享受阳光、沙滩和海浪的完美假期。',
            },
            {
                image: new URL('../assets/WinterSkiing.jpg', import.meta.url).href,
                alt: '雪山滑雪',
                title: '冬季滑雪之旅',
                description: '在雪山上体验速度与激情。',
            },
            {
                image: new URL('../assets/UrbanExploration.jpg', import.meta.url).href,
                alt: '城市探险',
                title: '探索繁华都市',
                description: '感受大都市的文化与活力。',
            },
            {
                image: new URL('../assets/ForestCamping.jpg', import.meta.url).href,
                alt: '森林露营',
                title: '邂逅宁静森林',
                description: '远离喧嚣，在森林中享受大自然的怀抱。',
            },
            {
                image: new URL('../assets/Dive.jpg', import.meta.url).href,
                alt: '海岛浮潜',
                title: '奇妙的海底世界',
                description: '探索五彩斑斓的珊瑚礁，感受海洋的神奇。',
            },
            {
                image: new URL('../assets/Idyll.jpg', import.meta.url).href,
                alt: '乡村田园游',
                title: '田园牧歌',
                description: '体验乡村的宁静与质朴，感受乡村生活的美好。',
            },
        ]);

        // 热门旅游目的地
        const popularDestinations = ref([
            {
                name: '巴黎',
                image: new URL('../assets/Paris.jpg', import.meta.url).href,
                color: '#e6a23c',
                description: '浪漫之都，拥有丰富的历史与文化。',
                hover: false
            },
            {
                name: '东京',
                image: new URL('../assets/Tokyo.jpg', import.meta.url).href,
                color: '#409eff',
                description: '现代与传统交融的国际大都市。',
                hover: false
            },
            {
                name: '纽约',
                image: new URL('../assets/NewYork.jpg', import.meta.url).href,
                color: '#67c23a',
                description: '繁忙的国际金融中心。',
                hover: false
            },
            {
                name: '悉尼',
                image: new URL('../assets/Sydney.jpg', import.meta.url).href,
                color: '#f56c6c',
                description: '美丽的海港城市，拥有标志性歌剧院。',
                hover: false
            }
        ]);
        
        // 用户评价
        const testimonials = ref([
            {
                name: '张先生',
                avatar: 'Z',
                rating: 5,
                text: '这款旅行计划助手真的太方便了，帮我节省了很多时间！特别是预算管理功能，让我的旅行开支一目了然。',
                color: '#409eff'
            },
            {
                name: '李女士',
                avatar: 'L',
                rating: 4,
                text: '很实用的应用，推荐给所有爱旅行的朋友。目的地推荐功能给了我很多新的旅行灵感。',
                color: '#67c23a'
            },
            {
                name: '王先生',
                avatar: 'W',
                rating: 5,
                text: '操作简单，界面美观，非常适合旅行规划。行程备忘录让我不再担心遗忘携带物品。',
                color: '#e6a23c'
            }
        ]);
        
        // 设置目的地并导航到创建页面
        const setDestination = (destination) => {
            try {
                window.sessionStorage.setItem('selectedDestination', destination);
                console.log("保存目的地:", destination);
                
                // 使用setTimeout避免立即导航可能导致的状态问题
                setTimeout(() => {
                    router.push(`/create-trip?destination=${encodeURIComponent(destination)}`);
                }, 200);
            } catch (error) {
                console.error("设置目的地失败:", error);
                ElMessage.error("导航到创建页面失败，请重试");
            }
        };
        
        onMounted(() => {
            console.log('主页组件已挂载');
        });
        
        return {
            slides,
            popularDestinations,
            testimonials,
            setDestination,
            isLoading,
            userStore
        };
    }
};
</script>

<style scoped>
.home {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* 轮播图样式 */
.hero-carousel {
    margin-bottom: 50px;
}

.carousel-content {
    height: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    position: relative;
}

.carousel-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: white;
    padding: 20px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.carousel-caption h3 {
    font-size: 2rem;
    margin-bottom: 10px;
}

.carousel-caption p {
    font-size: 1rem;
}

/* 欢迎信息样式 */
.welcome-section {
    text-align: center;
    margin: 60px 0;
}

.welcome-section h2 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    color: #333;
}

.welcome-section p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
}

.primary-btn {
    background-color: #42b983;
    color: white;
    box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.primary-btn:hover {
    background-color: #369f6e;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(66, 185, 131, 0.4);
}

.secondary-btn {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
}

.secondary-btn:hover {
    background-color: #eaeaea;
}

/* 功能特性样式 */
.features-section {
    margin: 60px 0;
}

.features-section h3 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.features-grid {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.feature-card {
    width: 200px;
    text-align: center;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 40px;
    color: #42b983;
    margin-bottom: 10px;
}

.feature-card h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: #333;
}

.feature-card p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* 热门旅行目的地样式 */
.destination-section {
    margin: 60px 0;
}

.destination-section h3 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.destination-grid {
    margin-top: 30px;
}

.destination-card {
    height: 300px;
    border-radius: 10px;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.destination-card:hover {
    transform: scale(1.03);
}

.destination-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    transition: background 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px;
}

.destination-overlay.active {
    background: rgba(0, 0, 0, 0.6);
}

.destination-info {
    color: white;
    transform: translateY(30px);
    opacity: 0.8;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.destination-overlay.active .destination-info {
    transform: translateY(0);
    opacity: 1;
}

.destination-info h4 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.destination-info p {
    margin-bottom: 15px;
}

.destination-btn {
    display: inline-block;
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.destination-overlay.active .destination-btn {
    opacity: 1;
    transform: translateY(0);
}

.destination-btn:hover {
    background-color: #369f6e;
}

/* 用户评价样式 */
.testimonials-section {
    margin: 60px 0;
}

.testimonials-section h3 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.testimonial-card {
    height: 100%;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.testimonial-content {
    text-align: center;
}

.testimonial-text {
    font-style: italic;
    color: #666;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 20px;
}

.testimonial-author {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 20px;
}

.testimonial-author h4 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
}

/* 响应式样式 */
@media (max-width: 768px) {
    .carousel-caption h3 {
        font-size: 1.5rem;
    }
    
    .welcome-section h2 {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .carousel-caption h3 {
        font-size: 1.2rem;
    }
    
    .welcome-section h2 {
        font-size: 1.8rem;
    }
    
    .destination-card {
        height: 200px;
    }
    
    .testimonial-card {
        padding: 15px;
    }
}
</style>