import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2D2A26',
        paper: '#FAF7F2',
        vermillion: '#C0392B',
        moss: '#5C7A5C',
        card: '#FFFFFF',
        border: '#E8E3DC'
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"ZCOOL XiaoWei"', '"Noto Serif SC"', 'serif']
      },
      boxShadow: {
        soft: '0 18px 40px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        '3xl': '1.5rem'
      }
    }
  },
  plugins: []
}

export default config

