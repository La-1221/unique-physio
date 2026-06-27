import { Link } from "react-router-dom";
import {
  ArrowRight,
  Phone,
  CheckCircle2,
  Activity,
  Brain,
  Bone,
  HeartPulse,
  Footprints,
  Sparkles,
  Baby,
  Zap,
  MapPin,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Send,
  Music2,
  MessageCircle
} from "lucide-react";
import RecoveryTrace from "../components/RecoveryTrace";
import Reveal from "../components/Reveal";
import {
  CLINIC_PHONE_TEL,
  CLINIC_PHONE_DISPLAY,
  CLINIC_PHONE_INTL,
  CLINIC_EMAIL,
  CLINIC_ADDRESS_EN,
  CLINIC_ADDRESS_AM,
  CLINIC_HOURS_EN,
  CLINIC_HOURS_AM,
  CLINIC_SOCIAL,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_LINK
} from "../utils/clinicInfo";

const treatments = [
  { icon: Bone, en: "Neck & Shoulder Pain", am: "የአንገትና ትከሻ ህመም" },
  { icon: Activity, en: "Low Back Pain & Disc Herniation", am: "የወገብ ህመም" },
  { icon: Brain, en: "Paralysis & Stroke Rehabilitation", am: "ስትሮክ ህክምና" },
  {
    icon: Bone,
    en: "Hip, Pelvic, Knee & Ankle Pain",
    am: "የጭን፣ ጉልበትና ቁርጭምጭሚት ህመም"
  },
  { icon: HeartPulse, en: "Sports Injuries", am: "የስፖርት ጉዳት" },
  { icon: Sparkles, en: "Post-surgical Rehab", am: "ድህረ-ቀዶ ጥገና ህክምና" },
  { icon: Zap, en: "Frozen Shoulder & Elbow Pain", am: "የቀዘቀዘ ትከሻ" },
  { icon: Activity, en: "Sacroiliac Joint Dysfunction", am: "የዳሌ መገጣጠሚያ ችግር" },
  { icon: Baby, en: "Pediatric Physiotherapy", am: "የህጻናት ፊዚዮቴራፒ" },
  {
    icon: Footprints,
    en: "Gait & Biomechanical Problems",
    am: "የእግር አካሄድ ችግር"
  },
  { icon: Brain, en: "Facial & Bell's Palsy", am: "የፊት ሽባነት" },
  { icon: HeartPulse, en: "Cupping & Dry Needling Therapy", am: "ኩባያ ህክምና" }
];

const specialities = [
  {
    icon: Bone,
    en: "Orthopedic Rehab",
    am: "የአጥንት ህክምና",
    desc: "Recovery from bone, joint, and muscle injuries to restore full body mobility, for post-surgery, fractures, and sprains."
  },
  {
    icon: Activity,
    en: "Spine & Back Care",
    am: "የአከርካሪ እና ጀርባ ህክምና",
    desc: "Specialized targeted therapies to relieve chronic lower back pain, sciatica, and neck pain to improve posture and comfort."
  },
  {
    icon: Footprints,
    en: "Sports Therapy",
    am: "የስፖርት ጉዳት ህክምና",
    desc: "Advanced conditioning and targeted injury rehabilitation designed tailored specifically for professional or casual athletes."
  },
  {
    icon: Brain,
    en: "Neurological Rehab",
    am: "የነርቭ ስርዓት ህክምና",
    desc: "Focused neuromuscular retraining to improve balance, coordination, and independent movement after stroke or nerve conditions."
  },
  {
    icon: HeartPulse,
    en: "Cupping & Dry Needling",
    am: "ኩባያ እና መርፌ ህክምና",
    desc: "Traditional and modern modalities used to relieve muscle tension, improve circulation, and accelerate pain relief."
  },
  {
    icon: Sparkles,
    en: "Pediatric Physiotherapy",
    am: "የህጻናት ፊዚዮቴራፒ",
    desc: "Gentle, developmentally-appropriate therapy for children with movement, posture, or coordination challenges."
  }
];

const values = [
  {
    en: "Patient-Centered Care",
    am: "ለታካሚ ተኮር እንክብካቤ",
    desc: "Every treatment plan is custom-built for your individual anatomy and recovery goals."
  },
  {
    en: "Modern System",
    am: "ዘመናዊ አሰራር",
    desc: "Equipped with modalities and techniques designed to speed up your recovery."
  },
  {
    en: "Evidence-Based Practice",
    am: "በማስረጃ ላይ የተመሰረተ",
    desc: "Our physiotherapists rely on proven clinical methods, not guesswork."
  }
];

const whyChooseUs = [
  { en: "Experienced Physiotherapists", am: "ልምድ ያላቸው ፊዚዮቴራፒስቶች" },
  { en: "Personalized Care Plans", am: "ግላዊ የህክምና እቅድ" },
  { en: "Modern Techniques & Equipment", am: "ዘመናዊ መሳሪያዎች" },
  { en: "Convenient Location & Flexible Hours", am: "ምቹ ቦታ እና ሰዓት" }
];

const socials = [
  {
    Icon: Instagram,
    href: CLINIC_SOCIAL.instagram,
    label: "Instagram",
    color: "hover:bg-pink-500/20 hover:border-pink-400/40 hover:text-pink-300"
  },
  {
    Icon: Facebook,
    href: CLINIC_SOCIAL.facebook,
    label: "Facebook",
    color: "hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-300"
  },
  {
    Icon: Send,
    href: CLINIC_SOCIAL.telegram,
    label: "Telegram",
    color: "hover:bg-sky-500/20 hover:border-sky-400/40 hover:text-sky-300"
  },
  {
    Icon: Music2,
    href: CLINIC_SOCIAL.tiktok,
    label: "TikTok",
    color:
      "hover:bg-fuchsia-500/20 hover:border-fuchsia-400/40 hover:text-fuchsia-300"
  },
  {
    Icon: MessageCircle,
    href: CLINIC_SOCIAL.whatsapp,
    label: "WhatsApp",
    color:
      "hover:bg-green-500/20 hover:border-green-400/40 hover:text-green-300"
  }
];

const Home = () => {
  return (
    <>
      {/* ── HERO ── */}
      <section
        id="home"
        className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-deep/10 via-bg to-bg pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5 mb-6 animate-floatUp">
              Now Open in Ayat, Addis Ababa
            </span>
            <h1
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-balance animate-floatUp"
              style={{ animationDelay: "80ms" }}
            >
              Move Without Pain.
              <br />
              <span className="text-teal">Live Without Limits.</span>
            </h1>
            <p
              className="amharic text-xl sm:text-2xl font-semibold text-teal-light mt-4 animate-floatUp"
              style={{ animationDelay: "140ms" }}
            >
              ያለ ህመም ይንቀሳቀሱ። ያለ ገደብ ይኑሩ።
            </p>
            <p
              className="text-dim text-base sm:text-lg mt-6 max-w-xl animate-floatUp"
              style={{ animationDelay: "200ms" }}
            >
              We provide advanced, personalized physical therapy to help you
              recover faster, regain your strength, and get back to doing what
              you love.
            </p>
            <div
              className="flex flex-wrap gap-4 mt-9 animate-floatUp"
              style={{ animationDelay: "260ms" }}
            >
              <Link to="/appointment" className="btn-primary">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <a href={CLINIC_PHONE_TEL} className="btn-secondary">
                <Phone size={18} /> Call {CLINIC_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-16 lg:mt-20">
          <RecoveryTrace className="w-full h-24 lg:h-32" />
          <div className="flex justify-between text-[11px] sm:text-xs text-dim uppercase tracking-wider -mt-2">
            <span>Pain &amp; restriction</span>
            <span className="text-teal font-semibold">Full recovery</span>
          </div>
        </div>
      </section>

      {/* ── WHAT WE TREAT ── */}
      <section className="py-20 lg:py-28 bg-surface/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
              What We Treat
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              Conditions we treat / የምናክማቸው ችግሮች
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {treatments.map((t, i) => (
              <Reveal key={t.en} delay={i * 40}>
                <div className="card p-5 h-full hover:border-teal/40 hover:-translate-y-1 transition-all duration-300 group">
                  <t.icon
                    size={24}
                    className="text-teal mb-3 group-hover:scale-110 transition-transform"
                  />
                  <p className="font-medium text-sm text-ink leading-snug">
                    {t.en}
                  </p>
                  <p className="amharic text-xs text-dim mt-1">{t.am}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
              Our Core Specialities
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
              ዋና ዋና አገልግሎቶቻችን
            </h2>
            <p className="text-dim">
              Expert, evidence-based rehabilitation plans uniquely built around
              your recovery goals.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialities.map((s, i) => (
              <Reveal key={s.en} delay={i * 60}>
                <div className="card p-7 h-full hover:border-teal/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-5">
                    <s.icon size={22} className="text-teal" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{s.en}</h3>
                  <p className="amharic text-teal-light text-sm mb-3">{s.am}</p>
                  <p className="text-dim text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Pricing */}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-20 lg:py-28 bg-surface/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
              About Us
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
              Why Choose Unique Physiotherapy?
            </h2>
            <p className="amharic text-teal-light text-lg">
              ለምን ዩኒክ ፊዚዮቴራፒን ይመርጣሉ?
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
            <Reveal>
              <div className="card overflow-hidden aspect-[4/3] flex items-center justify-center bg-surface2">
                <img
                  src="/assets/clinic-reception.jpg"
                  alt="Unique Physiotherapy Speciality Clinic reception"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim leading-relaxed mb-6">
                Unique Physiotherapy Speciality Clinic combines expert hands-on
                clinical knowledge with advanced therapeutic techniques to get
                you back to complete structural health. We opened our doors in
                Ayat, Addis Ababa with a simple mission: help every patient move
                without pain and live without limits.
              </p>
              <ul className="space-y-4 mt-6">
                {whyChooseUs.map((item) => (
                  <li key={item.en} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-teal flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-ink">{item.en}</p>
                      <p className="amharic text-sm text-dim">{item.am}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.en} delay={i * 80}>
                <div className="card p-7 h-full">
                  <CheckCircle2 size={24} className="text-teal mb-4" />
                  <h3 className="font-display font-semibold text-lg">{v.en}</h3>
                  <p className="amharic text-teal-light text-sm mb-3">{v.am}</p>
                  <p className="text-dim text-sm leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="card p-10 lg:p-16 text-center bg-gradient-to-br from-teal-deep/30 via-surface to-surface relative overflow-hidden">
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
                Ready to start your recovery?
              </h2>
              <p className="amharic text-teal-light mb-2">ህመምዎን ይገላገሉ!</p>
              <p className="text-dim mb-8 max-w-md mx-auto">
                Book your appointment today and take the first step toward
                moving freely again.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/appointment" className="btn-primary">
                  Book Appointment <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 lg:py-28 bg-surface/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
              Get In Touch
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
              Contact Us
            </h2>
            <p className="amharic text-teal-light text-lg">በቀጥታ ያግኙን</p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10">
            <Reveal className="space-y-5">
              <a
                href={CLINIC_PHONE_TEL}
                className="card p-6 flex items-start gap-4 hover:border-teal/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                  <Phone size={20} className="text-teal" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Call Us / ለልክ ቀጥር
                  </p>
                  <p className="font-display font-semibold text-lg">
                    {CLINIC_PHONE_INTL}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${CLINIC_EMAIL}`}
                className="card p-6 flex items-start gap-4 hover:border-teal/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                  <Mail size={20} className="text-teal" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Email Us
                  </p>
                  <p className="font-display font-semibold text-lg">
                    {CLINIC_EMAIL}
                  </p>
                </div>
              </a>

              <div className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-teal" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Location / እድራሻ
                  </p>
                  <p className="font-display font-semibold text-base mb-1">
                    Addis Ababa, Ethiopia
                  </p>
                  <p className="text-dim text-sm">{CLINIC_ADDRESS_EN}</p>
                  <p className="amharic text-dim text-sm mt-1">
                    {CLINIC_ADDRESS_AM}
                  </p>
                  <a
                    href={GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal text-sm font-medium mt-3 inline-block hover:text-teal-light"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              <div className="card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-teal" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Working Hours / የስራ ሰዓት
                  </p>
                  <p className="text-dim text-sm">{CLINIC_HOURS_EN}</p>
                  <p className="amharic text-dim text-sm mt-1">
                    {CLINIC_HOURS_AM}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {socials.map(({ Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-dim transition-all ${color}`}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="card overflow-hidden h-full min-h-[480px]">
                <iframe
                  title="Clinic location"
                  src={GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 480 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
