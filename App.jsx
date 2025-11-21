import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Compass, Coffee, Utensils, Train, Search, Plus, Trash2, ChevronRight, Heart, Sun, Sparkles, X, Loader2, MessageCircle, Car, CheckSquare, Calculator, ClipboardList, BedDouble, Home, Building, Tent, TrendingUp, CloudSun, Newspaper, ArrowRight, Settings, Globe, Gift, UtensilsCrossed, ShoppingBag, ExternalLink, Bot, Copy, RefreshCw, Save, AlertTriangle, Share2, Map, Info, Check, Plane, Send, User } from 'lucide-react';

// 👇👇👇 [적용 완료] 사용자님의 Gemini API 키 👇👇👇
const apiKey = "AIzaSyAICW57MvBMAswAh4DpuqHWPOxGvd7-u8A"; 

// --- [핵심 수정] 로컬 스토리지 훅 (비동기 상태 유실 방지) ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // [수정됨] setValue 함수가 항상 최신 상태(current)를 가져와서 업데이트하도록 변경
  const setValue = (value) => {
    setStoredValue((current) => {
      try {
        const valueToStore = value instanceof Function ? value(current) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      } catch (error) {
        console.error(error);
        return current;
      }
    });
  };
  return [storedValue, setValue];
};

// --- 메인 아이콘 ---
const AppLogo = () => {
    const logoUrl = "https://cdn-icons-png.flaticon.com/512/4712/4712139.png"; 
    return (
        <div className="bg-gradient-to-br from-rose-100 to-orange-50 p-1.5 rounded-xl shadow-sm overflow-hidden w-10 h-10 flex items-center justify-center border border-rose-100 relative group cursor-pointer hover:shadow-md transition-all">
             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
             <img 
                src={logoUrl} 
                alt="Travel Bot" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.target.style.display = 'none'; }} 
             />
             <Bot size={24} className="text-rose-500 hidden first:hidden last:block" /> 
        </div>
    );
};

// --- [UI] 텍스트 렌더링 개선 (줄바꿈 + 강조) ---
const RichText = ({ text }) => {
  if (!text) return null;
  // 줄바꿈 처리를 위해 split
  const lines = text.split('\n');
  
  return (
    <div className="whitespace-pre-wrap">
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={lineIdx} className={`${line.trim().startsWith('-') || line.trim().startsWith('•') ? 'pl-2' : ''}`}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-stone-900 font-bold bg-rose-100/50 px-1 rounded">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </div>
        );
      })}
    </div>
  );
};

// --- 다국어 데이터 ---
const translations = {
  ko: {
    lang_label: "한국어", title: "스마트 여행비서", subtitle: "K-Travel Helper",
    tab_home: "홈", tab_stay: "숙소", tab_schedule: "일정", tab_chat: "AI챗",
    weather_title: "오늘의 날씨", weather_desc: "실시간 날씨 보기 🌤️",
    ai_briefing: "AI 브리핑", ai_briefing_desc: "오늘의 여행 뉴스",
    ai_briefing_query: "오늘 한국의 주요 여행 뉴스나 축제 소식 알려줘",
    hero_tag: "AI 추천 테마", hero_title: "감성 가득 한국 여행,\nAI가 준비했어요.", hero_desc: "지역과 테마만 말하면 1분 만에 코스 완성 ✨", hero_btn: "일정 만들기",
    tools_title: "Smart Tools", tool_food: "AI 맛집추천", tool_souvenir: "AI 기념품", tool_googlemap: "구글 지도", tool_packing: "짐싸기", 
    tool_ai_plan: "AI 일정", tool_ai_googlemap: "지도 보기", tool_ai_packing: "짐싸기", tool_ai_budget: "예산 계산",
    day_unit: "일차", schedule_items_count: "개의 일정",
    mag_title: "여행 매거진", mag_more: "전체보기", trend_title: "지금 뜨는 여행 검색어",
    search_placeholder: "예: 서울숲 카페, 부산 요트", map_btn: "네이버 지도로 검색",
    stay_title: "어떤 숙소를 원하세요?", stay_desc: "숲 뷰가 보이는 힐링 숙소를 찾아드릴게요",
    schedule_title: "내 여행 일정 📝", schedule_empty: "아직 일정이 없어요 😅\nAI에게 부탁해보세요!", schedule_ai_btn: "AI 일정 생성하기",
    chat_title: "무엇이든 물어보세요!", chat_desc: "날씨, 사투리, 맛집 추천 등", chat_placeholder: "궁금한 점을 입력하세요...",
    modal_ai_title: "AI 여행 플래너", modal_dept: "출발지", modal_dest: "여행지", modal_days: "기간 (일)", modal_theme: "여행 테마", modal_btn: "일정 생성하기 ✨",
    modal_dept_country_ph: "국가 (예: 대한민국)", modal_dept_city_ph: "도시 (예: 전주)", modal_dest_ph: "도시 (예: 서울)",
    theme_healing: "🌿 힐링/휴식", theme_food: "🍜 맛집/먹방", theme_shopping: "🛍️ 쇼핑", theme_culture: "🏯 역사/문화", theme_activity: "🏄 액티비티", theme_custom_ph: "직접 입력...",
    packing_title: "스마트 짐싸기", packing_desc: "여행지 날씨와 테마에 딱 맞는 준비물 리스트",
    food_title: "AI 미식 가이드", food_desc: "현지인만 아는 찐 맛집 메뉴 추천", food_placeholder: "원하는 메뉴 (비워두면 알아서 추천)",
    souvenir_title: "AI 기념품 큐레이터", souvenir_desc: "여행지에서 꼭 사야 할 쇼핑 리스트",
    budget_title: "여행 예산 계산기", budget_total: "예상 총 경비",
    loading_msgs: ["출발지에서 가는 경로를 검색 중... 🚄", "현지 핫플레이스 스캔 중... 📡", "최적의 동선을 계산하고 있어요... 🗺️", "맛집 리뷰 분석 중... 🍜"],
    reset_data: "데이터 초기화", alert_reset: "모든 여행 데이터가 삭제됩니다. 계속하시겠습니까?", toast_reset: "초기화되었습니다.",
    error_fallback: "AI 연결이 불안정하여 추천 정보를 대신 보여드립니다!",
    share_btn: "공유", share_toast: "복사되었습니다!",
    quick_qs: ["제주도 2박3일 코스 추천해줘", "부산 돼지국밥 맛집 알려줘", "경주 황리단길 핫플 어디야?", "강릉 1인 여행 예산 얼마야?"],
    cat_essential: "필수품", cat_clothing: "의류", cat_toiletries: "세면도구", cat_tech: "전자기기", cat_misc: "기타",
    magazine_items: [
      { title: '서울 숲 뷰 맛집\nBEST 5', sub: '도심 속 휴식', tag: '#서울맛집', query: '서울숲 맛집', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
      { title: '강원도 차박 성지\n별 보기 좋은 곳', sub: '낭만 캠핑', tag: '#차박', query: '강원도 차박', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80' },
      { title: '제주도 에메랄드빛\n해변 모음', sub: '인생샷 명소', tag: '#제주바다', query: '제주도 해변', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=600&q=80' },
    ],
    trending_keywords: ['제주도 투명 카약', '강릉 서핑 강습', '서울 한강 피크닉', '부산 해변 열차']
  },
  en: {
    lang_label: "English", title: "Smart Travel Assistant", subtitle: "K-Travel Helper",
    tab_home: "Home", tab_stay: "Stay", tab_schedule: "Plan", tab_chat: "AI Chat",
    weather_title: "Weather", weather_desc: "Check Live Weather 🌤️",
    ai_briefing: "AI Briefing", ai_briefing_desc: "Today's Travel News",
    ai_briefing_query: "Tell me about Han River Night Market festival",
    hero_tag: "AI Recommendation", hero_title: "Cozy Korea Trip,\nPlanned by AI.", hero_desc: "Complete course in 1 min with just location & theme ✨", hero_btn: "Create Plan",
    tools_title: "Smart Tools", tool_food: "AI Foodie", tool_souvenir: "AI Souvenir", tool_googlemap: "Google Maps", tool_packing: "Packing",
    tool_ai_plan: "AI Plan", tool_ai_googlemap: "Open Map", tool_ai_packing: "Packing", tool_ai_budget: "Budget Calc",
    day_unit: "Day", schedule_items_count: "Items",
    mag_title: "Travel Magazine", mag_more: "View All", trend_title: "Trending Keywords",
    search_placeholder: "Ex: Seoul Forest, Busan Yacht", map_btn: "Search on Map",
    stay_title: "Where to stay?", stay_desc: "Finding healing stays with forest views",
    schedule_title: "My Itinerary 📝", schedule_empty: "No plans yet 😅\nAsk AI to plan!", schedule_ai_btn: "Generate Plan",
    chat_title: "Ask me anything!", chat_desc: "Weather, Dialect, Food recommendations", chat_placeholder: "Type your question...",
    modal_ai_title: "AI Travel Planner", modal_dept: "Departure", modal_dest: "Destination", modal_days: "Duration (Days)", modal_theme: "Theme", modal_btn: "Generate Plan ✨",
    modal_dept_country_ph: "Country (e.g. USA)", modal_dept_city_ph: "City (e.g. NY)", modal_dest_ph: "City (e.g. Seoul)",
    theme_healing: "🌿 Healing", theme_food: "🍜 Foodie", theme_shopping: "🛍️ Shopping", theme_culture: "🏯 Culture", theme_activity: "🏄 Activity", theme_custom_ph: "Type your own...",
    packing_title: "Smart Packing", packing_desc: "Packing list based on weather & theme",
    food_title: "AI Foodie Guide", food_desc: "Local food recommendations based on your taste", food_placeholder: "Type food (Empty for auto)",
    souvenir_title: "AI Souvenir Curator", souvenir_desc: "Must-buy shopping list for this city",
    budget_title: "Travel Budget Calculator", budget_total: "Estimated Total",
    loading_msgs: ["Calculating route from origin... 🚄", "Scanning hotspots... 📡", "Planning best itinerary... 🗺️", "Analyzing reviews... 🍜"],
    reset_data: "Reset Data", alert_reset: "All data will be deleted. Continue?", toast_reset: "Data reset complete.",
    error_fallback: "Connection unstable. Showing recommendations instead!",
    share_btn: "Share", share_toast: "Copied!",
    quick_qs: ["Recommend 3-day Jeju trip", "Best Pork Soup in Busan?", "Hotspots in Gyeongju?", "Budget for Gangneung trip?"],
    cat_essential: "Essential", cat_clothing: "Clothing", cat_toiletries: "Toiletries", cat_tech: "Tech", cat_misc: "Misc",
    magazine_items: [
      { title: 'Seoul Forest View\nBest Restaurants', sub: 'Urban Break', tag: '#SeoulFood', query: 'Seoul Forest Restaurants', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
      { title: 'Gangwon-do Car Camping\nStar Gazing Spots', sub: 'Romantic Camping', query: 'Gangwon-do Camping', tag: '#Camping', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80' },
      { title: 'Jeju Emerald\nBeach Collection', sub: 'Best Photo Spots', tag: '#JejuBeach', query: 'Jeju Beach', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=600&q=80' },
    ],
    trending_keywords: ['Jeju Transparent Kayak', 'Gangneung Surfing', 'Han River Picnic', 'Busan Beach Train']
  },
  ja: {
    lang_label: "日本語", title: "スマート旅行秘書", subtitle: "K-Travel Helper",
    tab_home: "ホーム", tab_stay: "宿泊", tab_schedule: "日程", tab_chat: "AIチャット",
    weather_title: "今日の天気", weather_desc: "リアルタイム天気 🌤️",
    ai_briefing: "AIブリーフィング", ai_briefing_desc: "今日の旅行ニュース",
    ai_briefing_query: "今日の韓国の主要旅行ニュースやお祭りの情報を教えて",
    hero_tag: "AIおすすめテーマ", hero_title: "感性あふれる韓国旅行、\nAIが準備しました。", hero_desc: "地域とテーマを言うだけで1分でコース完成 ✨", hero_btn: "日程を作る",
    tools_title: "Smart Tools", tool_food: "AIグルメ", tool_souvenir: "AIお土産", tool_googlemap: "Googleマップ", tool_packing: "パッキング", 
    tool_ai_plan: "AI日程", tool_ai_googlemap: "地図を見る", tool_ai_packing: "パッキング", tool_ai_budget: "予算計算",
    day_unit: "日目", schedule_items_count: "個の予定",
    mag_title: "旅行マガジン", mag_more: "すべて見る", trend_title: "人気の旅行キーワード",
    search_placeholder: "例: ソウルの森カフェ、釜山ヨット", map_btn: "Naver地図で検索",
    stay_title: "どんな宿をお探しですか？", stay_desc: "森が見える癒しの宿をお探しします",
    schedule_title: "私の旅行日程 📝", schedule_empty: "まだ予定がありません 😅\nAIにお願いしてみましょう！", schedule_ai_btn: "AI日程作成",
    chat_title: "何でも聞いてください！", chat_desc: "天気、方言、グルメおすすめなど", chat_placeholder: "気になることを入力...",
    modal_ai_title: "AI旅行プランナー", modal_dept: "出発地", modal_dest: "目的地", modal_days: "期間 (日)", modal_theme: "テーマ", modal_btn: "日程を作成 ✨",
    modal_dept_country_ph: "国 (例: 日本)", modal_dept_city_ph: "都市 (例: 東京)", modal_dest_ph: "都市 (例: ソウル)",
    theme_healing: "🌿 癒し/休憩", theme_food: "🍜 グルメ", theme_shopping: "🛍️ ショッピング", theme_culture: "🏯 歴史/文化", theme_activity: "🏄 アクティビティ", theme_custom_ph: "直接入力...",
    packing_title: "スマートパッキング", packing_desc: "旅行先の天気とテーマにぴったりの持ち物リスト",
    food_title: "AIグルメガイド", food_desc: "地元の人だけが知る本当の美味しい店", food_placeholder: "食べたいメニュー (空欄で自動推薦)",
    souvenir_title: "AIお土産キュレーター", souvenir_desc: "旅行先で必ず買うべきショッピングリスト",
    budget_title: "旅行予算計算機", budget_total: "予想総経費",
    loading_msgs: ["出発地からのルートを検索中... 🚄", "現地のレビューを分析中... 🧐", "最適なルートを計算中... 🗺️", "グルメデータを読み込み中... 🍜"],
    reset_data: "データ初期化", alert_reset: "すべての旅行データが削除されます。続けますか？", toast_reset: "初期化されました。",
    error_fallback: "AI接続が不安定なため、おすすめ情報を代わりに表示します！",
    share_btn: "共有", share_toast: "コピーされました！",
    quick_qs: ["済州島2泊3日コースおすすめ", "釜山のデジクッパ美味しい店", "慶州ファンリダンギルのホットプレイス", "江陵1人旅の予算は？"],
    cat_essential: "必需品", cat_clothing: "衣類", cat_toiletries: "洗面用具", cat_tech: "電子機器", cat_misc: "その他",
    magazine_items: [
      { title: 'ソウルの森ビュー\n美味しい店 BEST 5', sub: '都心の中の休息', tag: '#ソウルグルメ', query: 'ソウルの森 グルメ', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
      { title: '江原道 車中泊の聖地\n星を見るのに良い場所', sub: 'ロマンチックキャンプ', tag: '#車中泊', query: '江原道 車中泊', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80' },
      { title: '済州島 エメラルド色\n海コレクション', sub: '人生ショット名所', tag: '#済州の海', query: '済州島 海', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=600&q=80' },
    ],
    trending_keywords: ['済州島 透明カヤック', '江陵 サーフィン講習', 'ソウル 漢江ピクニック', '釜山 海辺列車']
  },
};

export default function App() {
  // State (LocalStorage)
  const [language, setLanguage] = useLocalStorage('ktravel_lang', 'ko');
  const [schedule, setSchedule] = useLocalStorage('ktravel_schedule', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ktravel_chat', [{ role: 'ai', text: '안녕하세요! 👋\n저는 여러분의 여행을 도와드릴 **Travel Mate**입니다.\n여행 계획, 맛집 추천, 날씨 등 무엇이든 물어보세요! ✨' }]);
  const [packingList, setPackingList] = useLocalStorage('ktravel_packing', {});
  const [checkedItems, setCheckedItems] = useLocalStorage('ktravel_packing_checked', []);
  const [userApiKey, setUserApiKey] = useLocalStorage('ktravel_api_key', ''); 
  
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState({ 
      deptCountry: 'South Korea', 
      deptCity: '', 
      destCity: 'Seoul', 
      duration: '2', 
      theme: 'Healing' 
  });
  
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [isPackingLoading, setIsPackingLoading] = useState(false);
  const [showPackingModal, setShowPackingModal] = useState(false);

  const [budgetResult, setBudgetResult] = useState(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodPreference, setFoodPreference] = useState('');
  const [foodList, setFoodList] = useState([]);
  const [isFoodLoading, setIsFoodLoading] = useState(false);

  const [showSouvenirModal, setShowSouvenirModal] = useState(false);
  const [souvenirList, setSouvenirList] = useState([]);
  const [isSouvenirLoading, setIsSouvenirLoading] = useState(false);
  
  const [showMagazineModal, setShowMagazineModal] = useState(false); 

  const t = (key) => (translations[language] || translations['ko'])[key] || translations['ko'][key];
  const currentMagazineItems = translations[language]?.magazine_items || translations['ko'].magazine_items;
  const currentTrending = translations[language]?.trending_keywords || translations['ko'].trending_keywords;
  const quickQuestions = translations[language]?.quick_qs || translations['ko'].quick_qs;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeTab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatLoading]);
  useEffect(() => { if(toastMsg) { const timer = setTimeout(() => setToastMsg(''), 3000); return () => clearTimeout(timer); } }, [toastMsg]);

  // Loading Animation
  useEffect(() => {
      let interval;
      const isLoading = isGenerating || isPackingLoading || isFoodLoading || isSouvenirLoading || isBudgetLoading;
      if (isLoading) {
          const msgs = translations[language]?.loading_msgs || translations['ko'].loading_msgs;
          setLoadingMsg(msgs[Math.floor(Math.random() * msgs.length)]);
          interval = setInterval(() => { setLoadingMsg(msgs[Math.floor(Math.random() * msgs.length)]); }, 2000);
      }
      return () => clearInterval(interval);
  }, [isGenerating, isPackingLoading, isFoodLoading, isSouvenirLoading, isBudgetLoading, language]);

  // JSON Parser
  const cleanAndParseJSON = (text) => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(text);
    } catch (e) { 
      console.error("JSON Parse Error", e);
      return null; 
    }
  };

  const getLanguageName = (code) => {
      if(code === 'en') return 'English';
      if(code === 'ja') return 'Japanese';
      return 'Korean';
  };

  // --- AI Fetcher ---
  const safeFetchAI = async (prompt, fallbackData, setter, finalizer, isChat = false) => {
      const keyToUse = apiKey || userApiKey; 
      if (!keyToUse) {
          setToastMsg("API 키가 없습니다!");
          if (isChat) setter(t('no_api_key'));
          else setter(fallbackData);
          if (finalizer) finalizer();
          return;
      }

      try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${keyToUse}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!resultText) throw new Error("Empty AI Response");

          if (isChat) {
              setter(resultText);
          } else {
              const result = cleanAndParseJSON(resultText);
              if (result) setter(result);
              else throw new Error("JSON Parse Failed");
          }
      } catch (error) {
          console.warn("AI Error:", error);
          if (isChat) setter(typeof fallbackData === 'string' ? fallbackData : "죄송해요, 연결이 불안정하네요 😅");
          else {
              alert(t('error_fallback'));
              setter(fallbackData);
          }
      } finally {
          if (finalizer) finalizer();
      }
  };

  // --- Features ---
  const generateAIItinerary = () => {
    if (!aiPrompt.destCity || !aiPrompt.duration) return;
    setIsGenerating(true);
    const langName = getLanguageName(language);
    const deptInfo = aiPrompt.deptCity ? `Departing from ${aiPrompt.deptCity}, ${aiPrompt.deptCountry}.` : `Start from ${aiPrompt.destCity}.`;
    
    // [수정됨] 언어 설정 강제
    const prompt = `
      Act as a professional travel planner.
      ${deptInfo}
      Destination: ${aiPrompt.destCity}, Duration: ${aiPrompt.duration} days, Theme: ${aiPrompt.theme}.
      Task: Plan a detailed itinerary. IF departing from a different city/country, INCLUDE transportation to destination in Day 1.
      Language: MUST be ${langName}. Write ALL content (activity names, descriptions) in ${langName}.
      Output: JSON Array ONLY. No Markdown.
      Format: [{"day": "1", "time": "10:00", "activity": "Activity Name in ${langName}", "type": "food|transport|spot"}]
    `;
    const fallback = [
        { id: 101, day: '1', time: '10:00', activity: `${aiPrompt.destCity} 도착 (Arrival)`, type: 'transport' },
        { id: 102, day: '1', time: '12:30', activity: '현지 맛집 (Local Food)', type: 'food' },
        { id: 103, day: '1', time: '15:00', activity: '시내 관광 (City Tour)', type: 'spot' },
    ];
    safeFetchAI(prompt, fallback, (data) => {
        const newSchedule = data.map((item, index) => ({ ...item, id: Date.now() + index }));
        setSchedule(newSchedule);
        setIsAIModalOpen(false);
        setActiveTab('schedule');
        setToastMsg(t('toast_reset')); 
    }, () => setIsGenerating(false));
  };

  const generatePackingList = () => {
    setIsPackingLoading(true);
    const langName = getLanguageName(language);
    // [수정됨] 카테고리 키를 소문자로 통일하여 요청
    const prompt = `Create a packing list for a trip to ${aiPrompt.destCity}. Language: ${langName}. Write ALL items in ${langName}. Output JSON only with lowercase keys: {"essential": ["item1"], "clothing": ["item1"], "toiletries": ["item1"], "tech": ["item1"]}`;
    const fallback = { essential: ["Passport", "Wallet"], clothing: ["Comfy Clothes"], toiletries: ["Toothbrush"], tech: ["Charger"] };
    safeFetchAI(prompt, fallback, setPackingList, () => setIsPackingLoading(false));
  };

  const togglePackingItem = (item) => {
      if (checkedItems.includes(item)) {
          setCheckedItems(checkedItems.filter(i => i !== item));
      } else {
          setCheckedItems([...checkedItems, item]);
      }
  };

  const calculateBudget = () => {
    if(schedule.length === 0) return;
    setIsBudgetLoading(true); setShowBudgetModal(true);
    const langName = getLanguageName(language);
    const duration = aiPrompt.duration || schedule[schedule.length-1]?.day || 3;
    const prompt = `Estimate budget for a ${duration}-day trip to ${aiPrompt.destCity} with ${schedule.length} scheduled activities. Currency: KRW. Language: ${langName}. Output JSON only: {"total": "Approx Total (e.g. 350,000)", "comment": "Breakdown summary in ${langName}"}`;
    const fallback = { total: "350,000", comment: "Average budget calculated." };
    safeFetchAI(prompt, fallback, setBudgetResult, () => setIsBudgetLoading(false));
  };

  const generateFoodRecommendations = () => {
      setIsFoodLoading(true); setFoodList([]);
      const langName = getLanguageName(language);
      const userPref = foodPreference.trim() || "Famous Local Food";
      const prompt = `Recommend 3 local dishes in ${aiPrompt.destCity} based on '${userPref}'. Language: ${langName}. Output JSON Array only: [{"name":"", "desc":"", "tag":""}]`;
      const fallback = [{ name: "Local Food", desc: "Recommended dish", tag: "#Local" }];
      safeFetchAI(prompt, fallback, setFoodList, () => setIsFoodLoading(false));
  };

  const generateSouvenirList = () => {
      setIsSouvenirLoading(true); setSouvenirList([]);
      const langName = getLanguageName(language);
      const prompt = `Recommend 4 souvenirs in ${aiPrompt.destCity}. Language: ${langName}. Output JSON Array only: [{"name":"", "price":"", "desc":""}]`;
      const fallback = [{ name: "Souvenir", price: "10,000~", desc: "Popular item" }];
      safeFetchAI(prompt, fallback, setSouvenirList, () => setIsSouvenirLoading(false));
  };

  const handleSendMessage = async (message = null) => {
      const msg = message || chatInput;
      if(!msg.trim()) return;
      
      setChatHistory(prev => [...prev, {role:'user', text:msg}]);
      setChatInput(''); 
      setIsChatLoading(true);
      
      if(activeTab !== 'chat') setActiveTab('chat');

      try {
          const langName = getLanguageName(language);
          const currentContext = [...chatHistory, {role:'user', text:msg}];
          const contextData = currentContext.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
          
          const prompt = `
            You are 'Travel Mate', a professional AI travel assistant.
            Current User Language: ${langName}.
            
            Instruction:
            1. Answer in **${langName}** ONLY.
            2. Use a **Structured Format** (Bullet points, Bold headers).
            3. Be professional yet friendly. Use emojis ✈️🌿✨ appropriately.
            
            Context:
            ${contextData}
            
            User: ${msg}
            Assistant (in ${langName}, structured):
          `;
          
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          const aiRes = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI Error. Please try again.";
          
          setChatHistory(prev => [...prev, {role:'ai', text: aiRes}]);
      } catch(e) { 
          setChatHistory(prev => [...prev, {role:'ai', text: t('error_fallback')}]); 
      } finally { setIsChatLoading(false); }
  };

  const handleBriefingClick = () => {
      const query = translations[language]?.ai_briefing_query || translations['ko'].ai_briefing_query;
      handleSendMessage(query);
  };

  const shareSchedule = () => {
      if (schedule.length === 0) return;
      const text = `[✈️ K-Travel Helper] ${aiPrompt.destCity} Trip Plan\n\n` + schedule.map(item => `• ${item.day}Day ${item.time} - ${item.activity}`).join('\n');
      navigator.clipboard.writeText(text).then(() => setToastMsg(t('share_toast'))).catch(() => alert("Copy Failed"));
  };

  const handleOpenNaverWeather = () => {
      const query = aiPrompt.destCity || "Seoul";
      window.open(`https://search.naver.com/search.naver?query=${query}+Weather`, '_blank');
  };

  const handleOpenGoogleMap = () => {
      const query = aiPrompt.destCity || "South Korea";
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const handleSearchMap = (keyword) => {
    if (!keyword && !searchQuery) return;
    window.open(`https://map.naver.com/p/search/${keyword || searchQuery}`, '_blank');
  };
  
  const handleStaySearch = (platform) => {
      let url = "";
      const query = aiPrompt.destCity || "Korea";
      switch(platform) {
          case 'naver': url = `https://hotels.naver.com/`; break; 
          case 'airbnb': url = `https://www.airbnb.co.kr/s/${query}/homes`; break;
          case 'agoda': url = `https://www.agoda.com/ko-kr/search?text=${query}`; break;
          case 'yanolja': url = `https://www.yanolja.com/search/${query}`; break; 
          default: url = `https://map.naver.com/p/search/${query} Hotel`; break;
      }
      window.open(url, '_blank');
  };

  const changeLanguage = (langCode) => {
      setLanguage(langCode);
      // [수정됨] 언어 변경 시 기존 AI 데이터 초기화 (새 언어로 다시 생성 유도)
      setSchedule([]);
      setPackingList({});
      setFoodList([]);
      setSouvenirList([]);
      setBudgetResult(null);
      
      // 채팅 인사말도 언어에 맞게 변경
      const greetings = {
          ko: '안녕하세요! 👋\n저는 여러분의 여행을 도와드릴 **Travel Mate**입니다.\n여행 계획, 맛집 추천, 날씨 등 무엇이든 물어보세요! ✨',
          en: 'Hello! 👋\nI am **Travel Mate**, your AI travel assistant.\nAsk me anything about itineraries, food, or weather! ✨',
          ja: 'こんにちは！👋\n私はあなたの旅行をサポートする **Travel Mate** です。\n旅行の計画、グルメ、天気など、何でも聞いてください！✨'
      };
      setChatHistory([{ role: 'ai', text: greetings[langCode] || greetings.ko }]);
      
      setIsSettingsOpen(false);
      setTimeout(() => setToastMsg("Language Changed & Data Reset!"), 100);
  };

  const getThemeChips = () => [
      { id: 'healing', label: t('theme_healing'), val: 'Healing/Rest' },
      { id: 'food', label: t('theme_food'), val: 'Foodie/Gourmet' },
      { id: 'shopping', label: t('theme_shopping'), val: 'Shopping' },
      { id: 'culture', label: t('theme_culture'), val: 'History/Culture' },
      { id: 'activity', label: t('theme_activity'), val: 'Activity/Sports' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-rose-200 pb-24">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-[60] animate-fadeIn flex items-center gap-2">
            <CheckSquare size={14} className="text-green-400" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <AppLogo />
            <div>
              <h1 className="text-lg font-bold text-stone-800 tracking-tight leading-none">{t('title')}</h1>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5 font-serif tracking-wide">{t('subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
             <span onClick={() => setIsSettingsOpen(true)} className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 cursor-pointer hover:bg-stone-200 transition">{translations[language]?.lang_label || "Language"}</span>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition relative">
                 <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-4 space-y-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="animate-fadeIn space-y-6 pb-6">
            {/* Weather & Briefing Widget */}
            <div className="flex gap-3">
                <div onClick={handleOpenNaverWeather} className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer hover:shadow-md transition">
                    <div className="flex justify-between items-start"><span className="text-xs font-bold text-stone-500">{t('weather_title')}</span><CloudSun size={20} className="text-orange-300" /></div>
                    <div><p className="text-sm font-bold text-stone-800 mt-1 leading-tight">{t('weather_desc')}</p></div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-rose-200 to-orange-100 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer group" onClick={handleBriefingClick}>
                     <div className="relative z-10"><div className="flex items-center gap-1 mb-1"><span className="text-xs font-bold opacity-90 text-rose-800">{t('ai_briefing')}</span><Sparkles size={14} className="text-rose-600 animate-pulse" /></div><p className="text-xs font-bold leading-snug text-stone-800 line-clamp-3">{t('ai_briefing_desc')}</p></div>
                     <div className="absolute right-3 bottom-3 bg-white/60 p-1.5 rounded-full backdrop-blur-sm"><ArrowRight size={14} className="text-rose-600 group-hover:translate-x-0.5 transition-transform" /></div>
                </div>
            </div>

            {/* Hero Card */}
            <div className="relative w-full h-72 rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer border border-stone-100" onClick={() => {setIsAIModalOpen(true); setActiveTab('schedule');}}>
               <div className="absolute inset-0 bg-stone-200">
                   <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
               </div>
               <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full mb-3 border border-white/10">
                    <span className="text-[10px] font-bold flex items-center gap-1"><Sparkles size={10} /> {t('hero_tag')}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight mb-2 text-shadow-sm whitespace-pre-line">{t('hero_title')}</h2>
                  <p className="text-xs text-white/90 font-medium mb-4">{t('hero_desc')}</p>
                  <button className="bg-white text-stone-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-100 transition shadow-lg">{t('hero_btn')} <ArrowRight size={14} /></button>
               </div>
            </div>

            {/* Tools */}
            <div>
                <h3 className="font-bold text-stone-800 text-lg mb-3 px-1">{t('tools_title')}</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: t('tool_food'), icon: UtensilsCrossed, color: 'bg-[#FFCCBC] text-stone-700', action: () => setShowFoodModal(true) },
                        { label: t('tool_souvenir'), icon: Gift, color: 'bg-[#CFD8DC] text-stone-700', action: () => { setShowSouvenirModal(true); if(souvenirList.length === 0) generateSouvenirList(); } },
                        { label: t('tool_googlemap'), icon: Map, color: 'bg-[#A5D6A7] text-stone-700', action: handleOpenGoogleMap },
                        { label: t('tool_packing'), icon: ClipboardList, color: 'bg-[#B3E5FC] text-stone-700', action: () => {setShowPackingModal(true); if(Object.keys(packingList).length === 0) generatePackingList(); } },
                    ].map((item, idx) => (
                        <button key={idx} onClick={item.action} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${item.color} text-white group-active:scale-95 transition transform duration-200`}><item.icon size={24} strokeWidth={1.5} /></div>
                            <span className="text-xs font-semibold text-stone-600 group-hover:text-stone-800">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Magazine Section */}
            <section>
                <div className="flex justify-between items-end mb-3 px-1">
                    <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Newspaper size={18} className="text-rose-400"/>{t('mag_title')}</h3>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                    {currentMagazineItems.map((card, idx) => (
                        <div key={idx} onClick={() => handleSearchMap(card.query || card.tag)} className={`flex-none w-40 h-52 rounded-2xl relative overflow-hidden shadow-sm snap-center cursor-pointer hover:shadow-md transition group border border-stone-100`}>
                             <div className="absolute inset-0 bg-stone-200">
                                <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/160x220?text=No+Image";}} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                             </div>
                             <div className="absolute bottom-0 p-4 w-full z-10 text-left">
                                <span className="text-[10px] font-bold text-stone-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md mb-2 inline-block shadow-sm">{card.tag}</span>
                                <h4 className="text-white font-bold text-sm leading-snug mb-1 whitespace-pre-line drop-shadow-md">{card.title}</h4>
                                <p className="text-white/80 text-[10px] font-medium">{card.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-rose-400" />{t('trend_title')}</h3>
                <div className="space-y-3">
                    {currentTrending.map((keyword, idx) => (
                        <div key={idx} onClick={() => handleSearchMap(keyword)} className="flex items-center justify-between cursor-pointer group py-1">
                            <div className="flex items-center gap-3"><span className={`font-bold w-5 text-center ${idx < 3 ? 'text-rose-500' : 'text-stone-300'}`}>{idx + 1}</span><span className="text-sm text-stone-600 group-hover:text-stone-900 font-medium transition group-hover:translate-x-1 duration-200">{keyword}</span></div>
                            <Search size={14} className="text-stone-300 group-hover:text-stone-500" />
                        </div>
                    ))}
                </div>
            </section>
          </div>
        )}
        
        {/* Stay Tab */}
        {activeTab === 'stay' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-gradient-to-r from-rose-400 to-orange-300 p-6 rounded-3xl text-white shadow-lg shadow-orange-100/50">
                <h2 className="text-xl font-bold mb-1 text-stone-800">{t('stay_title')}</h2>
                <p className="text-stone-700 text-sm mb-6">{t('stay_desc')}</p>
                <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl flex mb-4 border border-white/30 shadow-inner">
                   <input type="text" placeholder={t('search_placeholder')} className="bg-transparent w-full p-3 text-white placeholder-white/80 outline-none font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleStaySearch('naver')} />
                   <button onClick={() => handleStaySearch('naver')} className="bg-white text-rose-500 px-4 rounded-xl font-bold hover:bg-rose-50 transition shadow-sm"><Search size={20} /></button>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                {[{ name: 'Naver Hotel', icon: Building, color: 'bg-green-50 text-green-600', type: 'naver' }, { name: 'Airbnb', icon: Heart, color: 'bg-rose-50 text-rose-600', type: 'airbnb' }, { name: 'Agoda', icon: Globe, color: 'bg-blue-50 text-blue-600', type: 'agoda' }, { name: 'Yanolja', icon: BedDouble, color: 'bg-purple-50 text-purple-600', type: 'yanolja' }].map((item, idx) => (
                  <button key={idx} onClick={() => handleStaySearch(item.type)} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition active:scale-95 flex flex-col items-center gap-3 group">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}><item.icon size={24} /></div>
                     <div className="flex items-center gap-1"><span className="font-bold text-stone-700 text-sm">{item.name}</span><ExternalLink size={10} className="text-stone-400" /></div>
                  </button>
                ))}
             </div>
             <div className="bg-stone-100 p-4 rounded-2xl text-center text-xs text-stone-500">Tip: 각 플랫폼에서 <span className="font-bold text-stone-700">{aiPrompt.destCity || "여행지"}</span>를 검색해보세요!</div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setIsAIModalOpen(true)} className="flex-none bg-rose-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-100 hover:bg-rose-500 transition flex items-center gap-1"><Sparkles size={14} /> {t('tool_ai_plan')}</button>
                <button onClick={calculateBudget} className="flex-none bg-white text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-50 transition flex items-center gap-1"><Calculator size={14} /> {t('tool_ai_budget')}</button>
                <button onClick={() => { setShowPackingModal(true); if(Object.keys(packingList).length===0) generatePackingList(); }} className="flex-none bg-white text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-50 transition flex items-center gap-1"><ClipboardList size={14} /> {t('tool_ai_packing')}</button>
            </div>
            <div className="flex justify-between items-center px-1"><h2 className="text-xl font-bold text-stone-800">{t('schedule_title')}</h2><span className="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-lg font-bold border border-rose-100">{schedule.length} {t('schedule_items_count')}</span></div>
            <div className="relative border-l-2 border-stone-200 ml-4 space-y-6 pb-10 mt-2">
              {schedule.length === 0 ? (<div className="text-center py-12 text-stone-400 bg-white rounded-2xl border border-stone-200 ml-4 shadow-sm"><p className="text-sm">{t('schedule_empty')}</p><button onClick={() => setIsAIModalOpen(true)} className="text-rose-500 text-xs font-bold hover:underline bg-rose-50 px-4 py-2 rounded-full">{t('schedule_ai_btn')}</button></div>) : (
                  schedule.map((item) => (<div key={item.id} className="relative pl-6"><div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.type === 'food' ? 'bg-orange-400' : item.type === 'transport' ? 'bg-blue-400' : 'bg-rose-400'}`}></div><div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center"><div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">{item.day}{t('day_unit')}</span><span className="text-xs text-stone-400 font-mono">{item.time}</span></div><h4 className="font-bold text-stone-800 text-sm">{item.activity}</h4></div><button onClick={() => setSchedule(schedule.filter(i => i.id !== item.id))} className="text-stone-300 hover:text-red-400 p-2"><Trash2 size={16} /></button></div></div>))
              )}
            </div>
          </div>
        )}

        {/* Chat Tab (Updated UI) */}
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-180px)] flex flex-col animate-fadeIn bg-stone-50 rounded-t-3xl">
             {/* Chat Header (Optional, keeping simple) */}
             
             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide">
                {chatHistory.map((msg, idx) => (
                   <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role !== 'user' && (
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-1 shadow-sm flex-shrink-0">
                              <Bot size={16} />
                          </div>
                      )}
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-stone-800 text-white rounded-br-none' 
                          : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none'
                      }`}>
                        <RichText text={msg.text} />
                      </div>
                      {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 mb-1 shadow-sm flex-shrink-0">
                              <User size={16} />
                          </div>
                      )}
                   </div>
                ))}
                {isChatLoading && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 animate-pulse">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-stone-100 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs text-stone-400 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-stone-100 rounded-b-3xl">
                 {/* Quick Chips */}
                 <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                    {quickQuestions.map((q, i) => (
                        <button key={i} onClick={() => handleSendMessage(q)} className="whitespace-nowrap bg-stone-50 text-stone-600 text-xs px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border border-stone-200 transition-colors">
                            {q}
                        </button>
                    ))}
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        placeholder={t('chat_placeholder')} 
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-rose-100 outline-none shadow-inner text-stone-700 transition-all"
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                    />
                    <button 
                        onClick={() => handleSendMessage()} 
                        disabled={isChatLoading || !chatInput.trim()} 
                        className="bg-rose-500 text-white p-3.5 rounded-2xl hover:bg-rose-600 active:scale-95 transition-all disabled:bg-stone-200 disabled:cursor-not-allowed shadow-md shadow-rose-100"
                    >
                        <Send size={18} />
                    </button>
                 </div>
             </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 text-center">
              <h2 className="text-xl font-bold text-stone-800 mb-2">Where to go?</h2>
              <div className="relative mb-4"><input type="text" placeholder={t('search_placeholder')} className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-rose-200 transition text-stone-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchMap()} /><Search className="absolute left-3 top-3.5 text-stone-400" size={18} /></div>
              <button onClick={() => handleSearchMap()} className="w-full bg-[#03C75A] text-white font-bold py-3 rounded-xl hover:bg-[#02b351] transition shadow-md shadow-green-100 active:scale-95 flex items-center justify-center gap-2"><MapPin size={18} /> {t('map_btn')}</button>
            </div>
          </div>
        )}
      </main>

      {/* Modals (AI, Food, Souvenir, Settings, Packing, Budget) */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsAIModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
            <h3 className="text-xl font-bold text-stone-800 mb-2 flex items-center gap-2"><Sparkles className="text-rose-400" /> {t('modal_ai_title')}</h3>
            
            <div className="space-y-4 mt-6">
              {/* Departure Section */}
              <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1 flex items-center gap-1"><Plane size={12} className="rotate-45"/> {t('modal_dept')}</label>
                  <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder={t('modal_dept_country_ph')} value={aiPrompt.deptCountry} onChange={(e) => setAiPrompt({...aiPrompt, deptCountry: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 min-w-0" />
                      <input type="text" placeholder={t('modal_dept_city_ph')} value={aiPrompt.deptCity} onChange={(e) => setAiPrompt({...aiPrompt, deptCity: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 min-w-0" />
                  </div>
              </div>

              {/* Destination Section */}
              <div className="grid grid-cols-[1fr_80px] gap-2">
                  <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1 flex items-center gap-1"><MapPin size={12}/> {t('modal_dest')}</label>
                      <input type="text" placeholder={t('modal_dest_ph')} value={aiPrompt.destCity} onChange={(e) => setAiPrompt({...aiPrompt, destCity: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 min-w-0" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1 flex items-center gap-1"><Calendar size={12}/> {t('modal_days')}</label>
                      <select value={aiPrompt.duration} onChange={(e) => setAiPrompt({...aiPrompt, duration: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 min-w-0">
                          {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} Day{d>1?'s':''}</option>)}
                      </select>
                  </div>
              </div>

              {/* Theme Section */}
              <div>
                  <label className="text-xs font-bold text-stone-500 block mb-2 flex items-center gap-1"><Heart size={12}/> {t('modal_theme')}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {getThemeChips().map((chip) => (
                          <button key={chip.id} onClick={() => setAiPrompt({...aiPrompt, theme: chip.val})} className={`text-xs px-3 py-1.5 rounded-full border transition ${aiPrompt.theme === chip.val ? 'bg-rose-400 text-white border-rose-400 font-bold' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'}`}>
                              {chip.label}
                          </button>
                      ))}
                  </div>
                  <input type="text" placeholder={t('theme_custom_ph')} value={aiPrompt.theme} onChange={(e) => setAiPrompt({...aiPrompt, theme: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-100 placeholder:text-stone-400 min-w-0" />
              </div>
            </div>

            <button onClick={generateAIItinerary} disabled={isGenerating} className="w-full mt-8 bg-rose-400 text-white py-3.5 rounded-xl font-bold hover:bg-rose-500 transition flex justify-center items-center gap-2 shadow-md">
                {isGenerating ? <><Loader2 className="animate-spin" size={18} /><span className="text-sm ml-2">{loadingMsg}</span></> : t('modal_btn')}
            </button>
          </div>
        </div>
      )}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
                <button onClick={() => setShowFoodModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-2 flex items-center gap-2"><UtensilsCrossed className="text-orange-400" /> {t('food_title')}</h3>
                <p className="text-xs text-stone-500 mb-4">{t('food_desc')}</p>
                <div className="flex gap-2 mb-6">
                    <input type="text" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)} placeholder={t('food_placeholder')} className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-100" onKeyPress={(e) => e.key === 'Enter' && generateFoodRecommendations()} />
                    <button onClick={generateFoodRecommendations} className="bg-orange-400 text-white p-3 rounded-xl hover:bg-orange-500 transition shadow-md"><Search size={20} /></button>
                </div>
                {isFoodLoading ? <div className="py-10 flex flex-col items-center text-stone-400"><Loader2 size={32} className="animate-spin text-orange-400 mb-2" /><p className="text-xs">{loadingMsg}</p></div> : (
                    <div className="space-y-3">{foodList.map((item, idx) => (<div key={idx} onClick={() => handleSearchMap(`${aiPrompt.destCity} ${item.name}`)} className="bg-orange-50 p-3 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition"><div className="flex justify-between items-start"><h4 className="font-bold text-stone-800 text-sm"><RichText text={item.name} /></h4><span className="text-[10px] text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-200">Pick</span></div><p className="text-xs text-stone-600 mt-1 mb-2">{item.desc}</p></div>))}</div>
                )}
            </div>
        </div>
      )}
      {showSouvenirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
                <button onClick={() => setShowSouvenirModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-2 flex items-center gap-2"><ShoppingBag className="text-teal-500" /> {t('souvenir_title')}</h3>
                <p className="text-xs text-stone-500 mb-4">{t('souvenir_desc')}</p>
                <div className="bg-teal-50 p-3 rounded-xl mb-4 text-sm text-teal-700 font-medium flex justify-between items-center border border-teal-100"><span>📍 {aiPrompt.destCity}</span><span className="text-xs bg-white px-2 py-1 rounded-lg cursor-pointer hover:bg-teal-100" onClick={generateSouvenirList}><RefreshCw size={12} className="inline mr-1"/>Refresh</span></div>
                {isSouvenirLoading ? <div className="py-10 flex flex-col items-center text-stone-400"><Loader2 size={32} className="animate-spin text-teal-500 mb-2" /><p className="text-xs">{loadingMsg}</p></div> : (
                    <div className="space-y-3">{souvenirList.map((item, idx) => (<div key={idx} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex gap-3 items-center"><div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0"><Gift size={20} /></div><div className="flex-1"><h4 className="font-bold text-stone-800 text-sm"><RichText text={item.name} /></h4><p className="text-xs text-stone-500 mt-0.5"><RichText text={item.desc} /></p><span className="text-[10px] text-teal-600 font-bold mt-1 inline-block">{item.price}</span></div></div>))}</div>
                )}
            </div>
        </div>
      )}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
                <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2"><Globe className="text-rose-400" /> Language</h3>
                <div className="space-y-2 mb-6">
                    {[{ code: 'ko', label: '한국어 🇰🇷' }, { code: 'en', label: 'English 🇺🇸' }, { code: 'ja', label: '日本語 🇯🇵' }].map((lang) => (<button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full p-4 rounded-xl text-left font-medium transition flex justify-between items-center ${language === lang.code ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white hover:bg-stone-50 text-stone-600 border border-transparent'}`}>{lang.label}{language === lang.code && <CheckSquare size={16} />}</button>))}
                </div>
            </div>
        </div>
      )}
      {showPackingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-sm sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
                <button onClick={() => setShowPackingModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2"><ClipboardList className="text-cyan-500" /> {t('packing_title')}</h3>
                <div className="mb-4 bg-cyan-50 p-3 rounded-xl text-sm text-cyan-700 border border-cyan-100"><span className="font-bold">{aiPrompt.destCity}</span> {t('packing_desc')}</div>
                {isPackingLoading ? <div className="py-10 flex flex-col items-center text-stone-400"><Loader2 size={32} className="animate-spin text-cyan-500 mb-2" /><p className="text-xs">{loadingMsg}</p></div> : (
                    <div className="space-y-4">
                        {Object.keys(packingList).length > 0 ? (
                            Object.entries(packingList).map(([category, items], idx) => {
                                // [수정됨] 카테고리 다국어 처리
                                const catKey = `cat_${category.toLowerCase()}`;
                                const catName = translations[language]?.[catKey] || category.toUpperCase();
                                return (
                                    <div key={idx}>
                                        <h4 className="font-bold text-xs text-stone-400 uppercase mb-2 tracking-wider">{catName}</h4>
                                        <div className="space-y-2">
                                            {Array.isArray(items) && items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition cursor-pointer group" onClick={() => togglePackingItem(item)}>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-white transition ${checkedItems.includes(item) ? 'bg-cyan-500 border-cyan-500' : 'border-stone-200 bg-white'}`}>
                                                        <Check size={12} className={checkedItems.includes(item) ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                    <span className={`text-sm text-stone-700 ${checkedItems.includes(item) ? 'line-through text-stone-400' : ''}`}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (<div className="text-center py-8 text-stone-400"><p>No list.</p><button onClick={generatePackingList} className="mt-2 text-cyan-500 font-bold text-sm underline">Create Now</button></div>)}
                    </div>
                )}
            </div>
        </div>
      )}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
              <button onClick={() => setShowBudgetModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={24} /></button>
              <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2"><Calculator className="text-emerald-500" /> {t('budget_title')}</h3>
              {isBudgetLoading ? <div className="py-10 flex flex-col items-center text-stone-400"><Loader2 size={32} className="animate-spin text-emerald-500 mb-2" /><p className="text-xs">{loadingMsg}</p></div> : budgetResult ? (<div className="space-y-4"><div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100"><p className="text-xs text-emerald-600 mb-1">{t('budget_total')}</p><p className="text-2xl font-bold text-emerald-700">{budgetResult.total?.toLocaleString()}원</p></div><div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-500">💡 {budgetResult.comment}</div></div>) : (<div className="text-center text-stone-400">Failed</div>)}
           </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-stone-200/50 border border-stone-100 p-1.5 flex justify-between items-center z-40">
        {[
            { id: 'home', icon: Compass, label: t('tab_home') },
            { id: 'stay', icon: BedDouble, label: t('tab_stay') },
            { id: 'schedule', icon: Calendar, label: t('tab_schedule') },
            { id: 'chat', icon: MessageCircle, label: t('tab_chat') },
        ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-rose-500 bg-rose-50 font-bold' : 'text-stone-400 hover:text-stone-600'}`}><tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} /><span className="text-[10px] mt-0.5">{tab.label}</span></button>
        ))}
      </nav>
    </div>
  );
}