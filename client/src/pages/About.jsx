import Reveal from '../components/Reveal';
import { CheckCircle2 } from 'lucide-react';

const values = [
  { en: 'Patient-Centered Care', am: 'ለታካሚ ተኮር እንክብካቤ', desc: 'Every treatment plan is custom-built for your individual anatomy and recovery goals.' },
  { en: 'Modern System', am: 'ዘመናዊ አሰራር', desc: 'Equipped with modalities and techniques designed to speed up your recovery.' },
  { en: 'Evidence-Based Practice', am: 'በማስረጃ ላይ የተመሰረተ', desc: 'Our physiotherapists rely on proven clinical methods, not guesswork.' },
];

const About = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">About Us</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">Why Choose Unique Physiotherapy?</h1>
          <p className="amharic text-teal-light text-lg">ይኽክ ፊዚዮቴራፒን ይመርጣሉ?</p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-14 items-center mb-24">
          <Reveal>
            <div className="card overflow-hidden aspect-[4/3] flex items-center justify-center bg-surface2">
              <img
                src="/assets/clinic-reception.jpg"
                alt="Unique Physiotherapy Speciality Clinic reception desk"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-dim leading-relaxed mb-6">
              Unique Physiotherapy Speciality Clinic combines expert hands-on clinical knowledge with advanced
              therapeutic techniques to get you back to complete structural health. We opened our doors in Ayat,
              Addis Ababa with a simple mission: help every patient move without pain and live without limits.
            </p>
            <p className="text-dim leading-relaxed">
              From sports injuries to stroke rehabilitation, our experienced physiotherapists build personalized
              care plans around your individual body benchmarks — not a one-size-fits-all protocol.
            </p>
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
    </div>
  );
};

export default About;
