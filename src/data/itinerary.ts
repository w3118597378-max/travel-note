// 开发阶段先放一份精简示例，后续可替换为完整行程

export type CardType = 'attraction' | 'restaurant' | 'transport' | 'hotel'

export type SpecialTag =
  | 'must-eat'
  | 'must-order'
  | 'must-buy'
  | 'reservation'
  | 'tip'
  | 'story'

export interface SpecialInfo {
  tag: SpecialTag
  text: string
  code?: string
}

export interface Location {
  name: string
  address: string
  lat: number
  lng: number
  googleMapsUrl?: string
  appleMapsUrl?: string
}

export interface ItineraryCard {
  id: string
  type: CardType
  time?: string
  title: string
  titleJa?: string
  description: string
  location?: Location
  duration?: string
  cost?: string
  openHours?: string
  specialInfos?: SpecialInfo[]
  imageUrl?: string
  tips?: string[]
}

export interface DayItinerary {
  dayNumber: number
  date: string
  title: string
  region: string
  weatherLat: number
  weatherLng: number
  cards: ItineraryCard[]
}

export interface FlightInfo {
  id: string
  airline: string
  flightNo: string
  route: string
  departure: string
  arrival: string
  terminal?: string
  bookingRef?: string
  notes?: string
}

export interface HotelInfo {
  id: string
  name: string
  nights: string
  address: string
  phone: string
  checkIn?: string
  checkOut?: string
  bookingRef?: string
  lat?: number
  lng?: number
  googleMapsUrl?: string
  notes?: string
}

export interface EmergencyContact {
  category: string
  name: string
  phone: string
  note?: string
}

export interface BudgetConfig {
  totalBudget: number
  baseCurrency: string // e.g., 'TWD'
  localCurrency: string // e.g., 'JPY'
  exchangeRate: number
  categories: string[]
}

export interface TripData {
  id: string
  tripName: string
  year: number
  totalDays: number
  days: DayItinerary[]
  flightInfo: FlightInfo[]
  hotelInfo: HotelInfo[]
  emergencyContacts: EmergencyContact[]
  budget: BudgetConfig
}

export const tripData: TripData = {
  id: 'japan-trip-2025',
  tripName: '日本自驾之旅',
  year: 2025,
  totalDays: 5,
  days: [
    {
      dayNumber: 1,
      date: '2025-04-01',
      title: '抵达东京・浅草散策',
      region: 'Tokyo',
      weatherLat: 35.71,
      weatherLng: 139.79,
      cards: [
        {
          id: 'd1-1',
          type: 'transport',
          time: '11:00',
          title: '成田机场 → 东京市区',
          description: '乘坐京成电铁 Skyliner 前往上野，再转往浅草酒店。',
          cost: '¥2,570/人',
          duration: '约 1 小时'
        },
        {
          id: 'd1-2',
          type: 'attraction',
          time: '14:30',
          title: '浅草寺',
          titleJa: '浅草寺',
          description: '东京最古老的寺庙，感受仲见世通的热闹与雷门的震撼。',
          location: {
            name: '浅草寺',
            address: '东京都台东区浅草2-3-1',
            lat: 35.7148,
            lng: 139.7967,
            googleMapsUrl: 'https://maps.google.com/?q=35.7148,139.7967'
          },
          imageUrl: 'https://images.unsplash.com/photo-1542640244-7e672d6cef21?w=1200',
          specialInfos: [{ tag: 'must-buy', text: '雷门人形烧' }]
        },
        {
          id: 'd1-3',
          type: 'restaurant',
          time: '18:30',
          title: '浅草今半 寿喜烧',
          titleJa: '浅草今半',
          description: '百年寿喜烧老店，品尝最高级的黑毛和牛。',
          location: {
            name: '浅草今半 国际通本店',
            address: '东京都台东区西浅草3-1-12',
            lat: 35.7142,
            lng: 139.7915
          },
          cost: '¥10,000/人',
          specialInfos: [{ tag: 'reservation', text: '需提前官网预约', code: 'IMAHAN-123' }]
        }
      ]
    },
    {
      dayNumber: 2,
      date: '2025-04-02',
      title: '镰仓江之岛・湘南海岸',
      region: 'Kamakura',
      weatherLat: 35.31,
      weatherLng: 139.54,
      cards: [
        {
          id: 'd2-1',
          type: 'transport',
          time: '09:00',
          title: '租车取车',
          description: '前往 Times Car Rental 浅草店取车，开始自驾行程。',
          cost: '¥15,000/2天'
        },
        {
          id: 'd2-2',
          type: 'attraction',
          time: '11:00',
          title: '镰仓高校前平交道',
          titleJa: '鎌倉高校前踏切',
          description: '《灌篮高手》经典取景地，眺望江之电与湘南大海。',
          location: {
            name: '鎌倉高校前踏切',
            address: '神奈川县镰仓市腰越1-1',
            lat: 35.3067,
            lng: 139.5022
          },
          imageUrl: 'https://images.unsplash.com/photo-1590623194012-70678d91c712?w=1200',
          specialInfos: [{ tag: 'tip', text: '人车众多，拍照请注意安全' }]
        },
        {
          id: 'd2-3',
          type: 'attraction',
          time: '14:00',
          title: '江之岛',
          titleJa: '江の島',
          description: '漫步辩财天仲见世通，参拜江岛神社，看海景。',
          location: {
            name: '江之岛',
            address: '神奈川县藤泽市江之岛',
            lat: 35.301,
            lng: 139.481
          }
        },
        {
          id: 'd2-4',
          type: 'hotel',
          time: '18:00',
          title: '镰仓王子大饭店',
          titleJa: '鎌倉プリンスホテル',
          description: '所有房型皆可看到海岸线，与富士山遥遥相望。',
          location: {
            name: '镰仓王子大饭店',
            address: '神奈川县镰仓市七里滨东1-2-18',
            lat: 35.303,
            lng: 139.507
          }
        }
      ]
    },
    {
      dayNumber: 3,
      date: '2025-04-03',
      title: '箱根大涌谷・芦之湖海盗船',
      region: 'Hakone',
      weatherLat: 35.24,
      weatherLng: 139.04,
      cards: [
        {
          id: 'd3-1',
          type: 'attraction',
          time: '10:30',
          title: '大涌谷',
          titleJa: '大涌谷',
          description: '箱根最具代表性的景点，硫磺烟雾缭绕的火山奇观。',
          location: {
            name: '大涌谷',
            address: '神奈川县足柄下郡箱根町仙石原1251',
            lat: 35.242,
            lng: 139.019
          },
          specialInfos: [{ tag: 'must-eat', text: '长寿黑鸡蛋' }]
        },
        {
          id: 'd3-2',
          type: 'transport',
          time: '13:00',
          title: '芦之湖海盗船',
          titleJa: '箱根海賊船',
          description: '从元箱根港乘坐海盗船前往桃源台港，欣赏大鸟居。',
          cost: '¥1,200/人'
        },
        {
          id: 'd3-3',
          type: 'hotel',
          time: '17:00',
          title: '箱根小涌园饭店',
          titleJa: '箱根小涌園',
          description: '享受纯正的箱根温泉，远离喧嚣。',
          location: {
            name: '箱根小涌园',
            address: '神奈川县足柄下郡箱根町二之平1297',
            lat: 35.24,
            lng: 139.04
          }
        }
      ]
    },
    {
      dayNumber: 4,
      date: '2025-04-04',
      title: '河口湖富士山・天上山公园',
      region: 'Kawaguchiko',
      weatherLat: 35.50,
      weatherLng: 138.76,
      cards: [
        {
          id: 'd4-1',
          type: 'attraction',
          time: '10:00',
          title: '河口湖天上山公园',
          titleJa: 'カチカチ山',
          description: '乘坐缆车登上展望台，俯瞰整个河口湖与对面的富士山。',
          location: {
            name: '河口湖天上山公园',
            address: '山梨县南都留郡富士河口湖町',
            lat: 35.503,
            lng: 138.773
          },
          imageUrl: 'https://images.unsplash.com/photo-1570459027562-4a916cc67706?w=1200'
        },
        {
          id: 'd4-2',
          type: 'restaurant',
          time: '13:00',
          title: '不动 ほうとう 面店',
          titleJa: 'ほうとう不動',
          description: '山梨县名产，浓郁的味噌汤底配上Q弹的手切面。',
          location: {
            name: 'ほうとう不動 河口湖北本店',
            address: '山梨县南都留郡富士河口湖町河口707',
            lat: 35.52,
            lng: 138.76
          },
          cost: '¥1,500/人'
        },
        {
          id: 'd4-3',
          type: 'attraction',
          time: '15:30',
          title: '大石公园',
          titleJa: '大石公園',
          description: '绝佳的富士山拍照景点，四季皆有不同花海。',
          location: {
            name: '大石公园',
            address: '山梨县南都留郡富士河口湖町大石2585',
            lat: 35.522,
            lng: 138.746
          }
        }
      ]
    },
    {
      dayNumber: 5,
      date: '2025-04-05',
      title: '御殿场 Outlet・返回东京',
      region: 'Gotemba',
      weatherLat: 35.30,
      weatherLng: 138.93,
      cards: [
        {
          id: 'd5-1',
          type: 'attraction',
          time: '11:00',
          title: '御殿场 Premium Outlets',
          titleJa: '御殿場アウトレット',
          description: '日本最大的 Outlet，网罗世界各大名牌与富士山美景。',
          location: {
            name: '御殿场 Premium Outlets',
            address: '静冈县御殿场市深泽1312',
            lat: 35.307,
            lng: 138.966
          },
          specialInfos: [{ tag: 'must-buy', text: '记得先去柜台领取外国游客折扣券' }]
        },
        {
          id: 'd5-2',
          type: 'transport',
          time: '17:00',
          title: '还车 & 返回东京',
          description: '在还车前记得加满油。',
          cost: '油费约 ¥3,000'
        }
      ]
    }
  ],
  flightInfo: [
    {
      id: 'fl-1',
      airline: '长荣航空',
      flightNo: 'BR198',
      route: '桃园（TPE）→ 成田（NRT）',
      departure: '2025-04-01 08:50',
      arrival: '2025-04-01 13:15',
      terminal: '第 2 航厦',
      bookingRef: 'EK9XYZ',
      notes: '电子登机证已存'
    },
    {
      id: 'fl-2',
      airline: '长荣航空',
      flightNo: 'BR197',
      route: '成田（NRT）→ 桃园（TPE）',
      departure: '2025-04-07 14:15',
      arrival: '2025-04-07 16:55',
      terminal: '第 2 航厦',
      notes: '起飞前 3 小时抵达机场'
    }
  ],
  hotelInfo: [
    {
      id: 'ht-1',
      name: 'Richmond Hotel Premier Asakusa',
      nights: '4/1 (1晚)',
      address: '东京都台东区浅草2-6-7',
      phone: '03-5806-3155',
      checkIn: '15:00',
      checkOut: '11:00',
      bookingRef: 'RPH-789',
      lat: 35.71,
      lng: 139.79,
      notes: '浅草寺雷门旁，视野极佳'
    },
    {
      id: 'ht-2',
      name: '镰仓王子大饭店',
      nights: '4/2 (1晚)',
      address: '神奈川县镰仓市七里滨东1-2-18',
      phone: '0467-32-1111',
      bookingRef: 'KPC-123',
      lat: 35.303,
      lng: 139.507,
      notes: '七里滨海岸旁'
    }
  ],
  emergencyContacts: [
    { category: '紧急', name: '警察', phone: '110', note: '报外国人专用热线拨 #9110' },
    { category: '紧急', name: '急救/消防', phone: '119' },
    { category: '保险', name: '海外平安险', phone: '0800-010-010', note: '保单 1234567' },
    { category: '租车', name: 'Times Car Rental', phone: '0120-01-5656' }
  ],
  budget: {
    totalBudget: 80000,
    baseCurrency: 'TWD',
    localCurrency: 'JPY',
    exchangeRate: 0.22,
    categories: ['餐食', '住宿', '交通', '门票', '购物', '其他']
  }
}

export function createEmptyTrip(id: string): TripData {
  return {
    id,
    tripName: '新行程',
    year: new Date().getFullYear(),
    totalDays: 1,
    days: [
      {
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        title: '第 1 天',
        region: '目的地',
        weatherLat: 35.6812,
        weatherLng: 139.7671,
        cards: []
      }
    ],
    flightInfo: [],
    hotelInfo: [],
    emergencyContacts: [],
    budget: {
      totalBudget: 0,
      baseCurrency: 'TWD',
      localCurrency: 'USD',
      exchangeRate: 32.0,
      categories: ['餐食', '住宿', '交通', '門票', '購物', '其他']
    }
  }
}

