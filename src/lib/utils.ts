import { tripData } from '@/data/itinerary'

export function getTripId() {
  const base = `${tripData.year}-${tripData.tripName}`
  return base.replace(/\s+/g, '').replace(/[^\w\-一-龯ぁ-んァ-ン]/g, '')
}

const currencyMap: Record<string, string> = {
  '台币': 'TWD',
  '新台币': 'TWD',
  '日圆': 'JPY',
  '日元': 'JPY',
  '人民币': 'CNY',
  '美金': 'USD',
  '美元': 'USD',
  '欧元': 'EUR',
  '韩元': 'KRW',
  '韩币': 'KRW',
  '港币': 'HKD',
  '英镑': 'GBP',
  '泰铢': 'THB',
  '澳币': 'AUD',
  '澳元': 'AUD',
  '加币': 'CAD',
  '加元': 'CAD',
  '新加坡币': 'SGD',
  '新币': 'SGD',
  '瑞士法郎': 'CHF',
}

function resolveCurrencyCode(code: string): string {
  const clean = code.trim().toUpperCase()
  return currencyMap[code.trim()] || clean
}

export function formatLocalCurrency(value: number, currencyCode: string = 'JPY') {
  const code = resolveCurrencyCode(currencyCode)
  try {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value)
  } catch (e) {
    // Fallback if the currency code is still invalid for Intl
    return `${currencyCode} ${value.toLocaleString('zh-TW')}`
  }
}

export function formatBaseCurrency(value: number, currencyCode: string = 'TWD') {
  const code = resolveCurrencyCode(currencyCode)
  try {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value)
  } catch (e) {
    // Fallback if the currency code is still invalid for Intl
    return `${currencyCode} ${value.toLocaleString('zh-TW')}`
  }
}

export const isBrowser = typeof window !== 'undefined'

