import {
  Bone,
  HeartPulse,
  Activity,
  Brain,
  Sparkles,
  Footprints
} from "lucide-react";
import Reveal from "../components/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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

const Services = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">
            Our Core Specialities
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            ዋና ዋና አገልግሎቶቻችን
          </h1>
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
        <Reveal className="mt-20" delay={100}>
          <div className="card p-8 lg:p-12">
            <h2 className="font-display font-bold text-2xl mb-2 text-center">
              Service Pricing / የክፍያ ዋጋ
            </h2>
            <p className="text-dim text-sm text-center mb-10">
              Transparent, fixed pricing per visit type
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { en: "Evaluation", am: "ምርመራ", price: "1,700" },
                { en: "Treatment Session", am: "ህክምና", price: "1,500" },
                { en: "Cupping Therapy", am: "ኩባያ ህክምና", price: "1,200" }
              ].map((p) => (
                <div
                  key={p.en}
                  className="text-center bg-surface2 rounded-xl p-6 border border-white/5"
                >
                  <p className="font-medium text-ink">{p.en}</p>
                  <p className="amharic text-dim text-xs mb-3">{p.am}</p>
                  <p className="font-display font-bold text-3xl text-teal">
                    {p.price}{" "}
                    <span className="text-base text-dim font-normal">ETB</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="text-center mt-14" delay={150}>
          <Link to="/appointment" className="btn-primary">
            Book Your Appointment <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default Services;
