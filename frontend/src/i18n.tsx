import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ka" | "en";

const STORAGE_KEY = "abuladze_lang";

// All static UI strings. Georgian (ka) is the primary language.
const dict: Record<Lang, Record<string, string>> = {
  ka: {
    "nav.about": "ჩვენ შესახებ",
    "nav.courses": "კურსები",
    "nav.lecturers": "ლექტორები",
    "nav.contact": "კონტაქტი",
    "nav.register": "რეგისტრაცია",
    "nav.apply": "დარეგისტრირდი",
    "nav.admin": "ადმინი",
    "common.loading": "იტვირთება…",
    "common.backToSite": "← საიტზე დაბრუნება",
    "common.send": "გაგზავნა",
    "common.cancel": "გაუქმება",
    "common.save": "შენახვა",
    "hero.explore": "ნახე კურსები",
    "hero.codeComment": "# შენი მოგზაურობა აქ იწყება 🚀",
    "stats.students": "მომზადებული სტუდენტი",
    "stats.courses": "შემოთავაზებული კურსი",
    "stats.rate": "დასაქმების მაჩვენებელი",
    "about.point1": "პრაქტიკული, პროექტებზე დაფუძნებული პროგრამა",
    "about.point2": "მცირე ჯგუფები რეალური მენტორობით",
    "about.point3": "ასწავლიან მოქმედი ინჟინრები",
    "about.point4": "კარიერული მხარდაჭერა და პორტფოლიოს აგება",
    "courses.level": "დონე",
    "courses.free": "უფასო",
    "courses.enroll": "დეტალები →",
    "courses.empty": "კურსები ჯერ არ არის.",
    "courses.backToList": "← კურსებთან დაბრუნება",
    "courses.enroll_action": "კურსზე რეგისტრაცია",
    "courses.notFound": "კურსი ვერ მოიძებნა.",
    "lecturers.title": "ჩვენი ლექტორები",
    "lecturers.subtitle": "გაიცანი გუნდი, რომელიც შენს განვითარებაზე იზრუნებს.",
    "lecturers.viewProfile": "პროფილის ნახვა →",
    "lecturers.empty": "ლექტორები ჯერ არ არის.",
    "lecturers.back": "← ლექტორებთან დაბრუნება",
    "lecturers.biography": "ბიოგრაფია",
    "lecturers.specialties": "სპეციალიზაცია",
    "lecturers.books": "წიგნები და პუბლიკაციები",
    "lecturers.links": "ბმულები",
    "lecturers.notFound": "ლექტორი ვერ მოიძებნა.",
    "enroll.title": "მზად ხარ სასწავლებლად?",
    "enroll.subtitle":
      "გაგზავნე განაცხადი და ჩვენი გუნდი დაგიკავშირდება შემდეგი ნაბიჯებისთვის. დამწყები კურსებისთვის წინასწარი ცოდნა საჭირო არ არის.",
    "enroll.fullName": "სახელი და გვარი",
    "enroll.email": "ელ. ფოსტა",
    "enroll.phone": "ტელეფონი",
    "enroll.interestedIn": "მაინტერესებს",
    "enroll.notSure": "ჯერ არ ვიცი",
    "enroll.message": "შეტყობინება",
    "enroll.submit": "განაცხადის გაგზავნა",
    "enroll.sending": "იგზავნება…",
    "enroll.successTitle": "განაცხადი მიღებულია!",
    "enroll.successText": "მალე დაგიკავშირდებით. გმადლობთ.",
    "enroll.another": "ახლის გაგზავნა",
    "register.title": "რეგისტრაცია",
    "register.subtitle":
      "შეავსე ფორმა და დაიწყე სწავლა აბულაძის აკადემიაში. ველებიდან მონიშნულები სავალდებულოა.",
    "contact.subtitle": "გაქვს კითხვები? მოგვწერე და მალე გიპასუხებთ.",
    "contact.name": "სახელი",
    "contact.subject": "თემა",
    "contact.message": "შეტყობინება",
    "contact.submit": "შეტყობინების გაგზავნა",
    "contact.successTitle": "შეტყობინება გაიგზავნა!",
    "contact.successText": "გმადლობთ დაკავშირებისთვის.",
    "contact.labelEmail": "ელ. ფოსტა",
    "contact.labelPhone": "ტელეფონი",
    "contact.labelAddress": "მისამართი",
    "footer.rights": "ყველა უფლება დაცულია.",
    "form.error": "რაღაც შეცდომა მოხდა",
  },
  en: {
    "nav.about": "About",
    "nav.courses": "Courses",
    "nav.lecturers": "Lecturers",
    "nav.contact": "Contact",
    "nav.register": "Register",
    "nav.apply": "Apply Now",
    "nav.admin": "Admin",
    "common.loading": "Loading…",
    "common.backToSite": "← Back to site",
    "common.send": "Send",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "hero.explore": "Explore Courses",
    "hero.codeComment": "# Your journey starts here 🚀",
    "stats.students": "Students trained",
    "stats.courses": "Courses offered",
    "stats.rate": "Job placement rate",
    "about.point1": "Project-based, practical curriculum",
    "about.point2": "Small groups with real mentorship",
    "about.point3": "Taught by working industry engineers",
    "about.point4": "Career support and portfolio building",
    "courses.level": "Level",
    "courses.free": "Free",
    "courses.enroll": "Details →",
    "courses.empty": "No courses yet.",
    "courses.backToList": "← Back to courses",
    "courses.enroll_action": "Enroll in this course",
    "courses.notFound": "Course not found.",
    "lecturers.title": "Our Lecturers",
    "lecturers.subtitle": "Meet the team that will guide your growth.",
    "lecturers.viewProfile": "View profile →",
    "lecturers.empty": "No lecturers yet.",
    "lecturers.back": "← Back to lecturers",
    "lecturers.biography": "Biography",
    "lecturers.specialties": "Specialties",
    "lecturers.books": "Books & Publications",
    "lecturers.links": "Links",
    "lecturers.notFound": "Lecturer not found.",
    "enroll.title": "Ready to start learning?",
    "enroll.subtitle":
      "Apply now and our team will reach out with the next steps. No prior experience required for our beginner tracks.",
    "enroll.fullName": "Full name",
    "enroll.email": "Email",
    "enroll.phone": "Phone",
    "enroll.interestedIn": "Interested in",
    "enroll.notSure": "Not sure yet",
    "enroll.message": "Message",
    "enroll.submit": "Submit Application",
    "enroll.sending": "Sending…",
    "enroll.successTitle": "Application received!",
    "enroll.successText": "We'll be in touch shortly. Thank you.",
    "enroll.another": "Submit another",
    "register.title": "Registration",
    "register.subtitle":
      "Fill in the form to start learning at Abuladze Academy. Fields marked with * are required.",
    "contact.subtitle": "Have questions? Send us a message and we'll get back to you.",
    "contact.name": "Name",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.submit": "Send Message",
    "contact.successTitle": "Message sent!",
    "contact.successText": "Thanks for reaching out.",
    "contact.labelEmail": "Email",
    "contact.labelPhone": "Phone",
    "contact.labelAddress": "Address",
    "footer.rights": "All rights reserved.",
    "form.error": "Something went wrong",
  },
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nState | undefined>(undefined);

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "ka"; // Georgian is the default
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nState>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key: string) => dict[lang][key] ?? dict.ka[key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
