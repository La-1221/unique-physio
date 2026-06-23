import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Send, Music2, MessageCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import {
  CLINIC_PHONE_INTL, CLINIC_PHONE_TEL, CLINIC_EMAIL,
  CLINIC_ADDRESS_EN, CLINIC_ADDRESS_AM, CLINIC_HOURS_EN, CLINIC_HOURS_AM,
  CLINIC_SOCIAL, GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_LINK,
} from '../utils/clinicInfo';

const socials = [
  { Icon: Instagram, href: CLINIC_SOCIAL.instagram, label: 'Instagram', color: 'hover:bg-pink-500/20 hover:border-pink-400/40 hover:text-pink-300' },
  { Icon: Facebook, href: CLINIC_SOCIAL.facebook, label: 'Facebook', color: 'hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-300' },
  { Icon: Send, href: CLINIC_SOCIAL.telegram, label: 'Telegram', color: 'hover:bg-sky-500/20 hover:border-sky-400/40 hover:text-sky-300' },
  { Icon: Music2, href: CLINIC_SOCIAL.tiktok, label: 'TikTok', color: 'hover:bg-fuchsia-500/20 hover:border-fuchsia-400/40 hover:text-fuchsia-300' },
  { Icon: MessageCircle, href: CLINIC_SOCIAL.whatsapp, label: 'WhatsApp', color: 'hover:bg-green-500/20 hover:border-green-400/40 hover:text-green-300' },
];

const Contact = () => {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-teal text-sm font-semibold tracking-widest uppercase mb-3">Get In Touch Directly</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">Contact Us</h1>
          <p className="amharic text-teal-light text-lg">በቀጥታ ያግኙን</p>
          <p className="text-dim mt-4">Reach out directly via phone or locate our facility in Addis Ababa below.</p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10">
          <Reveal className="space-y-5">
            <a href={CLINIC_PHONE_TEL} className="card p-6 flex items-start gap-4 hover:border-teal/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                <Phone size={20} className="text-teal" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim mb-1">Call Us Directly / ለልክ ቀጥር</p>
                <p className="font-display font-semibold text-lg">{CLINIC_PHONE_INTL}</p>
              </div>
            </a>

            <a href={`mailto:${CLINIC_EMAIL}`} className="card p-6 flex items-start gap-4 hover:border-teal/40 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                <Mail size={20} className="text-teal" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim mb-1">Email Us</p>
                <p className="font-display font-semibold text-lg">{CLINIC_EMAIL}</p>
              </div>
            </a>

            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-teal" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim mb-1">Our Clinic Location / እድራሻችን</p>
                <p className="font-display font-semibold text-base mb-1">Addis Ababa, Ethiopia (አዲስ አበባ)</p>
                <p className="text-dim text-sm">{CLINIC_ADDRESS_EN}</p>
                <p className="amharic text-dim text-sm mt-1">{CLINIC_ADDRESS_AM}</p>
                <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer" className="text-teal text-sm font-medium mt-3 inline-block hover:text-teal-light">
                  Open in Google Maps / ካርታ ክፈት →
                </a>
              </div>
            </div>

            <div className="card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-teal" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim mb-1">Working Hours / የስራ ሰዓት</p>
                <p className="text-dim text-sm">{CLINIC_HOURS_EN}</p>
                <p className="amharic text-dim text-sm mt-1">{CLINIC_HOURS_AM}</p>
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
                title="Unique Physiotherapy Speciality Clinic location"
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
    </div>
  );
};

export default Contact;
