"use strict";

window.DEFAULTS = {
  PH_SVG: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23c8cacd'/></svg>`),
  cfg: {
    layout: 1, theme: "light", fontSize: 13, chatFontSize: 13,
    delayMin: 2, delayMax: 5, typingText: "", ignoreOn: false, quoteOn: true,
    sentenceJoin: true, activeSend: false, activeMin: 5, activeMax: 20, nextActiveAt: 0,
    popupOn: true, notifOn: false, soundOn: true, showAvatar: true, showName: true,
    showTime: true, showRead: true, showSelfRead: false, showSelfName: false, readText: "",
    customFont: "", customFontUrl: "", customFontRaw: "", customBubble: "", customChatCss: "",
    groupMode: false, chatStyle: 1, inputPlaceholder: "",
    welcomeText: "", timeShowSeconds: false,
    oppTime: "", oppTimeDate: "", oppTimeSetAt: 0, oppCustomTime: true,
    musicUrl: "", activeSoundId: "__builtin_thud1__",
    customHomeCss: "", customHomeJs: "", hideAesBg: false, hidePolarBg: false,
    minimaxKey: "", minimaxVoice: "male-qn-qingse", autoTTS: false, ttsUrl: "https://api.minimax.chat/v1/t2a_v2",
    ttsKey: "", ttsModel: "speech-01-turbo", ttsVoice: "male-qn-qingse", ttsSpeed: 1.0, ttsVol: 1.0, ttsPersist: false,
    sepPool: ["，","。","！","…","？","～"],
    stickerOn: false, showStickerBtn: true, showVoiceBtn: true, voiceMode: "audio", customBg: ""
  },
  imgs: {
    selfAvatar: "", oppAvatar: "",
    timeline: [], mosaic: [], gallery: [],
    l1_p1: "", l1_p2: "",
    polar1: "", polar2: "", polar3: "", polar4: "",
    l2_cover: "", l2_duo: "",
    h4_avatar: "", music_cover: "",
    p1_img: "", p2_img: "", p3_img: "", p4_img: "", aes_main: "", aes_body_bg: ""
  },
  texts: {
    l1_name:"", l1_loc:"", l1_stat1_n:"", l1_stat1_l:"", l1_stat2_n:"", l1_stat2_l:"",
    l1_song:"", l1_artist:"", anni_label:"",
    aes_name:"", aes_sub:"", aes_r_lbl:"", aes_tag:"", aes_title:"", aes_f1:"", aes_f2:"",
    opp_name:"", opp_bio:"", l2_name:"", l2_bio:"", l2_s1:"", l2_lbl1:"", l2_s2:"",
    l2_lbl2:"", l2_s3:"", l2_lbl3:"", l2_search:"", l2_bub1:"", l2_bub2:"",
    l2_p1_name:"", l2_p1_time:"", l2_p1_body:"", l2_p1_like:"", l2_p1_cmt:"",
    l2_p1_cmt2_name:"", l2_p1_cmt2_body:"", l2_p1_cmt2_role:"",
    style2_tag:"", style2_sub:"", style3_b1:"", style3_b2:"",
    style3_sub:"", style4_t1:"", style4_t2:"", style4_stamp:"", style4_title:"", style4_sub:"", aes_tags: ""
  },
  cards: [],
  groupMembers: [{id:"g1",name:"",avatar:""},{id:"g2",name:"",avatar:""}],
  anniversaries: [{id:"a1",title:"未定义",date:new Date().toISOString().slice(0,10),mode:"since"}],
  surveys: [{
    id: "builtin_tolerance",
    title: "对象和他人的关系你能忍到几级",
    builtin: true,
    questions: [
      "第1级：见面打招呼","第2级：有联系方式","第3级：偶尔的关心","第4级：经常约着打游戏",
      "第5级：记得对方生日，并且互送礼物","第6级：把ta挂在嘴边，动不动就提起","第7级：单独约吃饭看电影",
      "第8级：打个电话就会去赴约","第9级：频繁聊天发消息","第10级：喝醉了给ta打电话",
      "第11级：一起合租","第12级：单独一起旅行","第13级：一起开一间房",
      "第14级：在你的面前和ta有直接的亲密举动","第15级：孩子全都不是你的"
    ].map(t=>({ text:t, options:["接受","中立","拒绝"], needComment:true }))
  }],
  surveyRecords: []
};

window.UPDATE_LOG_VERSION = 2;
window.UPDATE_LOG = [
  {
    v: 2,
    items: [
      "新增我方发送语音功能",
      "支持原语音录制与实时转文字切换",
      "新增我方语音按钮与表情包按钮开关",
      "语音气泡支持交互播放与声波动画"
    ]
  },
  {
    v: 1,
    items: [
      "全新状态栏系统上线",
      "对方昵称支持在设置内直接点击文字改名",
      "表情包面板解决卡顿与挤压",
      "主题设定的圆圈现可直接点击更改背景色",
      "字卡库、表情包库支持批量全选",
      "CSS系统全面优化",
      "自定义样式面板精简文案与视觉样式"
    ]
  }
];

window.AUTHOR_LINKS = [
  { n:"初版", d:"一直很感谢最初帮助我的珍珠老师，想她", u:"https://zikacxbymilk.netlify.app/" },
  { n:"传讯", d:"大家很熟悉啦……就不介绍了", u:"https://aielin17.github.io/milk/" },
  { n:"画廊", d:"存放朋友们投稿的各种css", u:"https://aielin17.github.io/-/" },
  { n:"游戏厅", d:"几个自制的小游戏合集", u:"https://aielin01.github.io/game" },
  { n:"塔罗", d:"一个可以抽牌占卜的小工具", u:"https://aielin17.github.io/Tarot/" }
];

window.TEXT_GROUPS = [
  { h:"开屏", keys:[{k:"welcomeText",l:"副文"}], isCfg:true },
  { h:"通用", keys:[{k:"inputPlaceholder",l:"输入占位"},{k:"typingText",l:"输入提示"},{k:"readText",l:"已读文案"}], isCfg:true },
  { h:"布局一", keys:[
    {k:"l1_name",l:"昵称"},{k:"l1_loc",l:"签名"},
    {k:"l1_stat1_n",l:"统计①数"},{k:"l1_stat1_l",l:"统计①标"},
    {k:"l1_stat2_n",l:"统计②数"},{k:"l1_stat2_l",l:"统计②标"},
    {k:"l1_song",l:"歌曲"},{k:"l1_artist",l:"歌词"},
    {k:"anni_label",l:"纪念词"}
  ]},
  { h:"布局一 · 美学卡片", keys:[
    {k:"aes_name",l:"昵称"},{k:"aes_sub",l:"副文"},{k:"aes_r_lbl",l:"右标签"},
    {k:"aes_tag",l:"小标签"},{k:"aes_title",l:"标题"},{k:"aes_tags",l:"文案"},
    {k:"aes_f1",l:"底部一"},{k:"aes_f2",l:"底部二"}
  ]},  
  { h:"布局二", keys:[
    {k:"l2_name",l:"昵称"},{k:"l2_bio",l:"签名"},
    {k:"l2_s1",l:"数据一"},{k:"l2_lbl1",l:"标签一"},
    {k:"l2_s2",l:"数据二"},{k:"l2_lbl2",l:"标签二"},
    {k:"l2_s3",l:"数据三"},{k:"l2_lbl3",l:"标签三"},
    {k:"l2_search",l:"搜索文案"},{k:"l2_bub1",l:"气泡一"},{k:"l2_bub2",l:"气泡二"},
    {k:"l2_p1_name",l:"博文署名"},{k:"l2_p1_time",l:"博文时间"},
    {k:"l2_p1_body",l:"博文正文"},{k:"l2_p1_like",l:"点赞数"},
    {k:"l2_p1_cmt",l:"评论数"},{k:"l2_p1_cmt2_name",l:"评论者"},{k:"l2_p1_cmt2_body",l:"评论内容"},{k:"l2_p1_cmt2_role",l:"评论角色"}
  ]},
  { h:"聊天 · 经典", keys:[{k:"opp_name",l:"对方名"},{k:"opp_bio",l:"状态"}] },
  { h:"聊天 · 胶囊", keys:[{k:"style2_tag",l:"顶部标签"},{k:"style2_sub",l:"副文"}] },
  { h:"聊天 · 双向", keys:[{k:"style3_b1",l:"左侧气泡"},{k:"style3_b2",l:"右侧气泡"},{k:"style3_sub",l:"分割文案"}] },
  { h:"聊天 · 日记", keys:[{k:"style4_t1",l:"标签A"},{k:"style4_t2",l:"标签B"},{k:"style4_stamp",l:"时间戳"},{k:"style4_title",l:"标题"},{k:"style4_sub",l:"副标题"}] }
];

window.BUILTIN_SOUNDS = [
  { id: "__builtin_thud1__", name: "清脆·叮", builtin: true },
  { id: "__builtin_thud2__", name: "轻快·嘀", builtin: true }
];

window.DOCK_HTML = `
<button class="dock-btn" data-app="chatApp" onclick="openApp('chatApp')">
  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
<button class="dock-btn" data-app="cardsApp" onclick="openApp('cardsApp')">
  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>
<button class="dock-btn" data-app="statsApp" onclick="openApp('statsApp')">
  <svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></button>
<button class="dock-btn" data-app="settingsApp" onclick="openApp('settingsApp')">
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>`;
