import { DEMO_HOTEL } from "@/data/demo-hotel";
import { detectLanguage } from "../i18n";
import type { LanguageCode, RequestType } from "../types";
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
  transport: /airport|taxi|car|مطار|تاكسي|سيارة|bandara|taksi|ہوائی اڈ|ٹیکسی|havalimanı|taksi/i,
  towels: /towel|pillow|blanket|water bottle|منشف|مناشف|مخدة|بطانية|handuk|bantal|تولیہ|havlu|yastık/i,
  cleaning: /clean|housekeeping|تنظيف|نظافة|bersih|صفائی|temizlik/i,
  human: /complain|manager|human|person|staff|refund|شكوى|مدير|موظف|استرجاع|keluhan|manajer|شکایت|مینیجر|şikayet|müdür/i,
};

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
    const latest = guestTurns.at(-1)?.content ?? "";
    const lang = toLang(detectLanguage(latest));
    let intent = detectIntent(latest);
    let requestText = latest;
    const room = extractRoomNumber(latest) ?? findRoomInHistory(guestTurns.map((t) => t.content));

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
      const fact = hotel.knowledge.find((k) => k.topic.includes(intent!));
      return fact?.content ?? T.escalated!.en;
    }
    return T[intent]![lang];
  }
}

function findRoomInHistory(guestTexts: string[]): string | null {
  for (const t of [...guestTexts].reverse()) {
    const r = extractRoomNumber(t);
    if (r) return r;
  }
  return null;
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
