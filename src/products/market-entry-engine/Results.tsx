import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

// 国家名称中英对照映射
const countryNames: { [key: string]: { en: string; zhCN: string; zhHK: string } } = {
  'Afghanistan': { en: 'Afghanistan', zhCN: '阿富汗', zhHK: '阿富汗' },
  'Albania': { en: 'Albania', zhCN: '阿尔巴尼亚', zhHK: '阿爾巴尼亞' },
  'Algeria': { en: 'Algeria', zhCN: '阿尔及利亚', zhHK: '阿爾及利亞' },
  'American Samoa': { en: 'American Samoa', zhCN: '美属萨摩亚', zhHK: '美屬薩摩亞' },
  'Andorra': { en: 'Andorra', zhCN: '安道尔', zhHK: '安道爾' },
  'Angola': { en: 'Angola', zhCN: '安哥拉', zhHK: '安哥拉' },
  'Antigua and Barbuda': { en: 'Antigua and Barbuda', zhCN: '安提瓜和巴布达', zhHK: '安提瓜和巴布達' },
  'Argentina': { en: 'Argentina', zhCN: '阿根廷', zhHK: '阿根廷' },
  'Armenia': { en: 'Armenia', zhCN: '亚美尼亚', zhHK: '亞美尼亞' },
  'Aruba': { en: 'Aruba', zhCN: '阿鲁巴', zhHK: '阿魯巴' },
  'Australia': { en: 'Australia', zhCN: '澳大利亚', zhHK: '澳大利亞' },
  'Austria': { en: 'Austria', zhCN: '奥地利', zhHK: '奧地利' },
  'Azerbaijan': { en: 'Azerbaijan', zhCN: '阿塞拜疆', zhHK: '阿塞拜疆' },
  'Bahamas, The': { en: 'Bahamas, The', zhCN: '巴哈马', zhHK: '巴哈馬' },
  'Bahrain': { en: 'Bahrain', zhCN: '巴林', zhHK: '巴林' },
  'Bangladesh': { en: 'Bangladesh', zhCN: '孟加拉国', zhHK: '孟加拉國' },
  'Barbados': { en: 'Barbados', zhCN: '巴巴多斯', zhHK: '巴巴多斯' },
  'Belarus': { en: 'Belarus', zhCN: '白俄罗斯', zhHK: '白俄羅斯' },
  'Belgium': { en: 'Belgium', zhCN: '比利时', zhHK: '比利時' },
  'Belize': { en: 'Belize', zhCN: '伯利兹', zhHK: '伯利茲' },
  'Benin': { en: 'Benin', zhCN: '贝宁', zhHK: '貝寧' },
  'Bermuda': { en: 'Bermuda', zhCN: '百慕大', zhHK: '百慕大' },
  'Bhutan': { en: 'Bhutan', zhCN: '不丹', zhHK: '不丹' },
  'Bolivia': { en: 'Bolivia', zhCN: '玻利维亚', zhHK: '玻利維亞' },
  'Bosnia and Herzegovina': { en: 'Bosnia and Herzegovina', zhCN: '波黑', zhHK: '波黑' },
  'Botswana': { en: 'Botswana', zhCN: '博茨瓦纳', zhHK: '博茨瓦納' },
  'Brazil': { en: 'Brazil', zhCN: '巴西', zhHK: '巴西' },
  'British Virgin Islands': { en: 'British Virgin Islands', zhCN: '英属维尔京群岛', zhHK: '英屬維爾京群島' },
  'Brunei': { en: 'Brunei', zhCN: '文莱', zhHK: '文萊' },
  'Bulgaria': { en: 'Bulgaria', zhCN: '保加利亚', zhHK: '保加利亞' },
  'Burkina Faso': { en: 'Burkina Faso', zhCN: '布基纳法索', zhHK: '布基納法索' },
  'Burundi': { en: 'Burundi', zhCN: '布隆迪', zhHK: '布隆迪' },
  'Cambodia': { en: 'Cambodia', zhCN: '柬埔寨', zhHK: '柬埔寨' },
  'Cameroon': { en: 'Cameroon', zhCN: '喀麦隆', zhHK: '喀麥隆' },
  'Canada': { en: 'Canada', zhCN: '加拿大', zhHK: '加拿大' },
  'Cape Verde': { en: 'Cape Verde', zhCN: '佛得角', zhHK: '佛得角' },
  'Cayman Islands': { en: 'Cayman Islands', zhCN: '开曼群岛', zhHK: '開曼群島' },
  'Central African Republic': { en: 'Central African Republic', zhCN: '中非共和国', zhHK: '中非共和國' },
  'Chad': { en: 'Chad', zhCN: '乍得', zhHK: '乍得' },
  'Channel Islands': { en: 'Channel Islands', zhCN: '海峡群岛', zhHK: '海峽群島' },
  'Chile': { en: 'Chile', zhCN: '智利', zhHK: '智利' },
  'China': { en: 'China', zhCN: '中国', zhHK: '中國' },
  'Colombia': { en: 'Colombia', zhCN: '哥伦比亚', zhHK: '哥倫比亞' },
  'Comoros': { en: 'Comoros', zhCN: '科摩罗', zhHK: '科摩羅' },
  'Congo, Dem. Rep.': { en: 'Congo, Dem. Rep.', zhCN: '刚果（金）', zhHK: '剛果（金）' },
  'Congo, Rep.': { en: 'Congo, Rep.', zhCN: '刚果（布）', zhHK: '剛果（布）' },
  'Costa Rica': { en: 'Costa Rica', zhCN: '哥斯达黎加', zhHK: '哥斯達黎加' },
  "Cote d'Ivoire": { en: "Cote d'Ivoire", zhCN: '科特迪瓦', zhHK: '科特迪瓦' },
  'Croatia': { en: 'Croatia', zhCN: '克罗地亚', zhHK: '克羅地亞' },
  'Cuba': { en: 'Cuba', zhCN: '古巴', zhHK: '古巴' },
  'Curaçao': { en: 'Curaçao', zhCN: '库拉索', zhHK: '庫拉索' },
  'Cyprus': { en: 'Cyprus', zhCN: '塞浦路斯', zhHK: '塞浦路斯' },
  'Czech Republic': { en: 'Czech Republic', zhCN: '捷克', zhHK: '捷克' },
  'Denmark': { en: 'Denmark', zhCN: '丹麦', zhHK: '丹麥' },
  'Djibouti': { en: 'Djibouti', zhCN: '吉布提', zhHK: '吉布提' },
  'Dominica': { en: 'Dominica', zhCN: '多米尼克', zhHK: '多米尼克' },
  'Dominican Republic': { en: 'Dominican Republic', zhCN: '多米尼加', zhHK: '多米尼加' },
  'East Timor': { en: 'East Timor', zhCN: '东帝汶', zhHK: '東帝汶' },
  'Ecuador': { en: 'Ecuador', zhCN: '厄瓜多尔', zhHK: '厄瓜多爾' },
  'Egypt, Arab Rep.': { en: 'Egypt, Arab Rep.', zhCN: '埃及', zhHK: '埃及' },
  'El Salvador': { en: 'El Salvador', zhCN: '萨尔瓦多', zhHK: '薩爾瓦多' },
  'Equatorial Guinea': { en: 'Equatorial Guinea', zhCN: '赤道几内亚', zhHK: '赤道幾內亞' },
  'Eritrea': { en: 'Eritrea', zhCN: '厄立特里亚', zhHK: '厄立特里亞' },
  'Estonia': { en: 'Estonia', zhCN: '爱沙尼亚', zhHK: '愛沙尼亞' },
  'Eswatini': { en: 'Eswatini', zhCN: '斯威士兰', zhHK: '斯威士蘭' },
  'Ethiopia(includes Eritrea)': { en: 'Ethiopia(includes Eritrea)', zhCN: '埃塞俄比亚（含厄立特里亚）', zhHK: '埃塞俄比亞（含厄立特里亞）' },
  'European Union': { en: 'European Union', zhCN: '欧盟', zhHK: '歐盟' },
  'Faeroe Islands': { en: 'Faeroe Islands', zhCN: '法罗群岛', zhHK: '法羅群島' },
  'Fiji': { en: 'Fiji', zhCN: '斐济', zhHK: '斐濟' },
  'Finland': { en: 'Finland', zhCN: '芬兰', zhHK: '芬蘭' },
  'France': { en: 'France', zhCN: '法国', zhHK: '法國' },
  'French Polynesia': { en: 'French Polynesia', zhCN: '法属波利尼西亚', zhHK: '法屬波利尼西亞' },
  'Gabon': { en: 'Gabon', zhCN: '加蓬', zhHK: '加蓬' },
  'Gambia, The': { en: 'Gambia, The', zhCN: '冈比亚', zhHK: '岡比亞' },
  'Georgia': { en: 'Georgia', zhCN: '格鲁吉亚', zhHK: '格魯吉亞' },
  'Germany': { en: 'Germany', zhCN: '德国', zhHK: '德國' },
  'Ghana': { en: 'Ghana', zhCN: '加纳', zhHK: '加納' },
  'Gibraltar': { en: 'Gibraltar', zhCN: '直布罗陀', zhHK: '直布羅陀' },
  'Greece': { en: 'Greece', zhCN: '希腊', zhHK: '希臘' },
  'Greenland': { en: 'Greenland', zhCN: '格陵兰', zhHK: '格陵蘭' },
  'Grenada': { en: 'Grenada', zhCN: '格林纳达', zhHK: '格林納達' },
  'Guam': { en: 'Guam', zhCN: '关岛', zhHK: '關島' },
  'Guatemala': { en: 'Guatemala', zhCN: '危地马拉', zhHK: '危地馬拉' },
  'Guinea': { en: 'Guinea', zhCN: '几内亚', zhHK: '幾內亞' },
  'Guinea-Bissau': { en: 'Guinea-Bissau', zhCN: '几内亚比绍', zhHK: '幾內亞比紹' },
  'Guyana': { en: 'Guyana', zhCN: '圭亚那', zhHK: '圭亞那' },
  'Haiti': { en: 'Haiti', zhCN: '海地', zhHK: '海地' },
  'Honduras': { en: 'Honduras', zhCN: '洪都拉斯', zhHK: '洪都拉斯' },
  'Hong Kong, China': { en: 'Hong Kong, China', zhCN: '中国香港', zhHK: '中國香港' },
  'Hungary': { en: 'Hungary', zhCN: '匈牙利', zhHK: '匈牙利' },
  'Iceland': { en: 'Iceland', zhCN: '冰岛', zhHK: '冰島' },
  'India': { en: 'India', zhCN: '印度', zhHK: '印度' },
  'Indonesia': { en: 'Indonesia', zhCN: '印度尼西亚', zhHK: '印度尼西亞' },
  'Iran, Islamic Rep.': { en: 'Iran, Islamic Rep.', zhCN: '伊朗', zhHK: '伊朗' },
  'Iraq': { en: 'Iraq', zhCN: '伊拉克', zhHK: '伊拉克' },
  'Ireland': { en: 'Ireland', zhCN: '爱尔兰', zhHK: '愛爾蘭' },
  'Israel': { en: 'Israel', zhCN: '以色列', zhHK: '以色列' },
  'Italy': { en: 'Italy', zhCN: '意大利', zhHK: '意大利' },
  'Jamaica': { en: 'Jamaica', zhCN: '牙买加', zhHK: '牙買加' },
  'Japan': { en: 'Japan', zhCN: '日本', zhHK: '日本' },
  'Jordan': { en: 'Jordan', zhCN: '约旦', zhHK: '約旦' },
  'Kazakhstan': { en: 'Kazakhstan', zhCN: '哈萨克斯坦', zhHK: '哈薩克斯坦' },
  'Kenya': { en: 'Kenya', zhCN: '肯尼亚', zhHK: '肯尼亞' },
  'Kiribati': { en: 'Kiribati', zhCN: '基里巴斯', zhHK: '基里巴斯' },
  'Korea, Dem. Rep.': { en: 'Korea, Dem. Rep.', zhCN: '朝鲜', zhHK: '朝鮮' },
  'Korea, Rep.': { en: 'Korea, Rep.', zhCN: '韩国', zhHK: '韓國' },
  'Kosovo': { en: 'Kosovo', zhCN: '科索沃', zhHK: '科索沃' },
  'Kuwait': { en: 'Kuwait', zhCN: '科威特', zhHK: '科威特' },
  'Kyrgyz Republic': { en: 'Kyrgyz Republic', zhCN: '吉尔吉斯斯坦', zhHK: '吉爾吉斯斯坦' },
  'Lao PDR': { en: 'Lao PDR', zhCN: '老挝', zhHK: '老撾' },
  'Latvia': { en: 'Latvia', zhCN: '拉脱维亚', zhHK: '拉脫維亞' },
  'Lebanon': { en: 'Lebanon', zhCN: '黎巴嫩', zhHK: '黎巴嫩' },
  'Lesotho': { en: 'Lesotho', zhCN: '莱索托', zhHK: '萊索托' },
  'Liberia': { en: 'Liberia', zhCN: '利比里亚', zhHK: '利比里亞' },
  'Libya': { en: 'Libya', zhCN: '利比亚', zhHK: '利比亞' },
  'Liechtenstein': { en: 'Liechtenstein', zhCN: '列支敦士登', zhHK: '列支敦士登' },
  'Lithuania': { en: 'Lithuania', zhCN: '立陶宛', zhHK: '立陶宛' },
  'Luxembourg': { en: 'Luxembourg', zhCN: '卢森堡', zhHK: '盧森堡' },
  'Macao, China': { en: 'Macao, China', zhCN: '中国澳门', zhHK: '中國澳門' },
  'Madagascar': { en: 'Madagascar', zhCN: '马达加斯加', zhHK: '馬達加斯加' },
  'Malawi': { en: 'Malawi', zhCN: '马拉维', zhHK: '馬拉維' },
  'Malaysia': { en: 'Malaysia', zhCN: '马来西亚', zhHK: '馬來西亞' },
  'Maldives': { en: 'Maldives', zhCN: '马尔代夫', zhHK: '馬爾代夫' },
  'Mali': { en: 'Mali', zhCN: '马里', zhHK: '馬里' },
  'Malta': { en: 'Malta', zhCN: '马耳他', zhHK: '馬耳他' },
  'Marshall Islands': { en: 'Marshall Islands', zhCN: '马绍尔群岛', zhHK: '馬紹爾群島' },
  'Mauritania': { en: 'Mauritania', zhCN: '毛里塔尼亚', zhHK: '毛里塔尼亞' },
  'Mauritius': { en: 'Mauritius', zhCN: '毛里求斯', zhHK: '毛里求斯' },
  'Mexico': { en: 'Mexico', zhCN: '墨西哥', zhHK: '墨西哥' },
  'Micronesia, Fed. Sts.': { en: 'Micronesia, Fed. Sts.', zhCN: '密克罗尼西亚联邦', zhHK: '密克羅尼西亞聯邦' },
  'Moldova': { en: 'Moldova', zhCN: '摩尔多瓦', zhHK: '摩爾多瓦' },
  'Monaco': { en: 'Monaco', zhCN: '摩纳哥', zhHK: '摩納哥' },
  'Mongolia': { en: 'Mongolia', zhCN: '蒙古', zhHK: '蒙古' },
  'Montenegro': { en: 'Montenegro', zhCN: '黑山', zhHK: '黑山' },
  'Morocco': { en: 'Morocco', zhCN: '摩洛哥', zhHK: '摩洛哥' },
  'Mozambique': { en: 'Mozambique', zhCN: '莫桑比克', zhHK: '莫桑比克' },
  'Myanmar': { en: 'Myanmar', zhCN: '缅甸', zhHK: '緬甸' },
  'Namibia': { en: 'Namibia', zhCN: '纳米比亚', zhHK: '納米比亞' },
  'Nauru': { en: 'Nauru', zhCN: '瑙鲁', zhHK: '瑙魯' },
  'Nepal': { en: 'Nepal', zhCN: '尼泊尔', zhHK: '尼泊爾' },
  'Netherlands': { en: 'Netherlands', zhCN: '荷兰', zhHK: '荷蘭' },
  'New Caledonia': { en: 'New Caledonia', zhCN: '新喀里多尼亚', zhHK: '新喀里多尼亞' },
  'New Zealand': { en: 'New Zealand', zhCN: '新西兰', zhHK: '新西蘭' },
  'Nicaragua': { en: 'Nicaragua', zhCN: '尼加拉瓜', zhHK: '尼加拉瓜' },
  'Niger': { en: 'Niger', zhCN: '尼日尔', zhHK: '尼日爾' },
  'Nigeria': { en: 'Nigeria', zhCN: '尼日利亚', zhHK: '尼日利亞' },
  'North Macedonia': { en: 'North Macedonia', zhCN: '北马其顿', zhHK: '北馬其頓' },
  'Northern Mariana Islands': { en: 'Northern Mariana Islands', zhCN: '北马里亚纳群岛', zhHK: '北馬里亞納群島' },
  'Norway': { en: 'Norway', zhCN: '挪威', zhHK: '挪威' },
  'Oman': { en: 'Oman', zhCN: '阿曼', zhHK: '阿曼' },
  'Pakistan': { en: 'Pakistan', zhCN: '巴基斯坦', zhHK: '巴基斯坦' },
  'Palau': { en: 'Palau', zhCN: '帕劳', zhHK: '帕勞' },
  'Palestine, State of': { en: 'Palestine, State of', zhCN: '巴勒斯坦', zhHK: '巴勒斯坦' },
  'Panama': { en: 'Panama', zhCN: '巴拿马', zhHK: '巴拿馬' },
  'Papua New Guinea': { en: 'Papua New Guinea', zhCN: '巴布亚新几内亚', zhHK: '巴布亞新幾內亞' },
  'Paraguay': { en: 'Paraguay', zhCN: '巴拉圭', zhHK: '巴拉圭' },
  'Peru': { en: 'Peru', zhCN: '秘鲁', zhHK: '秘魯' },
  'Philippines': { en: 'Philippines', zhCN: '菲律宾', zhHK: '菲律賓' },
  'Poland': { en: 'Poland', zhCN: '波兰', zhHK: '波蘭' },
  'Portugal': { en: 'Portugal', zhCN: '葡萄牙', zhHK: '葡萄牙' },
  'Puerto Rico': { en: 'Puerto Rico', zhCN: '波多黎各', zhHK: '波多黎各' },
  'Qatar': { en: 'Qatar', zhCN: '卡塔尔', zhHK: '卡塔爾' },
  'Romania': { en: 'Romania', zhCN: '罗马尼亚', zhHK: '羅馬尼亞' },
  'Russian Federation': { en: 'Russian Federation', zhCN: '俄罗斯', zhHK: '俄羅斯' },
  'Rwanda': { en: 'Rwanda', zhCN: '卢旺达', zhHK: '盧旺達' },
  'Saint Maarten (Dutch part)': { en: 'Saint Maarten (Dutch part)', zhCN: '圣马丁（荷属）', zhHK: '聖馬丁（荷屬）' },
  'Saint Martin (French Part)': { en: 'Saint Martin (French Part)', zhCN: '圣马丁（法属）', zhHK: '聖馬丁（法屬）' },
  'Samoa': { en: 'Samoa', zhCN: '萨摩亚', zhHK: '薩摩亞' },
  'San Marino': { en: 'San Marino', zhCN: '圣马力诺', zhHK: '聖馬力諾' },
  'Sao Tome and Principe': { en: 'Sao Tome and Principe', zhCN: '圣多美和普林西比', zhHK: '聖多美和普林西比' },
  'Saudi Arabia': { en: 'Saudi Arabia', zhCN: '沙特阿拉伯', zhHK: '沙特阿拉伯' },
  'Senegal': { en: 'Senegal', zhCN: '塞内加尔', zhHK: '塞內加爾' },
  'Serbia, FR(Serbia/Montenegro)': { en: 'Serbia, FR(Serbia/Montenegro)', zhCN: '塞尔维亚', zhHK: '塞爾維亞' },
  'Seychelles': { en: 'Seychelles', zhCN: '塞舌尔', zhHK: '塞舌爾' },
  'Sierra Leone': { en: 'Sierra Leone', zhCN: '塞拉利昂', zhHK: '塞拉利昂' },
  'Singapore': { en: 'Singapore', zhCN: '新加坡', zhHK: '新加坡' },
  'Slovak Republic': { en: 'Slovak Republic', zhCN: '斯洛伐克', zhHK: '斯洛伐克' },
  'Slovenia': { en: 'Slovenia', zhCN: '斯洛文尼亚', zhHK: '斯洛文尼亞' },
  'Solomon Islands': { en: 'Solomon Islands', zhCN: '所罗门群岛', zhHK: '所羅門群島' },
  'Somalia': { en: 'Somalia', zhCN: '索马里', zhHK: '索馬里' },
  'South Africa': { en: 'South Africa', zhCN: '南非', zhHK: '南非' },
  'South Sudan': { en: 'South Sudan', zhCN: '南苏丹', zhHK: '南蘇丹' },
  'Spain': { en: 'Spain', zhCN: '西班牙', zhHK: '西班牙' },
  'Sri Lanka': { en: 'Sri Lanka', zhCN: '斯里兰卡', zhHK: '斯里蘭卡' },
  'St. Kitts and Nevis': { en: 'St. Kitts and Nevis', zhCN: '圣基茨和尼维斯', zhHK: '聖基茨和尼維斯' },
  'St. Lucia': { en: 'St. Lucia', zhCN: '圣卢西亚', zhHK: '聖盧西亞' },
  'St. Vincent and the Grenadines': { en: 'St. Vincent and the Grenadines', zhCN: '圣文森特和格林纳丁斯', zhHK: '聖文森特和格林納丁斯' },
  'Sudan': { en: 'Sudan', zhCN: '苏丹', zhHK: '蘇丹' },
  'Suriname': { en: 'Suriname', zhCN: '苏里南', zhHK: '蘇里南' },
  'Sweden': { en: 'Sweden', zhCN: '瑞典', zhHK: '瑞典' },
  'Switzerland': { en: 'Switzerland', zhCN: '瑞士', zhHK: '瑞士' },
  'Syrian Arab Republic': { en: 'Syrian Arab Republic', zhCN: '叙利亚', zhHK: '敘利亞' },
  'Taiwan, China': { en: 'Taiwan, China', zhCN: '台湾', zhHK: '台灣' },
  'Tajikistan': { en: 'Tajikistan', zhCN: '塔吉克斯坦', zhHK: '塔吉克斯坦' },
  'Tanzania': { en: 'Tanzania', zhCN: '坦桑尼亚', zhHK: '坦桑尼亞' },
  'Thailand': { en: 'Thailand', zhCN: '泰国', zhHK: '泰國' },
  'Togo': { en: 'Togo', zhCN: '多哥', zhHK: '多哥' },
  'Tonga': { en: 'Tonga', zhCN: '汤加', zhHK: '湯加' },
  'Trinidad and Tobago': { en: 'Trinidad and Tobago', zhCN: '特立尼达和多巴哥', zhHK: '特立尼達和多巴哥' },
  'Tunisia': { en: 'Tunisia', zhCN: '突尼斯', zhHK: '突尼斯' },
  'Turkey': { en: 'Turkey', zhCN: '土耳其', zhHK: '土耳其' },
  'Turkmenistan': { en: 'Turkmenistan', zhCN: '土库曼斯坦', zhHK: '土庫曼斯坦' },
  'Turks and Caicos Isl.': { en: 'Turks and Caicos Isl.', zhCN: '特克斯和凯科斯群岛', zhHK: '特克斯和凱科斯群島' },
  'Tuvalu': { en: 'Tuvalu', zhCN: '图瓦卢', zhHK: '圖瓦盧' },
  'Uganda': { en: 'Uganda', zhCN: '乌干达', zhHK: '烏干達' },
  'Ukraine': { en: 'Ukraine', zhCN: '乌克兰', zhHK: '烏克蘭' },
  'United Arab Emirates': { en: 'United Arab Emirates', zhCN: '阿联酋', zhHK: '阿聯酋' },
  'United Kingdom': { en: 'United Kingdom', zhCN: '英国', zhHK: '英國' },
  'United States': { en: 'United States', zhCN: '美国', zhHK: '美國' },
  'Uruguay': { en: 'Uruguay', zhCN: '乌拉圭', zhHK: '烏拉圭' },
  'Uzbekistan': { en: 'Uzbekistan', zhCN: '乌兹别克斯坦', zhHK: '烏茲別克斯坦' },
  'Vanuatu': { en: 'Vanuatu', zhCN: '瓦努阿图', zhHK: '瓦努阿圖' },
  'Venezuela': { en: 'Venezuela', zhCN: '委内瑞拉', zhHK: '委內瑞拉' },
  'Vietnam': { en: 'Vietnam', zhCN: '越南', zhHK: '越南' },
  'Virgin Islands (U.S.)': { en: 'Virgin Islands (U.S.)', zhCN: '美属维尔京群岛', zhHK: '美屬維爾京群島' },
  'Yemen': { en: 'Yemen', zhCN: '也门', zhHK: '也門' },
  'Zambia': { en: 'Zambia', zhCN: '赞比亚', zhHK: '贊比亞' },
  'Zimbabwe': { en: 'Zimbabwe', zhCN: '津巴布韦', zhHK: '津巴布韋' }
};

// 获取翻译后的国家名称
const getCountryName = (englishName: string, lang: string): string => {
  const mapping = countryNames[englishName];
  if (!mapping) return englishName;
  if (lang === 'en-US') return mapping.en;
  if (lang === 'zh-HK') return mapping.zhHK;
  return mapping.zhCN;
};

// 格式化市场规模，根据数值大小自动选择合适的单位
const formatMarketSize = (size: number): string => {
  if (size >= 1000) {
    // 大于等于1000百万，使用B单位（1B = 1000M）
    return (size / 1000).toFixed(1) + 'B';
  } else {
    // 其他情况，使用M单位
    return size.toFixed(1) + 'M';
  }
};

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { hsCode, data: initialData } = location.state || { hsCode: '', data: null };
  
  const [results, setResults] = useState<any[]>([]);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('stable');
  const [confidenceFilter, setConfidenceFilter] = useState(false);
  const [showAdjusted, setShowAdjusted] = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // 多语言标签
  const labels = {
    backButton: language === 'en-US' ? '← Back to Search' : language === 'zh-HK' ? '← 返回搜索' : '← 返回搜索',
    hsCode: language === 'en-US' ? 'HS Code: ' : language === 'zh-HK' ? 'HS編碼: ' : 'HS编码: ',
    loading: language === 'en-US' ? 'Loading analysis results...' : language === 'zh-HK' ? '加載分析結果中...' : '加载分析结果中...',
    analysisMode: language === 'en-US' ? 'Analysis Mode' : language === 'zh-HK' ? '分析模式' : '分析模式',
    stableMode: language === 'en-US' ? 'Stable Development' : language === 'zh-HK' ? '穩健發展型' : '稳健发展型',
    growthMode: language === 'en-US' ? 'Growth Potential' : language === 'zh-HK' ? '潛力增長型' : '潜力增长型',
    blueseaMode: language === 'en-US' ? 'Chinese Blue Ocean' : language === 'zh-HK' ? '國貨藍海型' : '国货蓝海型',
    confidenceAdjustment: language === 'en-US' ? 'Confidence Adjustment' : language === 'zh-HK' ? '置信度調節' : '置信度调节',
    showAdjustedResults: language === 'en-US' ? 'Show confidence-adjusted results' : language === 'zh-HK' ? '顯示置信度調節後結果' : '显示置信度调节后结果',
    marketOverview: language === 'en-US' ? 'Market Overview' : language === 'zh-HK' ? '市場概覽' : '市场概览',
    countries: language === 'en-US' ? 'Countries' : language === 'zh-HK' ? '國家' : '国家',
    totalMarketSize: language === 'en-US' ? 'Total Market Size' : language === 'zh-HK' ? '總市場規模' : '总市场规模',
    avgGrowthRate: language === 'en-US' ? 'Average Growth Rate' : language === 'zh-HK' ? '平均增長率' : '平均增长率',
    avgGdp: language === 'en-US' ? 'Average GDP' : language === 'zh-HK' ? '平均GDP' : '平均GDP',
    confidenceAdjustmentDesc: language === 'en-US' ? 'When enabled, the system will recalculate rankings based on each model score, displaying the Top 10 countries under this mode after confidence adjustment.' : language === 'zh-HK' ? '開啟後，系統將根據各模型得分重新計算排名，展示置信度調節後該模式下的Top 10國家。' : '开启后，系统将根据各模型得分重新计算排名，展示置信度调节后该模式下的Top 10国家。',
    analysisResults: language === 'en-US' ? 'Market Analysis Results' : language === 'zh-HK' ? '市場分析結果' : '市场分析结果',
    basedOnMode: language === 'en-US' ? 'Based on ' : language === 'zh-HK' ? '基於' : '基于',
    modeAnalysis: language === 'en-US' ? ' mode analysis results' : language === 'zh-HK' ? '模式的分析結果' : '模式的分析结果',
    originalResults: language === 'en-US' ? 'Original Results' : language === 'zh-HK' ? '原始結果' : '原始结果',
    adjustedResults: language === 'en-US' ? 'Confidence Adjusted' : language === 'zh-HK' ? '置信度調節後' : '置信度调节后',
    countriesAnalyzed: language === 'en-US' ? 'Countries Analyzed' : language === 'zh-HK' ? '分析國家數' : '分析国家数',
    confidence: language === 'en-US' ? 'Confidence: ' : language === 'zh-HK' ? '置信度: ' : '置信度: ',
    highConfidence: language === 'en-US' ? 'High' : language === 'zh-HK' ? '高' : '高',
    mediumConfidence: language === 'en-US' ? 'Medium' : language === 'zh-HK' ? '中' : '中',
    lowConfidence: language === 'en-US' ? 'Low' : language === 'zh-HK' ? '低' : '低',
    recommendationIndex: language === 'en-US' ? 'Recommendation Index' : language === 'zh-HK' ? '推薦指數' : '推荐指数',
    marketSize: language === 'en-US' ? 'Market Size' : language === 'zh-HK' ? '市場規模' : '市场规模',
    annualGrowthRate: language === 'en-US' ? 'Annual Growth Rate' : language === 'zh-HK' ? '年增長率' : '年增长率',
    chinaImportShare: language === 'en-US' ? 'China Import Share' : language === 'zh-HK' ? '中國進口佔比' : '中国进口占比',
    gdpPerCapita: language === 'en-US' ? 'GDP Per Capita' : language === 'zh-HK' ? '人均GDP' : '人均GDP',
    governanceLevel: language === 'en-US' ? 'Governance Level' : language === 'zh-HK' ? '治理水平' : '治理水平',
    tariffRate: language === 'en-US' ? 'Tariff Rate' : language === 'zh-HK' ? '關稅稅率' : '关税税率',
    coreIndicators: language === 'en-US' ? 'Core Indicators Analysis' : language === 'zh-HK' ? '核心指標分析' : '核心指标分析',
    marketMaturity: language === 'en-US' ? 'Market Maturity' : language === 'zh-HK' ? '市場成熟度' : '市场成熟度',
    businessEnvironment: language === 'en-US' ? 'Business Environment Quality' : language === 'zh-HK' ? '營商環境質量' : '营商环境质量',
    chinaSupplyChainMatch: language === 'en-US' ? 'China Supply Chain Match' : language === 'zh-HK' ? '中國供應鏈匹配度' : '中国供应链匹配度',
    tariffFriendliness: language === 'en-US' ? 'Tariff Friendliness' : language === 'zh-HK' ? '關稅友好度' : '关税友好度',
    privacyPolicy: language === 'en-US' ? 'Privacy Policy' : language === 'zh-HK' ? '隱私政策' : '隐私政策',
    termsOfService: language === 'en-US' ? 'Terms of Service' : language === 'zh-HK' ? '服務條款' : '服务条款',
    contactUs: language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们',
    copyright: language === 'en-US' ? '© 2026 Maker Sustainability Consulting. All rights reserved.' : language === 'zh-HK' ? '© 2026 Maker Sustainability Consulting. 保留所有權利。' : '© 2026 Maker Sustainability Consulting. 保留所有权利。'
  };

  useEffect(() => {
    if (initialData) {
      // 使用传递过来的数据
      setResults(initialData.top_10 || []);
      setAllCountries(initialData.all_countries || []);
      setSummary(initialData.summary || {});
      setIsLoading(false);
    } else if (hsCode) {
      // 如果没有传递数据，重新获取
      fetchData(hsCode, selectedMode);
    } else {
      setIsLoading(false);
    }
  }, [hsCode, initialData]);

  const fetchData = async (code: string, mode: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/market-entry-engine/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          hs_code: code, 
          mode: mode 
        })
      });
      
      const data = await response.json();
      if (data.top_10) {
        setResults(data.top_10);
        setAllCountries(data.all_countries || []);
        setSummary(data.summary || {});
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    if (hsCode) {
      fetchData(hsCode, mode);
    }
  };

  const handleConfidenceToggle = () => {
    const newValue = !confidenceFilter;
    setConfidenceFilter(newValue);
    setShowAdjusted(newValue);
  };

  const handleComparisonToggle = (value: boolean) => {
    setShowAdjusted(value);
    setConfidenceFilter(value);
  };

  const handleCountryToggle = (country: string) => {
    if (expandedCountry === country) {
      setExpandedCountry(null);
    } else {
      setExpandedCountry(country);
    }
  };

  const handleBack = () => {
    navigate('/market-entry-engine/search');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">{labels.loading}</div>
        </div>
      </div>
    );
  }

  // 获取当前模式的分数字段
  const getScoreFields = () => {
    const baseScoreField = selectedMode === 'stable' ? '稳健发展型_base_score' :
                          selectedMode === 'growth' ? '潜力增长型_base_score' :
                          '国货蓝海型_base_score';
    const finalScoreField = selectedMode === 'stable' ? '稳健发展型_final_score' :
                          selectedMode === 'growth' ? '潜力增长型_final_score' :
                          '国货蓝海型_final_score';
    return { baseScoreField, finalScoreField };
  };

  // 获取国家的推荐指数
  const getCountryScore = (country: any) => {
    const { baseScoreField, finalScoreField } = getScoreFields();
    const scoreField = confidenceFilter ? finalScoreField : baseScoreField;
    return country[scoreField] || country['推荐指数'] || 0;
  };

  // 根据选择的分析模式和置信度调节计算top10
  const getTop10ByMode = () => {
    if (allCountries.length === 0) return results;

    const { baseScoreField, finalScoreField } = getScoreFields();
    const scoreField = confidenceFilter ? finalScoreField : baseScoreField;

    // 排序并取前10
    const sorted = [...allCountries].sort((a, b) => (b[scoreField] || 0) - (a[scoreField] || 0));
    return sorted.slice(0, 10);
  };

  // 过滤结果
  const filteredResults = getTop10ByMode();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-sm font-medium">
            {labels.hsCode}{hsCode}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {labels.backButton}
            </button>
          </div>
        </div>
      </header>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="mb-8">
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                {labels.analysisMode}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleModeChange('stable')}
                  className={`w-full px-4 py-3 text-left border ${selectedMode === 'stable' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {labels.stableMode}
                </button>
                <button
                  onClick={() => handleModeChange('growth')}
                  className={`w-full px-4 py-3 text-left border ${selectedMode === 'growth' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {labels.growthMode}
                </button>
                <button
                  onClick={() => handleModeChange('bluesea')}
                  className={`w-full px-4 py-3 text-left border ${selectedMode === 'bluesea' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {labels.blueseaMode}
                </button>
              </div>
            </div>
            <div className="mb-8">
              <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                {labels.confidenceAdjustment}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {labels.showAdjustedResults}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confidenceFilter}
                    onChange={handleConfidenceToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                {labels.marketOverview}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">{labels.countries}</div>
                  <div className="text-sm font-medium">{summary.total_countries || 0}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">{labels.totalMarketSize}</div>
                  <div className="text-sm font-medium">${summary.total_market_size ? formatMarketSize(summary.total_market_size) : '0'}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">{labels.avgGrowthRate}</div>
                  <div className="text-sm font-medium">{summary.avg_growth_rate ? Math.round(summary.avg_growth_rate * 100) + '%' : '0%'}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">{labels.avgGdp}</div>
                  <div className="text-sm font-medium">${summary.avg_gdp ? summary.avg_gdp.toLocaleString() : '0'}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                {labels.confidenceAdjustment}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {labels.confidenceAdjustmentDesc}
              </div>
            </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold mb-2">
                {labels.analysisResults}
              </h2>
              <p className="text-gray-600">
                {labels.basedOnMode}{selectedMode === 'stable' ? labels.stableMode : selectedMode === 'growth' ? labels.growthMode : labels.blueseaMode}{labels.modeAnalysis}
              </p>
            </div>
            
            {/* 两版结果对比 */}
            <div className="mb-8">
              <div className="flex gap-4">
                <button
                  onClick={() => handleComparisonToggle(false)}
                  className={`px-6 py-2 ${!showAdjusted ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'} rounded-md text-sm font-medium`}
                >
                  {labels.originalResults}
                </button>
                <button
                  onClick={() => handleComparisonToggle(true)}
                  className={`px-6 py-2 ${showAdjusted ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'} rounded-md text-sm font-medium`}
                >
                  {labels.adjustedResults}
                </button>
              </div>
            </div>

            {/* 汇总统计 */}
            <div className="mb-8 bg-white border border-gray-200 p-6 rounded-lg">
              <div className="text-sm font-mono tracking-widest text-gray-500 uppercase mb-4">
                {labels.marketOverview}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-mono font-bold text-black mb-2">
                    {summary.total_countries || 0}
                  </div>
                  <div className="text-xs text-gray-500">{labels.countriesAnalyzed}</div>
                </div>
              </div>
            </div>

            {/* 国家卡片流 */}
            <div className="space-y-4">
              {filteredResults.map((country, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white border ${expandedCountry === country['国家全称'] ? 'border-green-500' : 'border-gray-200'} p-6 hover:shadow-md transition-all duration-300 cursor-pointer`}
                  onClick={() => handleCountryToggle(country['国家全称'])}
                >
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold ${index < 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-serif font-bold mb-1">
                            {getCountryName(country['国家全称'], language)}
                          </h3>
                          <div className="text-xs font-mono text-gray-500">
                            {labels.confidence}{country['置信度'] === 1 ? labels.highConfidence : country['置信度'] === 2 ? labels.mediumConfidence : labels.lowConfidence}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-green-600">
                          {getCountryScore(country).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          {labels.recommendationIndex}
                        </div>
                      </div>
                    </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="text-sm text-gray-600">{labels.marketSize}</div>
                      <div className="text-sm font-medium">${country['2024年世界进口额'].toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="text-sm text-gray-600">{labels.annualGrowthRate}</div>
                      <div className="text-sm font-medium">{Math.round(country['可用年平均增长率（AAGR）'] * 100)}%</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="text-sm text-gray-600">{labels.chinaImportShare}</div>
                      <div className="text-sm font-medium">{Math.round(country['2024年向中国进口金额占总进口额比重'] * 100)}%</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="text-sm text-gray-600">{labels.gdpPerCapita}</div>
                      <div className="text-sm font-medium">${country['2024年人均GDP'].toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="text-sm text-gray-600">{labels.governanceLevel}</div>
                      <div className="text-sm font-medium">{country['2024年治理水平'].toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">{labels.tariffRate}</div>
                      <div className="text-sm font-medium">{country['2023 Average Tariff Raw（%）']}%</div>
                    </div>
                  </div>
                  
                  {/* 展开的雷达图区域 */}
                  {expandedCountry === country['国家全称'] && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                        <h4 className="text-sm font-medium mb-4">{labels.coreIndicators}</h4>
                        <div className="space-y-3">
                          {
                            [
                              { name: labels.marketSize, value: country['市场规模-标准得分'] || 0 },
                              { name: labels.annualGrowthRate, value: country['市场成长性-标准得分'] || 0 },
                              { name: labels.marketMaturity, value: country['市场成熟度-标准得分'] || 0 },
                              { name: labels.businessEnvironment, value: country['营商环境质量-标准得分'] || 0 },
                              { name: labels.chinaSupplyChainMatch, value: country['中国供应链匹配度-标准得分'] || 0 },
                              { name: labels.tariffFriendliness, value: country['关税友好度-标准得分'] || 0 }
                            ].map((metric, idx) => {
                              const normalizedValue = metric.value;
                              return (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">{metric.name}</div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium">{normalizedValue.toFixed(1)}</div>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${normalizedValue}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-md h-64">
                          {/* 雷达图 */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
                              [
                                { subject: labels.marketSize, value: country['市场规模-标准得分'] || 0 },
                                { subject: labels.annualGrowthRate, value: country['市场成长性-标准得分'] || 0 },
                                { subject: labels.marketMaturity, value: country['市场成熟度-标准得分'] || 0 },
                                { subject: labels.businessEnvironment, value: country['营商环境质量-标准得分'] || 0 },
                                { subject: labels.chinaSupplyChainMatch, value: country['中国供应链匹配度-标准得分'] || 0 },
                                { subject: labels.tariffFriendliness, value: country['关税友好度-标准得分'] || 0 }
                              ]
                            }>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar name={labels.coreIndicators} dataKey="value" stroke="#000" fill="#000" fillOpacity={0.3} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            {labels.copyright}
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">
              {labels.privacyPolicy}
            </a>
            <a href="#" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">
              {labels.termsOfService}
            </a>
            <a href="#" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">
              {labels.contactUs}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Results;