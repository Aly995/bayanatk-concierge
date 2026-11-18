import { DEMO_HOTEL } from "@/data/demo-hotel";
import { detectLanguage } from "../i18n";
import type { Hotel, LanguageCode, RequestType } from "../types";
import type { AIProvider, RespondArgs } from "./provider";

/**
 * Offline, rule-based assistant so the product can be demoed with no API key.
 * It understands a fixed set of intents in 5 languages. The real Claude
 * provider replaces it as soon as ANTHROPIC_API_KEY is set.
 */

type Lang = Exclude<LanguageCode, "other">;
type Intent =
  | "greeting" | "checkin" | "location" | "breakfast" | "wifi" | "zamzam"
  | "late_checkout" | "transport" | "towels" | "cleaning" | "human";

const KEYWORDS: Record<Intent, RegExp> = {
  greeting: /^(hi|hello|salam|assalam|السلام|مرحبا|اهلا|halo|merhaba|selam)\b|^السلام/i,
  checkin: /check.?in|تسجيل الدخول|موعد الدخول|وقت الدخول|چیک ان|giriş/i,
  location: /haram|mosque|masjid|nabawi|الحرم|المسجد|مسجد نبوی|حرم|cami/i,
  breakfast: /breakfast|suhoor|فطور|الإفطار|سحور|sarapan|ناشتہ|kahvaltı/i,
  wifi: /wi-?fi|wifi|internet|واي فاي|الانترنت|انٹرنیٹ|internet/i,
  zamzam: /zamzam|زمزم/i,
  late_checkout: /late check.?out|تأخير.*(الخروج|المغادرة)|خروج متأخر|checkout terlambat|geç çıkış/i,
  transport: /airport|pick-?up|transfer|taxi|\bcars?\b|مطار|تاكسي|سيارة|توصيل|bandara|jemputan|taksi|ہوائی اڈ|ایئرپورٹ|ٹیکسی|havalimanı/i,
  towels: /towel|pillow|blanket|water bottle|منشف|مناشف|مخدة|بطانية|handuk|bantal|تولیہ|havlu|yastık/i,
  cleaning: /clean|housekeeping|تنظيف|نظافة|bersih|صفائی|temizlik/i,
  human:
    /complain|manager|human|person|staff|refund|(talk|speak) (to|with) (the )?(front desk|reception)|شكوى|مدير|موظف|استرجاع|(التحدث|أتحدث|اتحدث|أكلم|اكلم) مع الاستقبال|keluhan|manajer|bicara dengan resepsionis|شکایت|مینیجر|ریسپشن سے بات|şikayet|müdür|resepsiyonla görüş/i,
};

/**
 * Services a guest often asks ABOUT before asking FOR ("Is there an airport pickup?").
 * A question gets the hotel's facts and an offer to arrange it; only a "yes" (or a direct
 * request) creates a request. Add an intent here with its answer in T and its fact topics.
 */
const INFO_FIRST: Partial<Record<Intent, { answer: string; topics: string[] }>> = {
  transport: { answer: "transport_info", topics: ["airport", "transport", "taxi", "transfer"] },
};

/** Words that make a message a request rather than a question. */
const REQUEST_WORDS =
  /\b(i need|i want|i'd like|i would like|please (book|arrange|send|get|call)|book (me|a|an)|arrange|can you (book|send|get|call|arrange)|could you)\b|أريد|اريد|أبغى|ابغى|أحتاج|احتاج|احجز|تحجز|رتب|ترتب|اطلب|أرسل|ارسل|ترسل|چاہیے|بک کر|\b(butuh|mau|tolong|pesan)\b|istiyorum|ayarla|ayırt/i;
/** Question marks or question words, in the five languages. */
const QUESTION =
  /[?؟]|^(is|are|do|does|how|what|when|where|which)\b|^(هل|كم|بكم|ما|ماذا|متى|كيف|أين|وين|فيه)(\s|$)|کیا|کتنے|کتنا|\b(apakah|apa|berapa|ada)\b|var m[ıi]|ne kadar/i;

/** True for "Is there…?", "How much…?" style questions that ask for information only. */
export function isInfoQuestion(text: string): boolean {
  return !REQUEST_WORDS.test(text) && QUESTION.test(text.trim());
}

const YES = new Set([
  "yes", "yeah", "yep", "sure", "please", "ok", "okay", "yes please", "please do",
  "نعم", "ايوه", "أيوه", "أجل", "بلى", "تمام", "طيب", "ياريت", "يا ريت", "لو سمحت", "من فضلك", "اكيد", "أكيد",
  "ya", "iya", "boleh", "mau", "ہاں", "جی", "جی ہاں", "ضرور", "evet", "olur", "tamam", "lütfen",
]);

/** True when the message accepts an offer ("Yes please", "نعم", "Evet, lütfen"). */
export function isYes(text: string): boolean {
  const words = text.toLowerCase().replace(/[!.,،؟?✓👍]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;
  return YES.has(words.join(" ")) || YES.has(words.slice(0, 2).join(" ")) || YES.has(words[0]!);
}

const ROOM_INTENTS: Partial<Record<Intent, RequestType>> = {
  transport: "transport",
  towels: "extra_items",
  cleaning: "housekeeping",
  late_checkout: "late_checkout",
};

const T: Record<string, Record<Lang, string>> = {
  greeting: {
    en: "Welcome to Dar Al Noor! How can I help you today?",
    ar: "وعليكم السلام، أهلاً بك في فندق دار النور. كيف أستطيع مساعدتك؟",
    id: "Waalaikumsalam, selamat datang di Dar Al Noor! Ada yang bisa saya bantu?",
    ur: "وعلیکم السلام، دار النور ہوٹل میں خوش آمدید۔ میں آپ کی کیا مدد کر سکتا ہوں؟",
    tr: "Aleykümselam, Dar Al Noor'a hoş geldiniz! Size nasıl yardımcı olabilirim?",
  },
  checkin: {
    en: "Check-in is from 15:00 and check-out is by 12:00. Early check-in is free if a room is ready.",
    ar: "تسجيل الدخول من الساعة 3 عصراً، والمغادرة حتى 12 ظهراً. الدخول المبكر مجاني إذا كانت الغرفة جاهزة.",
    id: "Check-in mulai pukul 15.00 dan check-out paling lambat 12.00. Check-in lebih awal gratis jika kamar sudah siap.",
    ur: "چیک ان سہ پہر 3 بجے سے ہے اور چیک آؤٹ دوپہر 12 بجے تک۔ کمرہ تیار ہو تو جلدی چیک ان مفت ہے۔",
    tr: "Giriş saat 15:00'ten itibaren, çıkış en geç 12:00'dir. Oda hazırsa erken giriş ücretsizdir.",
  },
  location: {
    en: "The Prophet's Mosque is a 5-minute walk through Gate 25 (King Fahd Gate).",
    ar: "المسجد النبوي على بُعد 5 دقائق مشياً عبر البوابة 25 (باب الملك فهد).",
    id: "Masjid Nabawi hanya 5 menit berjalan kaki melalui Gerbang 25 (King Fahd Gate).",
    ur: "مسجد نبوی گیٹ 25 (کنگ فہد گیٹ) سے صرف 5 منٹ پیدل ہے۔",
    tr: "Mescid-i Nebevi, 25 numaralı kapıdan (Kral Fahd Kapısı) yürüyerek 5 dakika.",
  },
  breakfast: {
    en: "Breakfast is served daily from 04:30 to 10:30 on the first floor. In Ramadan, suhoor starts at 02:00.",
    ar: "الإفطار يومياً من 4:30 حتى 10:30 صباحاً في الطابق الأول، وفي رمضان يُقدَّم السحور من الساعة 2 فجراً.",
    id: "Sarapan setiap hari pukul 04.30 sampai 10.30 di lantai satu. Saat Ramadan, sahur mulai pukul 02.00.",
    ur: "ناشتہ روزانہ صبح 4:30 سے 10:30 تک پہلی منزل پر ہے۔ رمضان میں سحری رات 2 بجے سے۔",
    tr: "Kahvaltı her gün 04:30-10:30 arası birinci katta. Ramazan'da sahur 02:00'de başlar.",
  },
  wifi: {
    en: "Wi-Fi is free. Network: DarAlNoor-Guest. The password is on your key card holder.",
    ar: "الواي فاي مجاني. اسم الشبكة: DarAlNoor-Guest، وكلمة المرور على غلاف بطاقة الغرفة.",
    id: "Wi-Fi gratis. Jaringan: DarAlNoor-Guest. Kata sandi ada di sampul kartu kunci.",
    ur: "وائی فائی مفت ہے۔ نیٹ ورک: DarAlNoor-Guest۔ پاس ورڈ کی کارڈ ہولڈر پر ہے۔",
    tr: "Wi-Fi ücretsiz. Ağ: DarAlNoor-Guest. Şifre oda kartı kılıfında yazılı.",
  },
  zamzam: {
    en: "Zamzam water is free on every floor, next to the lifts.",
    ar: "ماء زمزم متوفر مجاناً في كل طابق بجانب المصاعد.",
    id: "Air Zamzam tersedia gratis di setiap lantai, di samping lift.",
    ur: "آب زمزم ہر منزل پر لفٹ کے ساتھ مفت دستیاب ہے۔",
    tr: "Zemzem suyu her katta asansörlerin yanında ücretsizdir.",
  },
  transport_info: {
    en: "Yes. An airport transfer to or from Prince Mohammad bin Abdulaziz Airport costs SAR 120 per car (up to 4 guests), and it is free if you booked directly with us for 3 nights or more. Please book at least 3 hours ahead. Would you like me to arrange it?",
    ar: "نعم، التوصيل من وإلى مطار الأمير محمد بن عبدالعزيز بـ120 ريالاً للسيارة (حتى 4 أشخاص)، ومجاني إذا حجزت معنا مباشرة 3 ليالٍ أو أكثر. يُرجى الحجز قبل 3 ساعات على الأقل. هل تريد أن أرتّبه لك؟",
    id: "Ya. Antar-jemput ke atau dari Bandara Prince Mohammad bin Abdulaziz SAR 120 per mobil (maksimal 4 tamu), dan gratis jika Anda memesan langsung dengan kami minimal 3 malam. Mohon pesan paling lambat 3 jam sebelumnya. Mau saya aturkan?",
    ur: "جی ہاں۔ پرنس محمد بن عبدالعزیز ایئرپورٹ سے یا ایئرپورٹ تک ٹرانسفر 120 ریال فی گاڑی ہے (زیادہ سے زیادہ 4 مہمان)، اور ہوٹل سے براہِ راست 3 یا زیادہ راتوں کی بکنگ پر مفت ہے۔ براہِ کرم کم از کم 3 گھنٹے پہلے بک کریں۔ کیا میں آپ کے لیے انتظام کر دوں؟",
    tr: "Evet. Prens Muhammed bin Abdulaziz Havalimanı'na veya havalimanından transfer araç başına 120 SAR'dır (en fazla 4 misafir); doğrudan bizden 3 gece veya daha fazla rezervasyon yaptıysanız ücretsizdir. Lütfen en az 3 saat önceden ayırtın. Sizin için ayarlayayım mı?",
  },
  offer: {
    en: "Would you like me to arrange it?",
    ar: "هل تريد أن أرتّبه لك؟",
    id: "Mau saya aturkan?",
    ur: "کیا میں آپ کے لیے انتظام کر دوں؟",
    tr: "Sizin için ayarlayayım mı?",
  },
  ask_room_or_arrival: {
    en: "Happy to arrange it. If you're staying with us now, what's your room number? If you're arriving, what are your flight date and time?",
    ar: "بكل سرور. إن كنت مقيماً معنا الآن، فما رقم غرفتك؟ وإن كنت قادماً، فما تاريخ رحلتك ووقت وصولها؟",
    id: "Dengan senang hati. Jika Anda sedang menginap, berapa nomor kamar Anda? Jika Anda baru akan tiba, kapan tanggal dan jam penerbangan Anda?",
    ur: "ضرور۔ اگر آپ ابھی ہمارے ہاں ٹھہرے ہوئے ہیں تو آپ کا کمرہ نمبر کیا ہے؟ اگر آپ آ رہے ہیں تو آپ کی فلائٹ کی تاریخ اور وقت کیا ہے؟",
    tr: "Memnuniyetle. Şu anda bizde kalıyorsanız oda numaranız nedir? Geliyorsanız uçuş tarihiniz ve saatiniz nedir?",
  },
  arrival_done: {
    en: "Thank you ✓ I've sent your arrival details to the front desk. They will confirm your driver here shortly.",
    ar: "شكراً لك ✓ أرسلت تفاصيل وصولك إلى الاستقبال، وسيؤكدون لك السائق هنا قريباً.",
    id: "Terima kasih ✓ Detail kedatangan Anda sudah saya kirim ke resepsionis. Mereka akan segera mengonfirmasi sopir Anda di sini.",
    ur: "شکریہ ✓ آپ کی آمد کی تفصیلات ریسپشن کو بھیج دی گئی ہیں۔ وہ جلد یہاں آپ کے ڈرائیور کی تصدیق کریں گے۔",
    tr: "Teşekkürler ✓ Varış bilgilerinizi resepsiyona ilettim. Şoförünüzü kısa süre içinde buradan onaylayacaklar.",
  },
  ask_room: {
    en: "Of course! What is your room number?",
    ar: "بكل سرور! ما رقم غرفتك؟",
    id: "Tentu! Berapa nomor kamar Anda?",
    ur: "ضرور! آپ کا کمرہ نمبر کیا ہے؟",
    tr: "Tabii! Oda numaranız nedir?",
  },
  request_done: {
    en: "Done ✓ I've sent your request to our team for room {room}. They will take care of it shortly.",
    ar: "تم ✓ أرسلت طلبك إلى فريقنا للغرفة {room}، وسيتم تنفيذه قريباً.",
    id: "Selesai ✓ Permintaan Anda untuk kamar {room} sudah dikirim ke tim kami.",
    ur: "ہو گیا ✓ کمرہ {room} کے لیے آپ کی درخواست ہماری ٹیم کو بھیج دی گئی ہے۔",
    tr: "Tamam ✓ {room} numaralı oda için talebiniz ekibimize iletildi.",
  },
  late_checkout_note: {
    en: "Late check-out until 16:00 costs SAR 150; the front desk will confirm.",
    ar: "التأخير حتى الساعة 4 عصراً بتكلفة 150 ريالاً، وسيؤكد لك الاستقبال.",
    id: "Check-out terlambat sampai 16.00 dikenakan SAR 150; resepsionis akan mengonfirmasi.",
    ur: "شام 4 بجے تک لیٹ چیک آؤٹ 150 ریال ہے؛ ریسیپشن تصدیق کرے گا۔",
    tr: "16:00'ya kadar geç çıkış 150 SAR'dır; resepsiyon onaylayacak.",
  },
  escalated: {
    en: "I've passed this to a member of our team. They will reply to you here shortly.",
    ar: "حوّلت طلبك إلى أحد موظفينا، وسيرد عليك هنا قريباً.",
    id: "Saya sudah meneruskan ini ke tim kami. Mereka akan segera membalas di sini.",
    ur: "میں نے یہ ہماری ٹیم کو بھیج دیا ہے۔ وہ جلد یہاں جواب دیں گے۔",
    tr: "Bunu ekibimize ilettim. Kısa süre içinde buradan size dönecekler.",
  },
};

const toLang = (l: LanguageCode): Lang => (l === "other" ? "en" : l);
const ARABIC_DIGITS = /[٠-٩]/g;
const normaliseDigits = (s: string) => s.replace(ARABIC_DIGITS, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function extractRoomNumber(text: string): string | null {
  const m = normaliseDigits(text).match(/\b(\d{3,4})\b/);
  return m?.[1] ?? null;
}

export function detectIntent(text: string): Intent | null {
  // Order matters: specific intents before broad ones.
  const order: Intent[] = ["human", "late_checkout", "transport", "towels", "cleaning", "checkin", "breakfast", "wifi", "zamzam", "location", "greeting"];
  return order.find((i) => KEYWORDS[i].test(text)) ?? null;
}

export class MockProvider implements AIProvider {
  readonly name = "offline-demo";

  async respond({ hotel, history, executeTool }: RespondArgs): Promise<string> {
    const guestTurns = history.filter((t) => t.role === "user");
    const texts = guestTurns.map((t) => t.content);
    const latest = texts.at(-1) ?? "";
    const lang = toLang(detectLanguage(latest));
    let intent = detectIntent(latest);
    let requestText = latest;
    const room = extractRoomNumber(latest) ?? findRoomInHistory(texts);

    // A question about a service ("Is there an airport pickup?"): facts first, then an offer.
    if (intent && INFO_FIRST[intent] && isInfoQuestion(latest)) {
      const answer = infoAnswer(hotel, intent, lang);
      if (answer) return answer;
    }

    // "Yes" to that offer. With a room number on file, arrange it now; otherwise ask whether
    // the guest is staying (room number) or arriving (flight details): arrivals have no room.
    const offered = offeredService(texts.at(-2));
    if (!intent && offered && isYes(latest)) {
      if (!room) return T.ask_room_or_arrival![lang];
      intent = offered;
      requestText = texts.at(-2)!;
    }

    // Arrival details after "yes" (no room number): send them to the front desk. The guest
    // may mention the airport again ("I land at the airport at 3pm"), so the same intent counts.
    const arriving = offeredService(texts.at(-3));
    if (arriving && (!intent || intent === arriving) && !looksLikeRoomAnswer(latest) && isYes(texts.at(-2) ?? "")) {
      await executeTool({
        name: "create_service_request",
        input: { type: ROOM_INTENTS[arriving]!, details: summariseArrival(arriving, texts.at(-3)!, latest) },
      });
      return T.arrival_done![lang];
    }

    // "412" on its own answers our room-number question: resume the earlier request.
    if (!intent && room) {
      const earlier = [...guestTurns]
        .reverse()
        .slice(1)
        .map((t) => ({ text: t.content, intent: detectIntent(t.content) }))
        .find((e) => e.intent && ROOM_INTENTS[e.intent]);
      if (earlier) {
        intent = earlier.intent;
        requestText = earlier.text;
      }
    }

    const requestType = intent ? ROOM_INTENTS[intent] : undefined;
    if (intent && requestType) {
      if (!room) return T.ask_room![lang];
      await executeTool({
        name: "create_service_request",
        input: { type: requestType, details: summarise(intent, requestText), room_number: room },
      });
      const done = T.request_done![lang].replace("{room}", room);
      return intent === "late_checkout" ? `${T.late_checkout_note![lang]} ${done}` : done;
    }

    if (intent === "human" || !intent) {
      await executeTool({
        name: "escalate_to_staff",
        input: {
          reason: intent === "human" ? `Guest asked for staff: "${latest.slice(0, 200)}"` : `Question the assistant could not answer: "${latest.slice(0, 200)}"`,
          urgency: intent === "human" ? "normal" : "low",
        },
      });
      return T.escalated![lang];
    }

    // Fact questions. The localised table only describes the demo hotel;
    // for any other hotel, fall back to its own facts in English.
    if (hotel.slug !== DEMO_HOTEL.slug) {
      return factFor(hotel, [intent]) ?? T.escalated!.en;
    }
    return T[intent]![lang];
  }
}

/** The intent of an earlier guest message, if it asked about a service we then offered. */
function offeredService(text: string | undefined): Intent | null {
  if (!text) return null;
  const intent = detectIntent(text);
  return intent && INFO_FIRST[intent] && isInfoQuestion(text) ? intent : null;
}

/** Facts plus an offer. The demo hotel answers in the guest's language; others from their own facts. */
function infoAnswer(hotel: Hotel, intent: Intent, lang: Lang): string | null {
  const info = INFO_FIRST[intent]!;
  if (hotel.slug === DEMO_HOTEL.slug) return T[info.answer]![lang];
  const fact = factFor(hotel, info.topics);
  return fact ? `${fact} ${T.offer![lang]}` : null;
}

function factFor(hotel: Hotel, topics: string[]): string | null {
  return hotel.knowledge.find((k) => topics.some((t) => k.topic.includes(t)))?.content ?? null;
}

const ROOM_WORD = /room|غرف|کمرہ|kamar|\boda\b/i;

/** "412", "room 412", "غرفتي 305": a short reply or one that names a room. Not "flight SV 1234 on 20 Dec 2026". */
function looksLikeRoomAnswer(text: string): boolean {
  if (!extractRoomNumber(text)) return false;
  return ROOM_WORD.test(text) || text.trim().split(/\s+/).length <= 3;
}

function findRoomInHistory(guestTexts: string[]): string | null {
  for (const t of [...guestTexts].reverse()) {
    const r = extractRoomNumber(t);
    if (r) return r;
  }
  return null;
}

function summariseArrival(intent: Intent, question: string, arrival: string): string {
  const label = intent === "transport" ? "Airport pickup for an arriving guest (no room yet)" : `${intent} for an arriving guest`;
  return `${label}\nArrival: ${arrival.slice(0, 200)}\nAsked: ${question.slice(0, 200)}`;
}

function summarise(intent: Intent, text: string): string {
  const label: Record<string, string> = {
    transport: "Transport / airport taxi",
    towels: "Extra items (towels, pillows, water)",
    cleaning: "Room cleaning",
    late_checkout: "Late check-out until 16:00 (SAR 150), please confirm",
  };
  // First line for staff in English, second line the guest's own words.
  return `${label[intent] ?? intent}\n${text.slice(0, 200)}`;
}
