"""Seed the database with a default admin and demo content (Georgian + English).

Idempotent: running it multiple times will not create duplicates.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine
from .models import Admin, Course, EmailTemplate, Professor, SiteContent
from .security import hash_password

# Default email templates. Bodies use {{ variable }} placeholders.
DEFAULT_TEMPLATES = [
    dict(
        key="registration",
        name="რეგისტრაციის დადასტურება (აპლიკანტს)",
        subject="თქვენი განაცხადი მიღებულია — აბულაძის აკადემია",
        body="გამარჯობა {{name}},\n\n"
        "გმადლობთ აბულაძის აკადემიაში რეგისტრაციისთვის! ჩვენ მივიღეთ თქვენი "
        "განაცხადი{{course}} და მალე დაგიკავშირდებით შემდეგი ნაბიჯებისთვის.\n\n"
        "პატივისცემით,\nაბულაძის აკადემიის გუნდი",
    ),
    dict(
        key="admin_new_application",
        name="ახალი განაცხადი (ადმინს)",
        subject="ახალი განაცხადი: {{name}}",
        body="მიღებულია ახალი განაცხადი.\n\n"
        "სახელი: {{name}}\nელ. ფოსტა: {{email}}\nტელეფონი: {{phone}}\n"
        "კურსი: {{course}}\nშეტყობინება: {{message}}",
    ),
    dict(
        key="contact_confirmation",
        name="კონტაქტის დადასტურება (გამომგზავნს)",
        subject="მივიღეთ თქვენი შეტყობინება — აბულაძის აკადემია",
        body="გამარჯობა {{name}},\n\n"
        "გმადლობთ დაკავშირებისთვის. მივიღეთ თქვენი შეტყობინება და მალე გიპასუხებთ.\n\n"
        "პატივისცემით,\nაბულაძის აკადემიის გუნდი",
    ),
    dict(
        key="admin_new_message",
        name="ახალი შეტყობინება (ადმინს)",
        subject="ახალი შეტყობინება: {{subject}}",
        body="მიღებულია ახალი შეტყობინება საიტიდან.\n\n"
        "სახელი: {{name}}\nელ. ფოსტა: {{email}}\nთემა: {{subject}}\n\n{{message}}",
    ),
]

# Editable landing-page copy. Each key has a Georgian (ka) and English (en) value.
CONTENT: dict[str, dict[str, str]] = {
    "academy_name": {
        "ka": "STEM ინგა აბულაძის აკადემია",
        "en": "STEM Inga Abuladze Academy",
    },
    "academy_logo_url": {
        "ka": "",
        "en": "",
    },
    "hero_eyebrow": {
        "ka": "STEM ინგა აბულაძის აკადემია",
        "en": "STEM Inga Abuladze Academy",
    },
    "hero_title": {
        "ka": "გახდი პროგრამისტი პრაქტიკული გზით",
        "en": "Become a Software Engineer, the Practical Way",
    },
    "hero_subtitle": {
        "ka": "პრაქტიკული პროგრამირებისა და IT კურსები ინდუსტრიის პროფესიონალებისგან. "
        "ისწავლე რეალური პროგრამული უზრუნველყოფის შექმნა და დაიწყე კარიერა ტექნოლოგიებში.",
        "en": "Hands-on programming & IT courses taught by industry professionals. "
        "Learn to build real software and launch your tech career.",
    },
    "hero_cta": {"ka": "დარეგისტრირდი", "en": "Apply Now"},
    "hero_badge_1": {
        "ka": "პრაქტიკული, პროექტებზე დაფუძნებული სწავლება",
        "en": "Project-based, practical curriculum",
    },
    "hero_badge_2": {
        "ka": "ასწავლიან მოქმედი ინჟინრები",
        "en": "Taught by working engineers",
    },
    "about_title": {"ka": "რატომ აბულაძის აკადემია", "en": "Why Abuladze Academy"},
    "about_text": {
        "ka": "ჩვენ ფოკუსირებული ვართ პრაქტიკულ, პროექტებზე დაფუძნებულ სწავლებაზე. "
        "მცირე ჯგუფები, რეალური მენტორობა და სასწავლო პროგრამა, რომელიც ინდუსტრიის "
        "რეალურ მოთხოვნებს ეფუძნება. იქნები დამწყები თუ გამოცდილი — ჩვენ შენს დონეს "
        "მოვერგებით.",
        "en": "We focus on practical, project-based learning. Small groups, real "
        "mentorship, and a curriculum built around what the industry actually needs. "
        "Whether you are starting from zero or levelling up, we meet you where you are.",
    },
    "stat_students": {"ka": "1200+", "en": "1200+"},
    "stat_courses": {"ka": "12", "en": "12"},
    "stat_rate": {"ka": "92%", "en": "92%"},
    "courses_title": {"ka": "ჩვენი პროგრამები", "en": "Our Programs"},
    "courses_subtitle": {
        "ka": "აირჩიე მიმართულება, რომელიც შენს მიზნებს შეესაბამება.",
        "en": "Pick the track that fits your goals.",
    },
    "professors_title": {"ka": "გაიცანი ჩვენი ლექტორები", "en": "Meet Your Instructors"},
    "professors_subtitle": {
        "ka": "ისწავლე ინჟინრებისგან, რომლებსაც რეალური პროდუქტები აქვთ შექმნილი.",
        "en": "Learn from engineers who have shipped real products.",
    },
    "tech_marquee": {
        "ka": "Python, FastAPI, Django, Flask, NumPy, pandas, PostgreSQL, Docker, "
        "Git, scikit-learn, pytest, SQLAlchemy, Linux, REST APIs",
        "en": "Python, FastAPI, Django, Flask, NumPy, pandas, PostgreSQL, Docker, "
        "Git, scikit-learn, pytest, SQLAlchemy, Linux, REST APIs",
    },
    "contact_title": {"ka": "დაგვიკავშირდი", "en": "Get in Touch"},
    "contact_email": {"ka": "hello@abuladze.academy", "en": "hello@abuladze.academy"},
    "contact_phone": {"ka": "+995 555 123 456", "en": "+995 555 123 456"},
    "contact_address": {"ka": "თბილისი, საქართველო", "en": "Tbilisi, Georgia"},
}

DEMO_COURSES = [
    dict(
        title="ვებ დეველოპმენტის კურსი",
        summary="ფულ-სტეკ ვებ დეველოპმენტი HTML-დან გამოქვეყნებამდე.",
        description="დაეუფლე HTML-ს, CSS-ს, JavaScript-ს, React-სა და Python ბექენდს. "
        "შექმენი და გამოაქვეყნე რეალური ფულ-სტეკ აპლიკაციები.",
        level="დამწყები", duration="16 კვირა", price=1200, icon="globe", order=1,
        aim="კურსის მიზანია მოამზადოს სრულფასოვანი ფულ-სტეკ დეველოპერები, რომლებიც "
        "შეძლებენ დამოუკიდებლად შექმნან და გამოაქვეყნონ ვებ-აპლიკაციები.",
        target_audience="კურსი განკუთვნილია სრულიად დამწყებებისთვის, ვისაც სურს IT "
        "სფეროში კარიერის დაწყება. წინასწარი ცოდნა პროგრამირებაში არ არის საჭირო.",
        prerequisites="კომპიუტერის ბაზისური მომხმარებლის უნარები. ინტერნეტი და "
        "სამუშაო კომპიუტერი.",
        what_you_learn=[
            "HTML5 და CSS3 — სტრუქტურა, სტილი, Flexbox, Grid",
            "JavaScript ES6+ — ლოგიკა, DOM, API-ები",
            "React — კომპონენტები, Hooks, სახელმწიფოს მართვა",
            "Python + FastAPI — ბექენდ სერვისების შექმნა",
            "PostgreSQL — მონაცემთა ბაზების დიზაინი",
            "Git და GitHub — ვერსიების კონტროლი",
            "Vercel / Railway — პროექტის გამოქვეყნება",
        ],
        schedule="კვირაში 3-ჯერ (ორშ, ოთხ, პარ) — 18:00–20:00",
        start_date="2026 წლის 15 სექტემბერი",
        language="ქართული",
        format="ჰიბრიდი",
        min_age=16,
        max_students=12,
        certificate=True,
    ),
    dict(
        title="Python და ბექენდ ინჟინერია",
        summary="მძლავრი API-ებისა და სერვისების აგება Python-ითა და FastAPI-ით.",
        description="ბაზები, REST API-ები, ავთენტიფიკაცია, ტესტირება და გამოქვეყნება "
        "თანამედროვე Python ხელსაწყოებით.",
        level="საშუალო", duration="12 კვირა", price=1100, icon="server", order=2,
        aim="გახდე პროფესიონალი Python ბექენდ-ინჟინერი, რომელსაც შეუძლია სკალირებადი "
        "REST API-ების, მონაცემთა ბაზების და მიკრო-სერვისების შექმნა.",
        target_audience="კურსი შესაფერისია მათთვის, ვისაც Python-ის ბაზისური ცოდნა "
        "უკვე აქვს ან ვებ-ტექნოლოგიებში პირველი ნაბიჯები გადადგა.",
        prerequisites="Python-ის საფუძვლები — ცვლადები, ფუნქციები, კლასები. "
        "HTML/HTTP-ის ზოგადი გაგება.",
        what_you_learn=[
            "FastAPI — თანამედროვე Python ვებ-ფრეიმვორკი",
            "SQLAlchemy 2.0 — ORM და მონაცემთა ბაზების მოდელირება",
            "PostgreSQL — ინდექსები, რელაციები, მიგრაციები",
            "JWT ავთენტიფიკაცია და უსაფრთხოება",
            "Pydantic — ვალიდაცია და სქემები",
            "pytest — ავტომატური ტესტირება",
            "Docker — კონტეინერიზაცია",
            "CI/CD პრინციპები",
        ],
        schedule="კვირაში 2-ჯერ (სამშ, შაბ) — 11:00–14:00",
        start_date="2026 წლის 1 ოქტომბერი",
        language="ქართული",
        format="ოფლაინ",
        min_age=18,
        max_students=10,
        certificate=True,
    ),
    dict(
        title="მონაცემთა მეცნიერება და ML საფუძვლები",
        summary="მონაცემთა დამუშავებიდან შენს პირველ მანქანური სწავლების მოდელამდე.",
        description="Python მონაცემებისთვის, pandas, ვიზუალიზაცია და მანქანური "
        "სწავლების შესავალი scikit-learn-ით.",
        level="საშუალო", duration="14 კვირა", price=1300, icon="chart", order=3,
        aim="კურსი გასწავლის მონაცემთა ანალიზის, ვიზუალიზაციისა და ML მოდელების "
        "შექმნის ყველა საფეხურს — რეალური ბიზნეს-ამოცანებზე.",
        target_audience="ანალიტიკოსები, ეკონომისტები, ბიოლოგები და ყველა, ვინც "
        "მუშაობს მონაცემებთან და სურს ისწავლოს მათი სრული ძალის გამოყენება.",
        prerequisites="Python-ის საფუძვლები. სტატისტიკის ელემენტარული ცოდნა "
        "(ალბათობა, შუალედური მნიშვნელობა, სტანდარტული გადახრა).",
        what_you_learn=[
            "NumPy — მატრიცები და მათემატიკური ოპერაციები",
            "pandas — მონაცემთა გაწმენდა და ტრანსფორმაცია",
            "Matplotlib / Seaborn — ვიზუალიზაცია",
            "scikit-learn — კლასიფიკაცია, რეგრესია, კლასტერიზაცია",
            "Feature Engineering — ნიშნების შექმნა და შერჩევა",
            "Jupyter Notebook — ინტერაქტიული ანალიზი",
            "ML pipeline — ავტომატიზაცია და Deploy",
        ],
        schedule="კვირაში 3-ჯერ (სამ, ხუთ, შაბ) — 10:00–12:30",
        start_date="2026 წლის 20 სექტემბერი",
        language="ქართული",
        format="ჰიბრიდი",
        min_age=17,
        max_students=8,
        certificate=True,
    ),
    dict(
        title="Python პროგრამირება — დამწყებთათვის",
        summary="Python-ის სწავლა ნულიდან — ლოგიკიდან რეალური პროგრამებამდე.",
        description="ეს კურსი შექმნილია სრულ დამწყებებისთვის. ნაბიჯ-ნაბიჯ ისწავლი "
        "Python-ის ყველა საფუძველს: ცვლადებიდან ობიექტზე ორიენტირებამდე.",
        level="დამწყები", duration="8 კვირა", price=600, icon="code", order=4,
        aim="პირველი ნაბიჯები IT-სამყაროში — Python-ის საფუძვლები, "
        "ლოგიკური აზროვნება და მინი-პროექტების შექმნა.",
        target_audience="სკოლის მოსწავლეები, სტუდენტები ან ნებისმიერი მსურველი, "
        "ვისაც არანაირი პროგრამირების გამოცდილება არ აქვს.",
        prerequisites="კომპიუტერის ჩართვა და გამოყენება. "
        "Python-ის ინსტალაცია კურსის დაწყებამდე (გაგვიადვილდება).",
        what_you_learn=[
            "Python დაყენება და გარემო (VS Code, Terminal)",
            "ცვლადები, ტიპები, ოპერატორები",
            "პირობები (if/elif/else) და ციკლები (for/while)",
            "ფუნქციები — დეფინიცია, პარამეტრები, return",
            "სიები, ლექსიკონები, მრავლობები",
            "ფაილებთან მუშაობა",
            "ობიექტზე ორიენტირებული პროგრამირების საფუძვლები",
            "2 მინი-პროექტი: კალკულატორი და To-Do App",
        ],
        schedule="კვირაში 4-ჯერ (ორშ–ხუთ) — 16:00–17:30",
        start_date="2026 წლის 1 სექტემბერი",
        language="ქართული",
        format="ოფლაინ",
        min_age=14,
        max_age=25,
        max_students=15,
        certificate=True,
    ),
]

DEMO_PROFESSORS = [
    dict(
        name="ნინო აბულაძე",
        title="დამფუძნებელი და მთავარი ლექტორი",
        bio="15+ წლის გამოცდილება პროგრამული უზრუნველყოფის შექმნასა და ახალგაზრდა "
        "ინჟინრების მომზადებაში.",
        biography="ნინო აბულაძე არის აბულაძის აკადემიის დამფუძნებელი. მას აქვს 15 "
        "წელზე მეტი გამოცდილება პროგრამული უზრუნველყოფის ინდუსტრიაში, სადაც მუშაობდა "
        "არქიტექტორად საერთაშორისო კომპანიებში. ის სპეციალიზდება სისტემების "
        "დიზაინსა და Python-ში და გატაცებულია ხარისხიანი განათლების ხელმისაწვდომობით.",
        specialties="არქიტექტურა, Python, მენტორობა",
        photo_url="",
        books=[
            "Clean Python: პრაქტიკული გზამკვლევი (2021)",
            "სისტემების დიზაინი დამწყებთათვის (2023)",
        ],
        links=[
            {"label": "LinkedIn", "url": "https://www.linkedin.com/"},
            {"label": "GitHub", "url": "https://github.com/"},
            {"label": "პირადი ვებგვერდი", "url": "https://example.com/"},
        ],
        order=1,
    ),
    dict(
        name="გიორგი მაისურაძე",
        title="სენიორ ფრონტენდ ინჟინერი",
        bio="ფრონტენდის სპეციალისტი, ფოკუსირებული React-სა და მომხმარებლის "
        "გამოცდილებაზე.",
        biography="გიორგი მაისურაძე არის სენიორ ფრონტენდ ინჟინერი, რომელსაც აქვს "
        "მდიდარი გამოცდილება მასშტაბური ვებ აპლიკაციების შექმნაში. ის ასწავლის "
        "თანამედროვე JavaScript-სა და React-ს და ეხმარება სტუდენტებს რეალური "
        "პროექტების პორტფოლიოს აგებაში.",
        specialties="React, TypeScript, UI/UX",
        photo_url="",
        books=["Modern React in Practice (2022)"],
        links=[
            {"label": "LinkedIn", "url": "https://www.linkedin.com/"},
            {"label": "GitHub", "url": "https://github.com/"},
        ],
        order=2,
    ),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Default admin
        if db.scalar(select(Admin).where(Admin.username == settings.admin_username)) is None:
            db.add(Admin(
                username=settings.admin_username,
                hashed_password=hash_password(settings.admin_password),
            ))
            print(f"[seed] Created admin '{settings.admin_username}'")

        # Content blocks (both locales)
        for key, values in CONTENT.items():
            for locale, value in values.items():
                if db.get(SiteContent, {"key": key, "locale": locale}) is None:
                    db.add(SiteContent(key=key, locale=locale, value=value))

        # Courses
        if db.scalar(select(Course)) is None:
            for data in DEMO_COURSES:
                db.add(Course(**data))
            print(f"[seed] Added {len(DEMO_COURSES)} demo courses")

        # Professors / lecturers
        if db.scalar(select(Professor)) is None:
            for data in DEMO_PROFESSORS:
                db.add(Professor(**data))
            print(f"[seed] Added {len(DEMO_PROFESSORS)} demo lecturers")

        # Email templates
        for data in DEFAULT_TEMPLATES:
            if db.scalar(select(EmailTemplate).where(EmailTemplate.key == data["key"])) is None:
                db.add(EmailTemplate(**data))

        db.commit()
        print("[seed] Done.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
