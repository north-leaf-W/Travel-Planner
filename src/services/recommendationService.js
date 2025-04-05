import axios from 'axios';

// 模拟推荐数据（实际项目中应使用真实API）
const mockDestinations = {
    '北京': {
        attractions: [
            {
                name: '故宫博物院',
                rating: 4.8,
                address: '北京市东城区景山前街4号',
                description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
                image: new URL('../assets/recommendations/beijing_forbidden_city.jpg', import.meta.url).href,
                location: { lat: 39.9163, lng: 116.3972 }
            },
            {
                name: '长城',
                rating: 4.9,
                address: '北京市怀柔区',
                description: '中国古代伟大的防御工程，是中华民族的象征，也是世界文化遗产。',
                image: new URL('../assets/recommendations/beijing_great_wall.jpg', import.meta.url).href,
                location: { lat: 40.4319, lng: 116.5704 }
            },
            {
                name: '天坛公园',
                rating: 4.6,
                address: '北京市东城区天坛路甲1号',
                description: '明清两代帝王祭天的场所，是中国现存最大的古代祭祀建筑群。',
                image: new URL('../assets/recommendations/beijing_temple_of_heaven.jpg', import.meta.url).href,
                location: { lat: 39.8828, lng: 116.4107 }
            }
        ],
        restaurants: [
            {
                name: '全聚德烤鸭',
                rating: 4.7,
                address: '北京市前门大街30号',
                description: '创建于1864年的老字号，以烤鸭闻名于世。',
                color: '#f56c6c',
                price: '¥¥¥',
                cuisine: '北京菜',
                priceRange: '300-500元/人'
            },
            {
                name: '南锣鼓巷小吃街',
                rating: 4.5,
                address: '北京市东城区南锣鼓巷',
                description: '汇集了各种北京传统小吃，是品尝京味美食的好去处。',
                color: '#e6a23c',
                price: '¥',
                cuisine: '北京小吃',
                priceRange: '50-100元/人'
            }
        ],
        tips: [
            '北京地铁线路覆盖广泛，是游览城市的最佳选择，可以购买一卡通。',
            '访问故宫最好提前网上预约，特别是在旅游旺季。',
            '长城景区有多个入口，八达岭游客较多，慕田峪和司马台相对清静。',
            '北京四合院和胡同游是了解老北京文化的好方式。'
        ]
    },
    '上海': {
        attractions: [
            {
                name: '外滩',
                rating: 4.7,
                address: '上海市黄浦区中山东一路',
                description: '上海最著名的地标之一，有着"万国建筑博览会"的美誉。',
                image: new URL('../assets/recommendations/shanghai_bund.jpg', import.meta.url).href,
                location: { lat: 31.2343, lng: 121.4908 }
            },
            {
                name: '上海迪士尼乐园',
                rating: 4.8,
                address: '上海市浦东新区申迪西路753号',
                description: '中国内地首座迪士尼主题乐园，融合了中国元素与迪士尼经典故事。',
                image: new URL('../assets/recommendations/shanghai_disney.jpg', import.meta.url).href,
                location: { lat: 31.1433, lng: 121.6572 }
            },
            {
                name: '豫园',
                rating: 4.5,
                address: '上海市黄浦区安仁街218号',
                description: '始建于明代的古典园林，是江南园林艺术的代表作。',
                image: new URL('../assets/recommendations/shanghai_yuyuan.jpg', import.meta.url).href,
                location: { lat: 31.2271, lng: 121.4883 }
            }
        ],
        restaurants: [
            {
                name: '南翔馒头店',
                rating: 4.6,
                address: '上海市黄浦区豫园老街南翔馒头店',
                description: '百年老店，以灌汤小笼包驰名中外。',
                color: '#f56c6c',
                price: '¥¥',
                cuisine: '上海本帮菜',
                priceRange: '80-150元/人'
            },
            {
                name: '西郊国宾馆',
                rating: 4.7,
                address: '上海市长宁区虹桥路1599号',
                description: '享有盛誉的粤菜餐厅，招牌菜有片皮鸭和红烧大虾。',
                color: '#e6a23c',
                price: '¥¥¥',
                cuisine: '粤菜',
                priceRange: '300-600元/人'
            }
        ],
        tips: [
            '上海地铁交通发达，可以购买交通卡方便出行。',
            '上海迪士尼乐园游客较多，建议提前购票并错峰前往。',
            '上海的十月到十一月天气最为宜人，是旅游的最佳时节。',
            '南京路和淮海路是上海主要的购物街，可以体验时尚购物。'
        ]
    },
    '广州': {
        attractions: [
            {
                name: '广州塔',
                rating: 4.7,
                address: '广州市海珠区阅江西路222号',
                description: '又称"小蛮腰"，是广州地标性建筑，也是中国最高的电视塔。',
                image: new URL('../assets/recommendations/guangzhou_tower.jpg', import.meta.url).href,
                location: { lat: 23.1066, lng: 113.3214 }
            },
            {
                name: '陈家祠',
                rating: 4.5,
                address: '广州市荔湾区中山七路恩宁路祠堂前',
                description: '岭南建筑艺术的瑰宝，具有浓厚的岭南地方特色。',
                image: new URL('../assets/recommendations/guangzhou_chen_clan.jpg', import.meta.url).href,
                location: { lat: 23.1254, lng: 113.2571 }
            }
        ],
        restaurants: [
            {
                name: '泮溪酒家',
                rating: 4.8,
                address: '广州市荔湾区龙津西路151号',
                description: '百年老字号，以粤菜和点心著称。',
                color: '#f56c6c',
                price: '¥¥',
                cuisine: '粤菜',
                priceRange: '150-300元/人'
            },
            {
                name: '陶陶居',
                rating: 4.6,
                address: '广州市越秀区上下九步行街81号',
                description: '创办于1880年的老字号，以早茶和点心闻名。',
                color: '#e6a23c',
                price: '¥¥',
                cuisine: '粤式点心',
                priceRange: '100-200元/人'
            }
        ],
        tips: [
            '广州全年气候温暖，夏季较为炎热潮湿，春秋两季更适合旅游。',
            '广州地铁线路发达，可以购买羊城通交通卡方便出行。',
            '品尝地道的广州早茶是了解广州饮食文化的最佳方式。',
            '白云山是广州著名的自然景点，可以俯瞰整个城市。'
        ]
    },
    '香港': {
        attractions: [
            {
                name: '维多利亚港',
                rating: 4.9,
                address: '香港特别行政区维多利亚港',
                description: '香港最著名的景点之一，被誉为"东方之珠"。',
                image: new URL('../assets/recommendations/hongkong_victoria.jpg', import.meta.url).href,
                location: { lat: 22.2939, lng: 114.1722 }
            },
            {
                name: '太平山顶',
                rating: 4.7,
                address: '香港特别行政区太平山顶',
                description: '香港岛的最高点，可俯瞰维多利亚港和香港岛市区全景。',
                image: new URL('../assets/recommendations/hongkong_peak.jpg', import.meta.url).href,
                location: { lat: 22.2759, lng: 114.1455 }
            }
        ],
        restaurants: [
            {
                name: '添好运点心专门店',
                rating: 4.7,
                address: '香港特别行政区佐敦白加士街47-49号地下',
                description: '世界上最便宜的米其林星级餐厅之一，以港式点心著称。',
                color: '#f56c6c',
                price: '¥¥',
                cuisine: '港式点心',
                priceRange: '100-200港币/人'
            },
            {
                name: '镛记烧鹅',
                rating: 4.8,
                address: '香港特别行政区中环士丹利街34-38号',
                description: '米其林星级餐厅，以烧鹅和烧肉闻名。',
                color: '#e6a23c',
                price: '¥¥',
                cuisine: '粤菜烧腊',
                priceRange: '150-300港币/人'
            }
        ],
        tips: [
            '香港公共交通便利，可以购买八达通卡便于乘坐各类交通工具。',
            '香港是购物天堂，尖沙咀和中环是主要的购物区。',
            '香港的十月到十二月气候最为宜人，是旅游的最佳时节。',
            '在香港乘坐天星小轮欣赏维多利亚港夜景是必不可少的体验。'
        ]
    },
    '巴黎': {
        attractions: [
            {
                name: '埃菲尔铁塔',
                rating: 4.8,
                address: '法国巴黎7区Champ de Mars, 5 Avenue Anatole France',
                description: '巴黎的标志性建筑，是世界知名的文化遗产和旅游胜地。',
                image: new URL('../assets/recommendations/paris_Eiffel_Tower.jpg', import.meta.url).href,
                location: { lat: 48.8584, lng: 2.2945 }
            },
            {
                name: '卢浮宫',
                rating: 4.9,
                address: '法国巴黎1区Rue de Rivoli',
                description: '世界上最大的艺术博物馆之一，收藏了包括《蒙娜丽莎》在内的众多艺术珍品。',
                image: new URL('../assets/recommendations/paris_Louvre.jpg', import.meta.url).href,
                location: { lat: 48.8606, lng: 2.3376 }
            },
            {
                name: '凯旋门',
                rating: 4.7,
                address: '法国巴黎8区Place Charles de Gaulle',
                description: '为纪念拿破仑的胜利而建，是巴黎最宏伟的建筑之一。',
                image: new URL('../assets/recommendations/paris_Arc_de_Triomphe.jpg', import.meta.url).href,
                location: { lat: 48.8738, lng: 2.2950 }
            }
        ],
        restaurants: [
            {
                name: 'Le Jules Verne',
                rating: 4.7,
                address: '埃菲尔铁塔2楼',
                description: '位于埃菲尔铁塔上的高档餐厅，提供现代法式料理和巴黎全景。',
                image: new URL('../assets/recommendations/beijing_forbidden_city.jpg', import.meta.url).href,
                price: '¥¥¥',
                cuisine: '现代法式料理',
                priceRange: '200-400欧元/人'
            },
            {
                name: 'Café de Flore',
                rating: 4.5,
                address: '圣日耳曼大道172号',
                description: '历史悠久的巴黎咖啡馆，曾是文人墨客和哲学家的聚集地。',
                image: new URL('../assets/recommendations/beijing_great_wall.jpg', import.meta.url).href,
                price: '¥¥',
                cuisine: '法式咖啡馆',
                priceRange: '30-60欧元/人'
            }
        ],
        tips: [
            '巴黎的地铁系统发达，建议购买Paris Visite交通卡。',
            '卢浮宫游客众多，建议提前网上购票并在早上开馆时前往。',
            '巴黎最佳旅游季节是4-6月和9-10月，可避开夏季的游客高峰。',
            '大多数博物馆每周一休馆，请提前规划行程。'
        ]
    },
    '东京': {
        attractions: [
            {
                name: '东京晴空塔',
                rating: 4.7,
                address: '东京都墨田区押上1-1-2',
                description: '东京的地标性建筑，是世界上最高的独立式电波塔。',
                image: new URL('../assets/recommendations/tokyo_Skytree.jpg', import.meta.url).href,
                location: { lat: 35.7100, lng: 139.8107 }
            },
            {
                name: '明治神宫',
                rating: 4.8,
                address: '东京都涩谷区代代木神园町1-1',
                description: '祭祀明治天皇和昭宪皇太后的神社，位于东京市中心的一片宁静树林中。',
                image: new URL('../assets/recommendations/tokyo_Meiji_Jingu.jpg', import.meta.url).href,
                location: { lat: 35.6763, lng: 139.6993 }
            },
            {
                name: '浅草寺',
                rating: 4.6,
                address: '东京都台东区浅草2-3-1',
                description: '东京最古老的寺庙，建于公元628年，是重要的佛教寺庙。',
                image: new URL('../assets/recommendations/tokyo_Asakusa.jpg', import.meta.url).href,
                location: { lat: 35.7147, lng: 139.7966 }
            }
        ],
        restaurants: [
            {
                name: '寿司大',
                rating: 4.9,
                address: '东京都中央区筑地市场内',
                description: '位于著名的筑地鱼市场内，提供最新鲜的寿司。',
                image: new URL('../assets/recommendations/shanghai_bund.jpg', import.meta.url).href,
                price: '¥¥¥',
                cuisine: '寿司',
                priceRange: '15000-30000日元/人'
            },
            {
                name: '一兰拉面',
                rating: 4.6,
                address: '东京都涩谷区多处分店',
                description: '来自福冈的著名拉面连锁店，以其独特的浓厚猪骨汤底闻名。',
                image: new URL('../assets/recommendations/shanghai_disney.jpg', import.meta.url).href,
                price: '¥¥',
                cuisine: '日式拉面',
                priceRange: '1000-1500日元/人'
            }
        ],
        tips: [
            '购买Suica或Pasmo卡可便捷地使用东京的公共交通。',
            '东京的春季(3-4月)和秋季(10-11月)气候最为宜人。',
            '日本的消费税为10%，很多商店可以为外国游客办理退税。',
            '东京的交通系统会在午夜左右停止运营，请安排好行程。'
        ]
    },
    '纽约': {
        attractions: [
            {
                name: '自由女神像',
                rating: 4.8,
                address: '纽约港自由岛',
                description: '纽约的象征，也是美国的象征，这座高大的雕像是法国赠送给美国的礼物。',
                image: new URL('../assets/recommendations/newyork_Statue_of_Liberty.jpg', import.meta.url).href,
                location: { lat: 40.6892, lng: -74.0445 }
            },
            {
                name: '帝国大厦',
                rating: 4.7,
                address: '曼哈顿第五大道350号',
                description: '纽约地标性摩天大楼，曾是世界上最高的建筑。',
                image: new URL('../assets/recommendations/newyork_Empire_State_Building.jpg', import.meta.url).href,
                location: { lat: 40.7484, lng: -73.9857 }
            },
            {
                name: '中央公园',
                rating: 4.9,
                address: '曼哈顿中心',
                description: '纽约市中心的一片绿洲，是世界上最著名的城市公园之一。',
                image: new URL('../assets/recommendations/newyork_Central_Park.jpg', import.meta.url).href,
                location: { lat: 40.7829, lng: -73.9654 }
            }
        ],
        restaurants: [
            {
                name: 'Katz\'s Delicatessen',
                rating: 4.7,
                address: '纽约下东区休斯顿街205号',
                description: '百年老店，以巨大的熏牛肉三明治闻名。',
                image: new URL('../assets/recommendations/guangzhou_tower.jpg', import.meta.url).href,
                price: '¥¥',
                cuisine: '美式熟食店',
                priceRange: '20-35美元/人'
            },
            {
                name: 'Shake Shack',
                rating: 4.6,
                address: '曼哈顿多处分店',
                description: '源自纽约的著名汉堡连锁店，以高品质汉堡和奶昔闻名。',
                image: new URL('../assets/recommendations/guangzhou_chen_clan.jpg', import.meta.url).href,
                price: '¥',
                cuisine: '美式快餐',
                priceRange: '10-20美元/人'
            }
        ],
        tips: [
            '购买纽约通票(New York Pass)可参观多个景点并节省费用。',
            '纽约的地铁全天24小时运营，是游览城市的最佳交通方式。',
            '夏季(6-8月)纽约气温较高，冬季(12-2月)则非常寒冷，建议春秋季节前往。',
            '曼哈顿的酒店价格昂贵，可考虑住在布鲁克林或皇后区。'
        ]
    },
    '悉尼': {
        attractions: [
            {
                name: '悉尼歌剧院',
                rating: 4.9,
                address: '澳大利亚新南威尔士州悉尼本诺朗角',
                description: '世界著名的表演艺术中心，以其独特的帆船形建筑设计闻名于世。',
                image: new URL('../assets/recommendations/sydney_Sydney_Opera_House.jpg', import.meta.url).href,
                location: { lat: -33.8568, lng: 151.2153 }
            },
            {
                name: '悉尼海港大桥',
                rating: 4.8,
                address: '澳大利亚新南威尔士州悉尼港',
                description: '横跨悉尼港的钢铁拱桥，是悉尼的地标性建筑。',
                image: new URL('../assets/recommendations/sydney_Harbour_Bridge.jpg', import.meta.url).href,
                location: { lat: -33.8523, lng: 151.2107 }
            },
            {
                name: '邦迪海滩',
                rating: 4.7,
                address: '澳大利亚新南威尔士州悉尼东部郊区',
                description: '著名的冲浪海滩，也是悉尼最受欢迎的海滩之一。',
                image: new URL('../assets/recommendations/sydney_Bondi_Beach.jpg', import.meta.url).href,
                location: { lat: -33.8915, lng: 151.2767 }
            }
        ],
        restaurants: [
            {
                name: 'Quay',
                rating: 4.8,
                address: '悉尼圆形码头海外客运站上层',
                description: '悉尼顶级餐厅，提供创新的澳大利亚美食，可欣赏歌剧院和港湾美景。',
                image: new URL('../assets/recommendations/hongkong_victoria.jpg', import.meta.url).href,
                price: '¥¥¥',
                cuisine: '创新澳式料理',
                priceRange: '250-400澳元/人'
            },
            {
                name: 'Harry\'s Café de Wheels',
                rating: 4.5,
                address: '澳大利亚新南威尔士州Woolloomooloo',
                description: '悉尼著名的派餐车，提供澳式肉饼和热狗。',
                image: new URL('../assets/recommendations/hongkong_peak.jpg', import.meta.url).href,
                price: '¥',
                cuisine: '澳式快餐',
                priceRange: '10-20澳元/人'
            }
        ],
        tips: [
            '购买Opal卡可便捷地使用悉尼的公共交通系统。',
            '悉尼的夏季(12-2月)阳光充足但也较热，冬季(6-8月)温和凉爽。',
            '周日使用Opal卡乘坐公共交通只需支付2.5澳元的封顶费用。',
            '澳大利亚靠左行驶，过马路时请注意交通。'
        ]
    }
    // 可以添加更多目的地...
};

// 获取目的地推荐
const getDestinationRecommendations = async (destination) => {
    // 在实际应用中，这里应该是一个API请求
    try {
        console.log('开始获取目的地推荐，原始输入:', destination);
        
        if (!destination) {
            console.warn('目的地为空');
            return {
                destination: '',
                recommendations: {
                    attractions: [],
                    restaurants: [],
                    tips: ['请输入有效的目的地']
                }
            };
        }
        
        // 规范化目的地名称，处理不同的输入形式
        const normalizedDestination = normalizeDestination(destination) || destination;
        console.log('规范化后的目的地:', normalizedDestination);
        
        // 查找匹配的目的地
        const recommendationsData = mockDestinations[normalizedDestination];
        console.log('查找到的推荐数据:', recommendationsData ? '找到' : '未找到');
        
        if (!recommendationsData) {
            console.warn('没有找到匹配的目的地数据:', normalizedDestination);
            return {
                destination: destination,
                recommendations: {
                    attractions: [],
                    restaurants: [],
                    tips: ['暂无针对该目的地的具体推荐，您可以选择其他热门目的地如：北京、上海、广州、香港。']
                }
            };
        }
        
        // 检查推荐数据的完整性
        if (!recommendationsData.attractions) {
            console.warn('推荐数据中没有景点信息');
            recommendationsData.attractions = [];
        }
        
        if (!recommendationsData.restaurants) {
            console.warn('推荐数据中没有餐厅信息');
            recommendationsData.restaurants = [];
        }
        
        if (!recommendationsData.tips) {
            console.warn('推荐数据中没有旅行小贴士');
            recommendationsData.tips = ['享受您在' + normalizedDestination + '的旅行！'];
        }
        
        console.log('返回推荐数据:', {
            destination: normalizedDestination,
            recommendationsCount: {
                attractions: recommendationsData.attractions.length,
                restaurants: recommendationsData.restaurants.length,
                tips: recommendationsData.tips.length
            }
        });
        
        return {
            destination: normalizedDestination,
            recommendations: recommendationsData
        };
    } catch (error) {
        console.error('获取目的地推荐出错:', error);
        return {
            destination: destination || '',
            recommendations: {
                attractions: [],
                restaurants: [],
                tips: ['获取推荐信息时出错，请稍后重试。']
            }
        };
    }
};

// 获取热门目的地
const getPopularDestinations = async () => {
    try {
        console.log('开始获取热门目的地列表');
        
        const popularDestinations = Object.keys(mockDestinations).map(destination => {
            const data = mockDestinations[destination];
            return {
                name: destination,
                attractionsCount: data.attractions ? data.attractions.length : 0,
                tipsCount: data.tips ? data.tips.length : 0
            };
        });
        
        console.log('热门目的地列表:', popularDestinations);
        return popularDestinations;
    } catch (error) {
        console.error('获取热门目的地出错:', error);
        return [];
    }
};

// 辅助函数：规范化目的地名称
const normalizeDestination = (destination) => {
    if (!destination) return null;
    
    try {
        const normalized = destination.trim().toLowerCase();
        
        // 城市名称映射
        const cityMap = {
            '北京': ['beijing', 'peking'],
            '上海': ['shanghai'],
            '广州': ['guangzhou', 'canton'],
            '香港': ['hongkong', 'hong kong'],
            '巴黎': ['paris'],
            '东京': ['tokyo'],
            '纽约': ['new york', 'nyc'],
            '悉尼': ['sydney']
        };
        
        // 寻找匹配的城市
        for (const [city, aliases] of Object.entries(cityMap)) {
            if (normalized === city.toLowerCase() || aliases.some(alias => normalized.includes(alias))) {
                return city;
            }
        }
        
        // 尝试直接匹配
        return Object.keys(mockDestinations).find(key => key.toLowerCase() === normalized) || null;
    } catch (error) {
        console.error('规范化目的地名称出错:', error);
        return null;
    }
};

export {
    getDestinationRecommendations,
    getPopularDestinations
};