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
  Zap
} from "lucide-react";
import RecoveryTrace from "../components/RecoveryTrace";
import Reveal from "../components/Reveal";
import { CLINIC_PHONE_TEL, CLINIC_PHONE_DISPLAY } from "../utils/clinicInfo";

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

const whyChooseUs = [
  { en: "Experienced Physiotherapists", am: "ልምድ ያላቸው ፊዚዮቴራፒስቶች" },
  { en: "Personalized Care Plans", am: "ግላዊ የህክምና እቅድ" },
  { en: "Modern Techniques & Equipment", am: "ዘመናዊ መሳሪያዎች" },
  { en: "Convenient Location & Flexible Hours", am: "ምቹ ቦታ እና ሰዓት" }
];

const Home = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
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
              you love. Expert care, stroke rehabilitation, personalized
              recovery.
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

      {/* WHAT WE TREAT */}
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

      {/* WHY CHOOSE US */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
              Why Choose Unique Physiotherapy?
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              ለምን ዩኒክ ፊዚዮቴራፒን ይመርጣሉ?
            </h2>
            <p className="text-dim mb-8 max-w-lg">
              We combine expert hands-on clinical knowledge with advanced
              therapeutic techniques to get you back to complete structural
              health.
            </p>
            <ul className="space-y-4">
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

          <Reveal delay={150}>
            <div className="card p-8 lg:p-10 bg-gradient-to-br from-teal-deep/20 to-surface">
              <p className="font-display font-extrabold text-6xl text-teal">
                100%
              </p>
              <p className="font-semibold text-lg mt-2">
                Patient-Centered Focus
              </p>
              <p className="amharic text-dim text-sm mb-6">
                ትኩረታችን በሕመምተኞች ላይ ነው
              </p>
              <p className="text-dim text-sm leading-relaxed">
                Every single manual therapy evaluation and physical exercise
                routine is built around your individual body benchmarks and
                long-term comfort.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                <div>
                  <p className="font-display font-bold text-2xl text-ink">
                    2AM–1AM Local Time
                  </p>
                  <p className="text-dim text-xs mt-1">Daily, Mon–Sun (EAT)</p>
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-ink">
                    Evidence-based
                  </p>
                  <p className="text-dim text-xs mt-1">Rehabilitation plans</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="card p-10 lg:p-16 text-center bg-gradient-to-br from-teal-deep/30 via-surface to-surface relative overflow-hidden">
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4 relative">
                Ready to start your recovery?
              </h2>
              <p className="amharic text-teal-light mb-2 relative">
                ህመምዎን ይገላገሉ!
              </p>
              <p className="text-dim mb-8 max-w-md mx-auto relative">
                Book your appointment today and take the first step toward
                moving freely again.
              </p>
              <div className="flex flex-wrap gap-4 justify-center relative">
                <Link to="/appointment" className="btn-primary">
                  Book Appointment <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn-secondary">
                  View Services
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Home;
