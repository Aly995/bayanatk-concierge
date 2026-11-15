import type { Localized } from "./site/schema";
import { arCount, ltr } from "./site/strings";

const DAYS: [string, string, string, string] = ["يوم واحد", "يومان", "أيام", "يوماً"];

/**
 * The guest privacy notice, in English and Arabic (Saudi PDPL expects Arabic).
 * One template for every hotel: the hotel is the data controller, Bayanatk runs the service for it.
 * Changing the text? Update PRIVACY_NOTICE_VERSION and keep the old version in git history.
 * The hotel should have its adviser review this before a pilot (docs/PILOT.md).
 */
export const PRIVACY_NOTICE_VERSION = "2026-11-15";

export type PrivacyFacts = {
  hotelName: Localized;
  contact: { phone?: string; email?: string };
  retentionDays: number;
  bookingRetentionDays: number;
};

export type PrivacySection = { title: Localized; body: Localized[] };

export function privacySections(f: PrivacyFacts): PrivacySection[] {
  const contactEn = [f.contact.email, f.contact.phone].filter(Boolean).join(" or ") || "the front desk";
  const contactAr = [f.contact.email, f.contact.phone].filter(Boolean).map((c) => ltr(c!)).join(" أو ") || "مكتب الاستقبال";
  return [
    {
      title: { en: "Who is responsible", ar: "الجهة المسؤولة" },
      body: [
        {
          en: `${f.hotelName.en} is responsible for your personal data. Bayanatk runs the guest chat and booking form for the hotel and only uses your data on the hotel's instructions.`,
          ar: `${f.hotelName.ar} هو المسؤول عن بياناتك الشخصية. تشغّل بياناتك المحادثة ونموذج الحجز لصالح الفندق، ولا تستخدم بياناتك إلا بتعليمات الفندق.`,
        },
      ],
    },
    {
      title: { en: "What we collect", ar: "البيانات التي نجمعها" },
      body: [
        {
          en: "In the chat: your messages, the language you write in, and your room number or name if you give them.",
          ar: "في المحادثة: رسائلك، واللغة التي تكتب بها، ورقم غرفتك أو اسمك إذا ذكرتهما.",
        },
        {
          en: "In a booking request: your name, phone number, dates, number of guests and the room you choose. Email, country and special requests only if you add them.",
          ar: "في طلب الحجز: اسمك ورقم هاتفك والتواريخ وعدد الضيوف والغرفة التي تختارها. والبريد الإلكتروني والدولة والطلبات الخاصة فقط إذا أضفتها.",
        },
        {
          en: "We never ask for card numbers. Please don't share payment or health details in the chat.",
          ar: "لا نطلب أرقام البطاقات أبداً. يُرجى عدم مشاركة بيانات الدفع أو البيانات الصحية في المحادثة.",
        },
      ],
    },
    {
      title: { en: "Why we use it", ar: "لماذا نستخدمها" },
      body: [
        {
          en: "To answer your questions, pass your requests to hotel staff, and reply to your booking request. We use it for nothing else: no advertising, and we never sell it.",
          ar: "للرد على أسئلتك، وإيصال طلباتك إلى موظفي الفندق، والرد على طلب حجزك. لا نستخدمها لأي غرض آخر: لا إعلانات، ولا نبيعها أبداً.",
        },
        {
          en: "We do this because you asked us to (by writing to us or sending a request) and, for booking requests, with the consent you give in the form.",
          ar: "نقوم بذلك لأنك طلبت ذلك (بمراسلتنا أو بإرسال طلب)، وفي طلبات الحجز بناءً على موافقتك في النموذج.",
        },
      ],
    },
    {
      title: { en: "AI replies and who else sees your data", ar: "الردود الآلية ومن يطلع على بياناتك" },
      body: [
        {
          en: "Chat replies are written by an AI assistant using only the hotel's information. Hotel staff can read every chat and take over at any time. Ask for a person and one will reply.",
          ar: "يكتب الردود في المحادثة مساعد ذكي يعتمد فقط على معلومات الفندق. يستطيع موظفو الفندق قراءة كل محادثة والتدخل في أي وقت. اطلب التحدث مع موظف وسيرد عليك أحدهم.",
        },
        {
          en: "To provide the service, your data is processed by these providers: Anthropic (writes the AI replies), Supabase (stores the data), Cloudflare (runs the website) and, if you use WhatsApp, Meta. Some of them process data outside Saudi Arabia.",
          ar: "لتقديم الخدمة تتم معالجة بياناتك لدى هؤلاء المزودين: Anthropic (لكتابة الردود الآلية)، وSupabase (لتخزين البيانات)، وCloudflare (لتشغيل الموقع)، وMeta إذا استخدمت واتساب. يعالج بعضهم البيانات خارج المملكة العربية السعودية.",
        },
      ],
    },
    {
      title: { en: "How long we keep it", ar: "مدة الاحتفاظ بالبيانات" },
      body: [
        {
          en: `Chats are deleted automatically ${f.retentionDays} days after the last message. Booking requests are deleted ${f.bookingRetentionDays} days after they are made, unless the law requires the hotel to keep them longer.`,
          ar: `تُحذف المحادثات تلقائياً بعد ${arCount(f.retentionDays, DAYS)} من آخر رسالة. وتُحذف طلبات الحجز بعد ${arCount(f.bookingRetentionDays, DAYS)} من إرسالها، ما لم يُلزم النظام الفندق بالاحتفاظ بها مدة أطول.`,
        },
      ],
    },
    {
      title: { en: "Your rights", ar: "حقوقك" },
      body: [
        {
          en: `You can ask to see, correct or delete your data, and withdraw your consent at any time. Contact the hotel at ${contactEn}. We reply within 30 days. You can also complain to the Saudi Data and AI Authority (SDAIA).`,
          ar: `يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، وسحب موافقتك في أي وقت. تواصل مع الفندق عبر ${contactAr}. نرد خلال 30 يوماً. ويمكنك أيضاً تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).`,
        },
      ],
    },
  ];
}
