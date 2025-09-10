export const I18N: Record<string, Record<string, string>> = {
  en: {
    placeholder: "Type your message…",
    send: "Send",
    offerCheckin: "Offer check-in (consent)",
    resources: "Resources",
    about: "About",
    apiStatus: "API Status",
    selectLanguage: "Language",
    noResources: "No resources yet.",
    networkError: "Network error. Please try again.",
    crisisAlert: "High risk detected. Please seek immediate professional help if needed.",
    health: "Health",
    ready: "Ready",
  },
  hi: {
    placeholder: "अपना संदेश लिखें…",
    send: "भेजें",
    offerCheckin: "चेक-इन का प्रस्ताव (सहमति)",
    resources: "संसाधन",
    about: "जानकारी",
    apiStatus: "API स्थिति",
    selectLanguage: "भाषा",
    noResources: "अभी तक कोई संसाधन नहीं।",
    networkError: "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।",
    crisisAlert: "उच्च जोखिम का पता चला। यदि आवश्यक हो तो कृपया तुरंत पेशेवर सहायता लें।",
    health: "स्वास्थ्य",
    ready: "तैयार",
  },
  bn: {},
  te: {},
  ta: {},
  mr: {},
  gu: {},
  kn: {},
  ml: {},
  pa: {},
  or: {},
  as: {},
  ur: {},
}

export function t(lang: string, key: string) {
  const L = I18N[lang] || {}
  return L[key] ?? I18N.en[key] ?? key
}
