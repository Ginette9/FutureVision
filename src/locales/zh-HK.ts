// 繁體中文翻譯資源：從 zh-CN 導入完整中文陣列並繁化，確保與英文列表一一對應
import zhCN from './zh-CN';

// 高頻簡繁映射（未覆蓋字符保持原樣）
const s2tMap: Record<string, string> = {
  "与":"與","万":"萬","东":"東","丝":"絲","丢":"丟","两":"兩","严":"嚴","个":"個","临":"臨","为":"為","丽":"麗","举":"舉","义":"義","乌":"烏","乐":"樂","习":"習","书":"書","买":"買","乱":"亂","争":"爭","于":"於","云":"雲","亚":"亞","亩":"畝","亲":"親","亿":"億","仅":"僅","从":"從","仓":"倉","仪":"儀","们":"們","优":"優","会":"會","传":"傳","伤":"傷","伦":"倫","伟":"偉","侨":"僑","侦":"偵","体":"體","侠":"俠","俭":"儉","债":"債","倾":"傾","偿":"償","儿":"兒","党":"黨","兰":"蘭","关":"關","兴":"興","决":"決","况":"況","冻":"凍","净":"淨","刘":"劉","则":"則","刚":"剛","创":"創","删":"刪","别":"別","击":"擊","剑":"劍","动":"動","务":"務","胜":"勝","劳":"勞","势":"勢","勋":"勳","协":"協","单":"單","卖":"賣","卢":"盧","卫":"衛","却":"卻","厅":"廳","历":"歷","厉":"厲","压":"壓","县":"縣","参":"參","双":"雙","发":"發","变":"變","台":"臺","叶":"葉","号":"號","后":"後","启":"啟","吗":"嗎","吨":"噸","听":"聽","员":"員","国":"國","图":"圖","圆":"圓","场":"場","块":"塊","坚":"堅","坏":"壞","垄":"壟","垒":"壘","复":"複","够":"夠","头":"頭","夹":"夾","夺":"奪","妇":"婦","妈":"媽","学":"學","宝":"寶","实":"實","审":"審","宫":"宮","宽":"寬","写":"寫","对":"對","寻":"尋","导":"導","将":"將","尔":"爾","尽":"盡","层":"層","属":"屬","岗":"崗","带":"帶","帐":"帳","师":"師","归":"歸","录":"錄","彻":"徹","恒":"恆","忆":"憶","忧":"憂","怀":"懷","态":"態","恋":"戀","恶":"惡","惯":"慣","戏":"戲","战":"戰","户":"戶","担":"擔","拦":"攔","拢":"攏","择":"擇","挂":"掛","挥":"揮","换":"換","据":"據","损":"損","摆":"擺","摇":"搖","摄":"攝","敌":"敵","断":"斷","旧":"舊","时":"時","显":"顯","晋":"晉","晒":"曬","暂":"暫","术":"術","杂":"雜","权":"權","条":"條","来":"來","杨":"楊","树":"樹","枪":"槍","样":"樣","极":"極","构":"構","柜":"櫃","欢":"歡","欧":"歐","汉":"漢","没":"沒","灭":"滅","灵":"靈","灾":"災","炉":"爐","点":"點","热":"熱","炼":"煉","烦":"煩","烧":"燒","烟":"煙","爱":"愛","爷":"爺","独":"獨","猎":"獵","献":"獻","环":"環","现":"現","电":"電","画":"畫","畅":"暢","疗":"療","盐":"鹽","监":"監","盘":"盤","确":"確","础":"礎","碍":"礙","礼":"禮","祷":"禱","种":"種","称":"稱","税":"稅","积":"積","稳":"穩","窍":"竅","竞":"競","笔":"筆","筑":"築","简":"簡","类":"類","绿":"綠","线":"線","练":"練","纲":"綱","维":"維","绪":"緒","续":"續","网":"網","罚":"罰","览":"覽","觉":"覺","观":"觀","规":"規","购":"購","贸":"貿","费":"費","贪":"貪","资":"資","赋":"賦","软":"軟","辆":"輛","转":"轉","轮":"輪","轻":"輕","辞":"辭","选":"選","遗":"遺","辽":"遼","达":"達","过":"過","运":"運","还":"還","这":"這","进":"進","远":"遠","连":"連","迟":"遲","适":"適","乡":"鄉","酿":"釀","里":"裡","钙":"鈣","钟":"鐘","钢":"鋼","钱":"錢","钻":"鑽","铁":"鐵","铜":"銅","银":"銀","铝":"鋁","铅":"鉛","锌":"鋅","镍":"鎳","长":"長","门":"門","闻":"聞","阀":"閥","阅":"閱","队":"隊","阳":"陽","际":"際","陆":"陸","难":"難","雾":"霧","霉":"黴","静":"靜","题":"題","颜":"顏","额":"額"
};

export const convertToTraditional = (text: string) => text.split('').map(ch => s2tMap[ch] ?? ch).join('');
export const convertArray = (arr: string[]): string[] => arr.map(convertToTraditional);

const industriesZhHK = Array.isArray((zhCN as any)["industries.zh"]) ? convertArray((zhCN as any)["industries.zh"]) : [];
const countriesZhHK  = Array.isArray((zhCN as any)["countries.zh"])  ? convertArray((zhCN as any)["countries.zh"])  : [];

export default {
  // 語言名稱
  "language.zhHK": "繁體中文",
  "language.enUS": "英語",
  "language.zhCN": "簡體中文",

  // AI Loader 繁體中文翻譯
  "aiLoader.title": "AI智能風險評估",
  "aiLoader.subtitle": "正在為您生成專業的ESG風險評估報告",
  "aiLoader.targetIndustry": "目標行業",
  "aiLoader.targetCountry": "目標國家",
  "aiLoader.clientInfo": "客戶資訊",
  "aiLoader.notSelected": "未選擇",
  "aiLoader.progress": "生成進度",
  "aiLoader.step1.title": "正在連接AI分析引擎...",
  "aiLoader.step1.desc": "初始化風險評估模型，加載深度學習算法",
  "aiLoader.step2.title": "抓取最新政策動態",
  "aiLoader.step2.desc": "分析{country}相關ESG法規政策，獲取最新監管要求",
  "aiLoader.step3.title": "收集全球資訊數據",
  "aiLoader.step3.desc": "獲取ESG相關新聞、行業動態和可持續發展趨勢",
  "aiLoader.step4.title": "分析供應鏈風險",
  "aiLoader.step4.desc": "評估{industry}供應鏈風險因素，識別潛在ESG風險點",
  "aiLoader.step5.title": "計算風險評分",
  "aiLoader.step5.desc": "基於多維度數據計算綜合風險指數，生成風險評估矩陣",
  "aiLoader.step6.title": "生成個性化報告",
  "aiLoader.step6.desc": "為您量身定制ESG風險評估報告，包含針對性建議",
  "aiLoader.step7.title": "報告生成完成",
  "aiLoader.step7.desc": "正在為您呈現專業分析結果，報告已準備就緒",
  "aiLoader.processing": "處理中",
  "aiLoader.analyzedDataPoints": "已分析數據點",
  "aiLoader.processedItems": "已處理項目",
  "aiLoader.reportComplete": "報告生成完成",
  "aiLoader.presentingReport": "正在為您呈現專業的ESG風險評估報告...",
  "aiLoader.redirecting": "即將跳轉到報告頁面",
  "aiLoader.pleaseWait": "請耐心等待，AI正在為您進行深度分析",
  "aiLoader.analysisEngine": "分析引擎",
  "aiLoader.gpt4Model": "GPT-4 + 專業ESG模型",
  "aiLoader.dataSource": "數據源",
  "aiLoader.globalESGDatabase": "全球ESG數據庫",
  "aiLoader.updateTime": "更新時間",
  "aiLoader.reportVersion": "報告版本",
  "aiLoader.v2.1.0": "v2.1.0",
  "aiLoader.analyzingRegulations": "正在分析環境法規變化...",
  "aiLoader.evaluatingSocialImpact": "評估社會影響指標...",
  "aiLoader.calculatingGovernanceRisk": "計算治理風險係數...",
  "aiLoader.integratingSupplyChain": "整合供應鏈數據...",
  "aiLoader.generatingRiskMatrix": "生成風險評估矩陣...",
  "aiLoader.optimizingReport": "優化報告結構...",
  "aiLoader.validatingData": "驗證數據準確性...",
  "aiLoader.applyingML": "應用機器學習算法...",
  "aiLoader.generatingCharts": "生成可視化圖表...",
  "aiLoader.refiningRecommendations": "完善風險建議...",

  // 完整繁體化列表（與 en-US 的 industries/countries 順序對齊）
  "industries.zh": industriesZhHK,
  "countries.zh": countriesZhHK
};
