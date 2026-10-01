/* 芒果泰泰 course data
 * Item fields
 *   t    Thai text shown       say  text spoken by TTS (defaults to t)
 *   rom  romanization          zh   Chinese meaning / label
 *   cls  consonant class m/h/l snd  sound (letters, vowels)
 *   tone 平聲/低聲/降聲/高聲/升聲  why  explanation shown after answering
 *   fin  final sound group     live true = 活音節, false = 死音節
 */

/* ---------------- consonants ---------------- */
const C = (t, cls, w, rom, zh, snd, old) => ({
  type: "cons", t, cls, w, rom, zh, snd, old: !!old,
  say: t === "อ" ? "ออ อ่าง" : t + "อ " + w
});
const CONS = {
  "ก": C("ก","m","ไก่","gɔɔ gài","雞","g / k"),
  "จ": C("จ","m","จาน","jɔɔ jaan","盤子","j"),
  "ด": C("ด","m","เด็ก","dɔɔ dèk","小孩","d"),
  "ต": C("ต","m","เต่า","dtɔɔ dtào","烏龜","dt"),
  "บ": C("บ","m","ใบไม้","bɔɔ bai-máai","葉子","b"),
  "ป": C("ป","m","ปลา","bpɔɔ bplaa","魚","bp"),
  "อ": C("อ","m","อ่าง","ɔɔ àang","盆子","不發音"),
  "ฎ": C("ฎ","m","ชฎา","dɔɔ chá-daa","泰式頭冠","d"),
  "ฏ": C("ฏ","m","ปฏัก","dtɔɔ bpà-dtàk","趕牛棒","dt"),

  "ข": C("ข","h","ไข่","khɔ̌ɔ khài","蛋","kh"),
  "ฉ": C("ฉ","h","ฉิ่ง","chɔ̌ɔ chìng","小鈸","ch"),
  "ถ": C("ถ","h","ถุง","thɔ̌ɔ thǔng","袋子","th"),
  "ผ": C("ผ","h","ผึ้ง","phɔ̌ɔ phʉ̂ng","蜜蜂","ph"),
  "ฝ": C("ฝ","h","ฝา","fɔ̌ɔ fǎa","蓋子","f"),
  "ส": C("ส","h","เสือ","sɔ̌ɔ sʉ̌a","老虎","s"),
  "ห": C("ห","h","หีบ","hɔ̌ɔ hìip","箱子","h"),
  "ฐ": C("ฐ","h","ฐาน","thɔ̌ɔ thǎan","台座","th"),
  "ศ": C("ศ","h","ศาลา","sɔ̌ɔ sǎa-laa","涼亭","s"),
  "ษ": C("ษ","h","ฤๅษี","sɔ̌ɔ rʉʉ-sǐi","隱士","s"),
  "ฃ": C("ฃ","h","ขวด","khɔ̌ɔ khùat","瓶子","kh",1),

  "ค": C("ค","l","ควาย","khɔɔ khwaai","水牛","kh"),
  "ช": C("ช","l","ช้าง","chɔɔ cháang","大象","ch"),
  "ซ": C("ซ","l","โซ่","sɔɔ sôo","鐵鍊","s"),
  "ท": C("ท","l","ทหาร","thɔɔ thá-hǎan","士兵","th"),
  "พ": C("พ","l","พาน","phɔɔ phaan","高腳盤","ph"),
  "ฟ": C("ฟ","l","ฟัน","fɔɔ fan","牙齒","f"),
  "ฮ": C("ฮ","l","นกฮูก","hɔɔ nók-hûuk","貓頭鷹","h"),
  "ง": C("ง","l","งู","ngɔɔ nguu","蛇","ng"),
  "น": C("น","l","หนู","nɔɔ nǔu","老鼠","n"),
  "ม": C("ม","l","ม้า","mɔɔ máa","馬","m"),
  "ย": C("ย","l","ยักษ์","yɔɔ yák","巨人","y"),
  "ร": C("ร","l","เรือ","rɔɔ rʉa","船","r"),
  "ล": C("ล","l","ลิง","lɔɔ ling","猴子","l"),
  "ว": C("ว","l","แหวน","wɔɔ wɛ̌ɛn","戒指","w"),
  "ญ": C("ญ","l","หญิง","yɔɔ yǐng","女人","y"),
  "ฆ": C("ฆ","l","ระฆัง","khɔɔ rá-khang","鐘","kh"),
  "ธ": C("ธ","l","ธง","thɔɔ thong","旗子","th"),
  "ภ": C("ภ","l","สำเภา","phɔɔ sǎm-phao","帆船","ph"),
  "ณ": C("ณ","l","เณร","nɔɔ neen","小沙彌","n"),
  "ฌ": C("ฌ","l","เฌอ","chɔɔ chəə","樹","ch"),
  "ฑ": C("ฑ","l","มณโฑ","thɔɔ mon-thoo","曼陀女神","th"),
  "ฒ": C("ฒ","l","ผู้เฒ่า","thɔɔ phûu-thâo","老人","th"),
  "ฬ": C("ฬ","l","จุฬา","lɔɔ jù-laa","星形風箏","l"),
  "ฅ": C("ฅ","l","คน","khɔɔ khon","人","kh",1)
};
const ALL_CONS = Object.values(CONS);
const cs = s => [...s].map(ch => CONS[ch]);

/* ---------------- vowels ---------------- */
const V = (t, snd, len, ex, exRom, exZh, note) => ({
  type: "vowel", t, snd, zh: len, ex, exRom, exZh, note, say: ex, rom: snd
});
const VOWELS = {
  long1: [
    V("◌า","aa","長音","มา","maa","來","寫在子音右邊。"),
    V("◌ี","ii","長音","ดี","dii","好","寫在子音上方。"),
    V("◌ู","uu","長音","ดู","duu","看","寫在子音下方。"),
    V("◌ือ","ʉʉ","長音","มือ","mʉʉ","手","嘴型像發「一」，但嘴唇不動、舌頭往後。後面有尾音時寫成 ◌ื。")
  ],
  short1: [
    V("◌ะ","a","短音","จะ","jà","將要","短促收住。後面接尾音時改寫成 ◌ั，例如 วัน（wan 天）。"),
    V("◌ั","a","短音","วัน","wan","天、日","短音 a 後面有尾音時的寫法。"),
    V("◌ิ","i","短音","กิน","gin","吃","寫在子音上方，比 ◌ี 少一撇。"),
    V("◌ุ","u","短音","ดุ","dù","兇","寫在子音下方，比 ◌ู 少一勾。"),
    V("◌ึ","ʉ","短音","ถึง","thʉ̌ng","到達","◌ือ 的短音。")
  ],
  long2: [
    V("เ◌","ee","長音","เท","thee","倒（水）","寫在子音前面，但在子音之後才念。"),
    V("แ◌","ɛɛ","長音","แม่","mɛ̂ɛ","媽媽","嘴巴比 ee 張得更開，像注音ㄝ。"),
    V("โ◌","oo","長音","โต","dtoo","長大","寫在子音前面，嘴唇圓。"),
    V("◌อ","ɔɔ","長音","พอ","phɔɔ","足夠","嘴巴張大的「喔」。這裡 อ 當母音用。")
  ],
  short2: [
    V("เ◌ะ","e","短音","เตะ","dtè","踢","เ◌ 的短音。"),
    V("แ◌ะ","ɛ","短音","และ","lɛ́","和、及","แ◌ 的短音。"),
    V("โ◌ะ","o","短音","โต๊ะ","dtó","桌子","โ◌ 的短音。"),
    V("เ◌าะ","ɔ","短音","เกาะ","gɔ̀","島","◌อ 的短音。")
  ],
  combo: [
    V("เ◌อ","əə","長音","เธอ","thəə","妳、她","像注音ㄜ。"),
    V("เ◌ีย","ia","長音","เรียน","rian","學習","i 滑到 a。"),
    V("เ◌ือ","ʉa","長音","เรือ","rʉa","船","ʉ 滑到 a。"),
    V("◌ัว","ua","長音","วัว","wua","牛","u 滑到 a。")
  ],
  special: [
    V("◌ำ","am","短音","ทำ","tham","做","一個符號就包含 a + m。"),
    V("ไ◌","ai","短音","ไป","bpai","去","最常見的 ai 寫法。"),
    V("ใ◌","ai","短音","ใจ","jai","心","和 ไ◌ 同音，只用在約 20 個字，例如 ใจ、ใหม่、ใคร。"),
    V("เ◌า","ao","短音","เขา","khǎo","他、她","像中文「凹」。")
  ]
};
const ALL_VOWELS = Object.values(VOWELS).flat();

/* ---------------- words / phrases / numbers ---------------- */
const W = (t, rom, zh, extra) => ({ type: "word", t, rom, zh, ...extra });
const P = (t, rom, zh) => ({ type: "phrase", t, rom, zh });

/* tone-rule items */
const TN = (t, rom, zh, tone, why) => ({ type: "tone", t, rom, zh, tone, why });
/* final-sound items */
const FN = (t, rom, zh, fin, why) => ({ type: "final", t, rom, zh, fin, why });
/* live/dead items */
const LD = (t, rom, zh, live, why) => ({ type: "live", t, rom, zh, live, why });

const NUM = (d, t, rom, zh) => ({ type: "num", t: d + " " + t, say: t, rom, zh });

const TONES = ["平聲", "低聲", "降聲", "高聲", "升聲"];
const FINALS = ["-k", "-t", "-p", "-n", "-m", "-ng", "-y", "-w"];
const CLS_NAME = { m: "中子音", h: "高子音", l: "低子音" };

/* ---------------- intro / rule cards ---------------- */
const R = (label, big, rom, zh, note, say, line) => ({ type: "teach", label, big, rom, zh, note, say, line });

/* ---------------- course ---------------- */
const COURSE = [
  {
    id: "u1", title: "第 1 單元　中子音", desc: "9 個中子音，聲調規則的起點",
    lessons: [
      { id: "u1l1", name: "中子音 1", icon: "ก", pool: cs("กจดต"), kinds: ["sound", "listen", "name"], match: "snd",
        intro: [R("認識子音", "ก ไก่", "gɔɔ gài", "雞的 ก", "泰文有 44 個子音，分成中、高、低三類。每個子音都有一個代表字，念法是「子音 + อ + 代表字」。", "กอ ไก่")] },
      { id: "u1l2", name: "中子音 2", icon: "ป", pool: cs("บปอฎฏ"), kinds: ["sound", "listen", "name"], match: "snd",
        intro: [R("口訣", "ไก่ จิก เด็ก ตาย บน ปาก โอ่ง", "gài jìk dèk dtaai bon bpàak òong", "雞啄死小孩在甕口上", "這句話每個字的第一個子音，剛好就是 9 個中子音（ฎ ฏ 和 ด ต 同音）。", "ไก่ จิก เด็ก ตาย บน ปาก โอ่ง")] },
      { id: "u1rv", name: "中子音複習", icon: "★", review: true, pool: cs("กจดตบปอฎฏ"), kinds: ["sound", "listen", "name"], match: "zh" }
    ]
  },
  {
    id: "u2", title: "第 2 單元　高子音", desc: "11 個高子音，口訣「鬼託我拿一袋米」",
    lessons: [
      { id: "u2l1", name: "高子音 1", icon: "ข", pool: cs("ขฉถผ"), kinds: ["sound", "listen", "name", "cls"], match: "snd",
        intro: [R("高子音", "ผี ฝาก ถุง ข้าว สาร ให้ ฉัน", "phǐi fàak thǔng khâao sǎan hâi chǎn", "鬼託我拿一袋米", "口訣裡每個字的第一個子音就是常用的 7 個高子音。高子音在沒有聲調符號的活音節念升聲，例如 ขา（khǎa）。", "ผี ฝาก ถุง ข้าว สาร ให้ ฉัน")] },
      { id: "u2l2", name: "高子音 2", icon: "ส", pool: cs("ฝสห"), kinds: ["sound", "listen", "name", "cls"], match: "snd" },
      { id: "u2l3", name: "少用的高子音", icon: "ศ", pool: cs("ฐศษฃ"), kinds: ["sound", "listen", "name", "cls"], match: "zh",
        intro: [R("少用的字母", "ศ ษ ส", "s", "三個都念 s", "ศ 和 ษ 多出現在梵文、巴利文借詞，例如 ศาลา（涼亭）。ฃ 已經停用，認得就好。")] },
      { id: "u2rv", name: "高子音複習", icon: "★", review: true, pool: cs("ขฉถผฝสหฐศษ"), kinds: ["sound", "listen", "name", "cls"], match: "zh" }
    ]
  },
  {
    id: "u3", title: "第 3 單元　低子音", desc: "24 個低子音，分成「成對」和「單獨」兩組",
    lessons: [
      { id: "u3l1", name: "成對低子音 1", icon: "ค", pool: cs("คชซท"), kinds: ["sound", "listen", "name", "cls"], match: "snd",
        intro: [R("成對低子音", "ข / ค", "kh", "同音，不同類", "很多低子音和高子音同音：ข/ค、ฉ/ช、ส/ซ、ถ/ท、ผ/พ、ฝ/ฟ、ห/ฮ。它們發音一樣，只是聲調規則不同。", "ขอ ไข่ คอ ควาย")] },
      { id: "u3l2", name: "成對低子音 2", icon: "พ", pool: cs("พฟฮ"), kinds: ["sound", "listen", "name", "cls"], match: "snd" },
      { id: "u3l3", name: "單獨低子音 1", icon: "ม", pool: cs("งนมย"), kinds: ["sound", "listen", "name", "cls"], match: "snd",
        intro: [R("單獨低子音", "ง น ม ย ร ล ว", "ng n m y r l w", "沒有高子音夥伴", "這些低子音沒有同音的高子音。要念出高子音的聲調時，前面會加一個不發音的 ห，第 7 單元會學。", "งอ งู")] },
      { id: "u3l4", name: "單獨低子音 2", icon: "ร", pool: cs("รลวญ"), kinds: ["sound", "listen", "name", "cls"], match: "snd",
        intro: [R("小提醒", "ร", "r", "彈舌音", "泰國人日常說話常把 ร 念成 l，兩種都聽得懂，但正式場合要彈舌。")] },
      { id: "u3l5", name: "少用的低子音", icon: "ฆ", pool: cs("ฆธภณฌฑฒฬฅ"), kinds: ["sound", "listen", "name", "cls"], match: "zh",
        intro: [R("少用的字母", "ธ ภ ณ", "th ph n", "多見於借詞", "這些字母多出現在梵文、巴利文借詞，例如 ภาษา（語言）。先認得字形就好，ฅ 已經停用。")] },
      { id: "u3rv", name: "三類子音大考驗", icon: "★", review: true, pool: ALL_CONS.filter(c => !c.old), kinds: ["cls", "sound", "listen"], match: "snd" }
    ]
  },
  {
    id: "u4", title: "第 4 單元　母音", desc: "長短母音、複合母音與特殊母音",
    lessons: [
      { id: "u4l1", name: "長母音 1", icon: "า", pool: VOWELS.long1, kinds: ["vsound", "vlisten", "vword"], match: "snd",
        intro: [R("母音的位置", "◌", "", "代表子音的位置", "泰文母音可以寫在子音的右邊、上面、下面、前面，甚至包住子音，但一定是先念子音再念母音。"),
                R("拼字規則", "ม + า", "maa", "來", "子音 + 母音 = 一個音節。沒有聲調符號時，聲調由子音類別決定，第 6 單元會詳細學。", "มา", "= มา")] },
      { id: "u4l2", name: "短母音 1", icon: "ะ", pool: VOWELS.short1, kinds: ["vsound", "vlisten", "vword"], match: "snd",
        intro: [R("長短音", "◌า / ◌ะ", "aa / a", "長音 / 短音", "泰文母音分長短，長短不同意思就不同。短音要念得短促、乾脆。", "มา")] },
      { id: "u4l3", name: "長母音 2", icon: "เ", pool: VOWELS.long2, kinds: ["vsound", "vlisten", "vword"], match: "snd",
        intro: [R("寫在前面的母音", "เ◌", "ee", "寫在前、念在後", "เ แ โ ไ ใ 都寫在子音前面，但讀的時候要先念子音。例如 เท 念 thee。", "เท")] },
      { id: "u4l4", name: "短母音 2", icon: "แ", pool: VOWELS.short2, kinds: ["vsound", "vlisten", "vword"], match: "snd" },
      { id: "u4l5", name: "複合母音", icon: "ัว", pool: VOWELS.combo, kinds: ["vsound", "vlisten", "vword"], match: "snd" },
      { id: "u4l6", name: "特殊母音", icon: "ไ", pool: VOWELS.special, kinds: ["vsound", "vlisten", "vword"], match: "snd" },
      { id: "u4rv", name: "母音複習", icon: "★", review: true, pool: ALL_VOWELS, kinds: ["vsound", "vlisten", "vword"], match: "snd" }
    ]
  },
  {
    id: "u5", title: "第 5 單元　尾音", desc: "8 種尾音，決定音節是活是死",
    lessons: [
      { id: "u5l1", name: "活尾音", icon: "ง", kinds: ["fin", "mean", "listen"], match: "zh",
        intro: [R("尾音只有 8 種", "-n -m -ng -y -w", "-k -t -p", "活尾音 / 死尾音", "子音放在字尾時，很多字母會變成同一個音。泰文尾音只有 8 種：-n -m -ng -y -w 是活尾音，-k -t -p 是死尾音（不送氣、不爆開）。"),
                R("-n 尾音", "น ญ ณ ร ล ฬ", "-n", "都念 -n", "ร 和 ล 放在字尾也念 -n，例如 อาหาร（aa-hǎan 食物）。", "อาหาร")],
        pool: [
          FN("บ้าน","bâan","家","-n","น 在字尾念 -n。"),
          FN("อาหาร","aa-hǎan","食物","-n","ร 在字尾也念 -n。"),
          FN("สาม","sǎam","三","-m","ม 在字尾念 -m。"),
          FN("ทาง","thaang","路","-ng","ง 在字尾念 -ng。"),
          FN("ยาย","yaai","外婆","-y","ย 在字尾念 -y（i）。"),
          FN("ขาว","khǎao","白色","-w","ว 在字尾念 -w（o）。")
        ] },
      { id: "u5l2", name: "死尾音", icon: "ก", kinds: ["fin", "mean", "listen"], match: "zh",
        intro: [R("-k -t -p", "ก / ด / บ", "-k / -t / -p", "嘴巴做好動作但不爆開", "像台語的入聲字「六 lak」「八 pat」「十 tsap」，聲音在嘴裡收住。", "นก"),
                R("-t 尾音最多", "ด ต จ ช ซ ส ศ ษ ท ธ ถ", "-t", "都念 -t", "很多子音放在字尾都念 -t，例如 รถ（rót 車）、ผัด（phàt 炒）。", "รถ")],
        pool: [
          FN("นก","nók","鳥","-k","ก 在字尾念 -k。"),
          FN("มาก","mâak","很、多","-k","ก 在字尾念 -k。"),
          FN("มด","mót","螞蟻","-t","ด 在字尾念 -t。"),
          FN("รถ","rót","車","-t","ถ 在字尾也念 -t。"),
          FN("ผัด","phàt","炒","-t","ด 在字尾念 -t。"),
          FN("ชอบ","chɔ̂ɔp","喜歡","-p","บ 在字尾念 -p。"),
          FN("ภาพ","phâap","圖片","-p","พ 在字尾也念 -p。")
        ] },
      { id: "u5rv", name: "尾音複習", icon: "★", review: true, kinds: ["fin", "mean", "listen"], match: "zh", poolFrom: ["u5l1", "u5l2"] }
    ]
  },
  {
    id: "u6", title: "第 6 單元　聲調規則", desc: "子音類別 × 活死音節 × 聲調符號",
    lessons: [
      { id: "u6l1", name: "活音節與死音節", icon: "活", kinds: ["live", "mean", "listen"], match: "zh",
        intro: [R("活音節", "มา  กิน  ขาว", "長母音結尾，或 -n -m -ng -y -w 結尾", "可以拉長的音", "活音節的聲音可以一直延長。", "มา"),
                R("死音節", "จะ  นก  รถ", "短母音結尾，或 -k -t -p 結尾", "收得很短的音", "死音節的聲音會突然收住。分出活死，才能判斷聲調。", "นก")],
        pool: [
          LD("กา","gaa","烏鴉",true,"長母音 aa 結尾，是活音節。"),
          LD("กิน","gin","吃",true,"-n 尾音，是活音節。"),
          LD("ขาว","khǎao","白色",true,"-w 尾音，是活音節。"),
          LD("สาม","sǎam","三",true,"-m 尾音，是活音節。"),
          LD("จะ","jà","將要",false,"短母音結尾，是死音節。"),
          LD("นก","nók","鳥",false,"-k 尾音，是死音節。"),
          LD("รถ","rót","車",false,"-t 尾音，是死音節。"),
          LD("ชอบ","chɔ̂ɔp","喜歡",false,"-p 尾音，是死音節。"),
          LD("เตะ","dtè","踢",false,"短母音結尾，是死音節。")
        ] },
      { id: "u6l2", name: "沒有符號的聲調", icon: "ขา", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("活音節＋無符號", "กา  ขา  คา", "中→平　高→升　低→平", "看子音類別", "活音節沒有聲調符號時：中子音念平聲、高子音念升聲、低子音念平聲。", "ขา"),
                R("死音節＋無符號", "กบ  ผัด  รัก  มาก", "中、高→低聲　低→高聲或降聲", "看子音和母音長短", "死音節：中、高子音念低聲；低子音配短母音念高聲，配長母音念降聲。", "รัก")],
        pool: [
          TN("กา","gaa","烏鴉","平聲","中子音＋活音節，無符號 → 平聲。"),
          TN("ขา","khǎa","腿","升聲","高子音＋活音節，無符號 → 升聲。"),
          TN("คา","khaa","卡住","平聲","低子音＋活音節，無符號 → 平聲。"),
          TN("สาม","sǎam","三","升聲","高子音＋活音節，無符號 → 升聲。"),
          TN("กบ","gòp","青蛙","低聲","中子音＋死音節 → 低聲。"),
          TN("ผัด","phàt","炒","低聲","高子音＋死音節 → 低聲。"),
          TN("รัก","rák","愛","高聲","低子音＋死音節＋短母音 → 高聲。"),
          TN("มาก","mâak","很、多","降聲","低子音＋死音節＋長母音 → 降聲。")
        ] },
      { id: "u6l3", name: "符號＋中子音", icon: "ป่า", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("四個聲調符號", "่  ้  ๊  ๋", "ไม้เอก ไม้โท ไม้ตรี ไม้จัตวา", "寫在子音右上方", "中子音最直覺：่ 低聲、้ 降聲、๊ 高聲、๋ 升聲。只有中子音能用全部 4 個符號。", "ป่า")],
        pool: [
          TN("ปา","bpaa","丟","平聲","中子音，無符號 → 平聲。"),
          TN("ป่า","bpàa","森林","低聲","中子音＋ ่ → 低聲。"),
          TN("ป้า","bpâa","阿姨","降聲","中子音＋ ้ → 降聲。"),
          TN("ป๊า","bpáa","爸爸（口語）","高聲","中子音＋ ๊ → 高聲。"),
          TN("ป๋า","bpǎa","乾爹（口語）","升聲","中子音＋ ๋ → 升聲。"),
          TN("ได้","dâai","可以","降聲","中子音＋ ้ → 降聲。"),
          TN("ไก่","gài","雞","低聲","中子音＋ ่ → 低聲。")
        ] },
      { id: "u6l4", name: "符號＋高子音", icon: "ข้า", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("高子音加符號", "ข่า  ข้า", "่ 低聲　้ 降聲", "和中子音一樣", "高子音只用 ่ 和 ้，念法和中子音相同。", "ข้า")],
        pool: [
          TN("ข่า","khàa","南薑","低聲","高子音＋ ่ → 低聲。"),
          TN("ข้า","khâa","我（古語）","降聲","高子音＋ ้ → 降聲。"),
          TN("ส่ง","sòng","寄送","低聲","高子音＋ ่ → 低聲。"),
          TN("ห้า","hâa","五","降聲","高子音＋ ้ → 降聲。"),
          TN("ถ้า","thâa","如果","降聲","高子音＋ ้ → 降聲。"),
          TN("ผ่าน","phàan","經過","低聲","高子音＋ ่ → 低聲。")
        ] },
      { id: "u6l5", name: "符號＋低子音", icon: "ค่า", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("低子音往上提一格", "ค่า  ค้า", "่ 降聲　้ 高聲", "最容易搞混的地方", "低子音加 ่ 念降聲，加 ้ 念高聲。所以 ข้า 和 ค่า 符號不同，卻都念降聲。", "ค่า")],
        pool: [
          TN("ค่า","khâa","價值","降聲","低子音＋ ่ → 降聲。"),
          TN("ค้า","kháa","貿易","高聲","低子音＋ ้ → 高聲。"),
          TN("แม่","mɛ̂ɛ","媽媽","降聲","低子音＋ ่ → 降聲。"),
          TN("พ่อ","phɔ̂ɔ","爸爸","降聲","低子音＋ ่ → 降聲。"),
          TN("น้ำ","náam","水","高聲","低子音＋ ้ → 高聲。"),
          TN("ร้อน","rɔ́ɔn","熱","高聲","低子音＋ ้ → 高聲。")
        ] },
      { id: "u6rv", name: "聲調大考驗", icon: "★", review: true, kinds: ["tone", "listen"], match: "zh", poolFrom: ["u6l2", "u6l3", "u6l4", "u6l5"] }
    ]
  },
  {
    id: "u7", title: "第 7 單元　特殊規則", desc: "前導 ห 和前導 อ",
    lessons: [
      { id: "u7l1", name: "前導 ห", icon: "หมา", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("ห นำ", "มา / หมา", "maa / mǎa", "來 / 狗", "單獨低子音（ง ญ น ม ย ร ล ว）前面加不發音的 ห，就改用高子音的聲調規則。", "หมา")],
        pool: [
          TN("หมา","mǎa","狗","升聲","ห 帶 ม，用高子音規則，活音節 → 升聲。"),
          TN("หนู","nǔu","老鼠","升聲","ห 帶 น，用高子音規則 → 升聲。"),
          TN("หวาน","wǎan","甜","升聲","ห 帶 ว，用高子音規則 → 升聲。"),
          TN("หลาย","lǎai","很多","升聲","ห 帶 ล，用高子音規則 → 升聲。"),
          TN("ใหม่","mài","新的","低聲","ห 帶 ม，高子音＋ ่ → 低聲。"),
          TN("หนึ่ง","nʉ̀ng","一","低聲","ห 帶 น，高子音＋ ่ → 低聲。")
        ] },
      { id: "u7l2", name: "前導 อ", icon: "อยู่", kinds: ["tone", "mean", "listen"], match: "zh",
        intro: [R("อ นำ", "อย่า อยู่ อย่าง อยาก", "yàa yùu yàang yàak", "只有這 4 個字", "ย 前面加不發音的 อ，改用中子音規則。全泰文只有這 4 個字，背起來就好。", "อย่า อยู่ อย่าง อยาก")],
        pool: [
          TN("อยู่","yùu","在","低聲","อ 帶 ย，中子音＋ ่ → 低聲。"),
          TN("อยาก","yàak","想要","低聲","อ 帶 ย，中子音＋死音節 → 低聲。"),
          TN("อย่า","yàa","不要","低聲","อ 帶 ย，中子音＋ ่ → 低聲。"),
          TN("อย่าง","yàang","樣子、種類","低聲","อ 帶 ย，中子音＋ ่ → 低聲。")
        ] }
    ]
  },
  {
    id: "u8", title: "第 8 單元　數字", desc: "泰文數字與價錢",
    lessons: [
      { id: "u8l1", name: "0 到 5", icon: "๓", kinds: ["mean", "listen", "toThai"], match: "zh",
        intro: [R("泰文數字", "๐ ๑ ๒ ๓", "", "0 1 2 3", "泰國日常多用阿拉伯數字，但招牌、價目表、證件常看到泰文數字。สาม 三、สี่ 四和台語很像！", "ศูนย์ หนึ่ง สอง สาม")],
        pool: [NUM("๐","ศูนย์","sǔun","0"), NUM("๑","หนึ่ง","nʉ̀ng","1"), NUM("๒","สอง","sɔ̌ɔng","2"), NUM("๓","สาม","sǎam","3"), NUM("๔","สี่","sìi","4"), NUM("๕","ห้า","hâa","5")] },
      { id: "u8l2", name: "6 到 10", icon: "๘", kinds: ["mean", "listen", "toThai"], match: "zh",
        pool: [NUM("๖","หก","hòk","6"), NUM("๗","เจ็ด","jèt","7"), NUM("๘","แปด","bpɛ̀ɛt","8"), NUM("๙","เก้า","gâo","9"), NUM("๑๐","สิบ","sìp","10")] },
      { id: "u8l3", name: "大數字與價錢", icon: "฿", kinds: ["mean", "listen", "toThai"], match: "zh",
        intro: [R("兩個例外", "สิบเอ็ด  ยี่สิบ", "sìp-èt  yîi-sìp", "11　20", "個位數的 1 念 เอ็ด（不是 หนึ่ง），20 念 ยี่สิบ（不是 สองสิบ）。", "สิบเอ็ด ยี่สิบ")],
        pool: [NUM("๑๑","สิบเอ็ด","sìp-èt","11"), NUM("๒๐","ยี่สิบ","yîi-sìp","20"), NUM("๒๑","ยี่สิบเอ็ด","yîi-sìp-èt","21"), NUM("๕๐","ห้าสิบ","hâa-sìp","50"),
               NUM("๑๐๐","ร้อย","rɔ́ɔi","100"), NUM("๑๐๐๐","พัน","phan","1000"), W("บาท","bàat","泰銖（บาท）")] },
      { id: "u8rv", name: "數字複習", icon: "★", review: true, kinds: ["mean", "listen", "toThai"], match: "zh", poolFrom: ["u8l1", "u8l2", "u8l3"] }
    ]
  },
  {
    id: "u9", title: "第 9 單元　常用單字", desc: "家人、吃喝、動詞、形容詞、問句",
    lessons: [
      { id: "u9l1", name: "人稱與家人", icon: "แม่", kinds: ["mean", "listen", "toThai"], match: "zh",
        intro: [R("女生的「我」", "ฉัน / ดิฉัน", "chǎn / dì-chǎn", "我（女生）", "日常用 ฉัน，正式場合用 ดิฉัน。男生說 ผม（phǒm）。", "ฉัน")],
        pool: [W("ฉัน","chǎn","我（女生）"), W("คุณ","khun","你"), W("เขา","khǎo","他、她"), W("เรา","rao","我們"),
               W("พ่อ","phɔ̂ɔ","爸爸"), W("แม่","mɛ̂ɛ","媽媽"), W("พี่","phîi","哥哥、姊姊"), W("น้อง","nɔ́ɔng","弟弟、妹妹"), W("เพื่อน","phʉ̂an","朋友"), W("แฟน","fɛɛn","男朋友、女朋友")] },
      { id: "u9l2", name: "吃吃喝喝", icon: "ข้าว", kinds: ["mean", "listen", "toThai"], match: "zh",
        pool: [W("กิน","gin","吃"), W("ดื่ม","dʉ̀ʉm","喝"), W("ข้าว","khâao","飯"), W("น้ำ","náam","水"), W("กาแฟ","gaa-fɛɛ","咖啡"),
               W("ไก่","gài","雞肉"), W("อร่อย","à-rɔ̀i","好吃"), W("เผ็ด","phèt","辣"), W("หวาน","wǎan","甜")] },
      { id: "u9l3", name: "常用動詞", icon: "ไป", kinds: ["mean", "listen", "toThai"], match: "zh",
        pool: [W("ไป","bpai","去"), W("มา","maa","來"), W("ชอบ","chɔ̂ɔp","喜歡"), W("รัก","rák","愛"), W("อยาก","yàak","想要"),
               W("มี","mii","有"), W("เป็น","bpen","是"), W("ทำ","tham","做"), W("ดู","duu","看"), W("เรียน","rian","學習")] },
      { id: "u9l4", name: "形容詞", icon: "สวย", kinds: ["mean", "listen", "toThai"], match: "zh",
        pool: [W("ดี","dii","好"), W("สวย","sǔai","漂亮"), W("ร้อน","rɔ́ɔn","熱"), W("หนาว","nǎao","冷"), W("ใหญ่","yài","大"),
               W("เล็ก","lék","小"), W("แพง","phɛɛng","貴"), W("ถูก","thùuk","便宜"), W("มาก","mâak","很、非常")] },
      { id: "u9l5", name: "問句詞", icon: "ไหม", kinds: ["mean", "listen", "toThai"], match: "zh",
        intro: [R("問句放句尾", "ไปไหมคะ", "bpai mǎi khá", "要去嗎？", "泰文的疑問詞多半放在句尾，像中文的「嗎」。女生問句結尾加 คะ。", "ไปไหมคะ")],
        pool: [W("อะไร","à-rai","什麼"), W("ที่ไหน","thîi-nǎi","哪裡"), W("เมื่อไร","mʉ̂a-rai","什麼時候"), W("ใคร","khrai","誰"),
               W("เท่าไร","thâo-rai","多少"), W("ไหม","mǎi","嗎"), W("ทำไม","tham-mai","為什麼")] },
      { id: "u9rv", name: "單字複習", icon: "★", review: true, kinds: ["mean", "listen", "toThai"], match: "zh", poolFrom: ["u9l1", "u9l2", "u9l3", "u9l4", "u9l5"] }
    ]
  },
  {
    id: "u10", title: "第 10 單元　會話", desc: "女生用語：句尾 ค่ะ / คะ",
    lessons: [
      { id: "u10l1", name: "打招呼", icon: "ค่ะ", kinds: ["mean", "listen", "toThai"], match: "zh", phrase: true,
        intro: [R("句尾語氣詞", "ค่ะ / คะ", "khâ / khá", "陳述句 / 問句", "女生說話句尾加 ค่ะ（陳述）或 คะ（問句），聽起來有禮貌。男生用 ครับ（khráp）。", "ค่ะ")],
        pool: [P("สวัสดีค่ะ","sà-wàt-dii khâ","你好、再見"), P("ขอบคุณค่ะ","khɔ̀ɔp-khun khâ","謝謝"), P("ขอโทษค่ะ","khɔ̌ɔ-thôot khâ","對不起"),
               P("ไม่เป็นไรค่ะ","mâi bpen rai khâ","沒關係"), P("สบายดีไหมคะ","sà-baai dii mǎi khá","你好嗎？"), P("สบายดีค่ะ","sà-baai dii khâ","我很好")] },
      { id: "u10l2", name: "自我介紹", icon: "ชื่อ", kinds: ["mean", "listen", "toThai"], match: "zh", phrase: true,
        pool: [P("ชื่ออะไรคะ","chʉ̂ʉ à-rai khá","你叫什麼名字？"), P("ฉันชื่อโฮโฮค่ะ","chǎn chʉ̂ʉ hoo-hoo khâ","我叫 HoHo"),
               P("ฉันเป็นคนไต้หวันค่ะ","chǎn bpen khon dtâi-wǎn khâ","我是台灣人"), P("ยินดีที่ได้รู้จักค่ะ","yin-dii thîi dâai rúu-jàk khâ","很高興認識你"),
               P("พูดภาษาไทยได้นิดหน่อยค่ะ","phûut phaa-sǎa thai dâai nít-nɔ̀i khâ","我會說一點泰文")] },
      { id: "u10l3", name: "購物點餐", icon: "฿", kinds: ["mean", "listen", "toThai"], match: "zh", phrase: true,
        pool: [P("อันนี้เท่าไรคะ","an-níi thâo-rai khá","這個多少錢？"), P("แพงไปค่ะ","phɛɛng bpai khâ","太貴了"), P("ลดได้ไหมคะ","lót dâai mǎi khá","可以算便宜一點嗎？"),
               P("เอาอันนี้ค่ะ","ao an-níi khâ","我要這個"), P("ไม่เผ็ดค่ะ","mâi phèt khâ","不要辣"), P("เช็กบิลค่ะ","chék bin khâ","買單")] },
      { id: "u10l4", name: "旅行求助", icon: "ไหน", kinds: ["mean", "listen", "toThai"], match: "zh", phrase: true,
        pool: [P("ห้องน้ำอยู่ที่ไหนคะ","hɔ̂ng-náam yùu thîi-nǎi khá","廁所在哪裡？"), P("ไม่เข้าใจค่ะ","mâi khâo-jai khâ","我聽不懂"),
               P("พูดช้าๆ ได้ไหมคะ","phûut cháa-cháa dâai mǎi khá","可以說慢一點嗎？"), P("ช่วยด้วยค่ะ","chûai dûai khâ","請幫幫我"), P("ไปสนามบินค่ะ","bpai sà-nǎam-bin khâ","我要去機場")] },
      { id: "u10rv", name: "畢業考", icon: "畢", review: true, kinds: ["mean", "listen", "toThai"], match: "zh", phrase: true, poolFrom: ["u10l1", "u10l2", "u10l3", "u10l4"] }
    ]
  }
];

/* resolve poolFrom references */
(() => {
  const byId = {};
  COURSE.forEach(u => u.lessons.forEach(l => { byId[l.id] = l; l.unit = u.id; }));
  COURSE.forEach(u => u.lessons.forEach(l => {
    if (l.poolFrom) l.pool = l.poolFrom.flatMap(id => byId[id].pool);
  }));
})();
