import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Send, Music2 } from 'lucide-react';
import Logo from './Logo';
import {
  CLINIC_PHONE_INTL, CLINIC_PHONE_TEL, CLINIC_EMAIL,
  CLINIC_ADDRESS_EN, CLINIC_HOURS_EN, CLINIC_SOCIAL,
} from '../utils/clinicInfo';

const socialIcons = [
  { Icon: Instagram, href: CLINIC_SOCIAL.instagram, label: 'Instagram' },
  { Icon: Facebook, href: CLINIC_SOCIAL.facebook, label: 'Facebook' },
  { Icon: Send, href: CLINIC_SOCIAL.telegram, label: 'Telegram' },
  { Icon: Music2, href: CLINIC_SOCIAL.tiktok, label: 'TikTok' },
];

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Logo size="md" showTagline />
          <div className="flex gap-3 mt-5">
            {socialIcons.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-dim hover:text-teal hover:border-teal/50 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display font-semibold text-ink mb-4">Get In Touch / በቀጥታ ያግኙን</p>
          <ul className="space-y-3 text-sm text-dim">
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <a href={CLINIC_PHONE_TEL} className="hover:text-teal transition-colors">{CLINIC_PHONE_INTL}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <a href={`mailto:${CLINIC_EMAIL}`} className="hover:text-teal transition-colors">{CLINIC_EMAIL}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <span>{CLINIC_ADDRESS_EN}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <span>{CLINIC_HOURS_EN}</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-ink mb-4">Quick Links / ፈጣን ማስፈንጠሪያዎች</p>
          <ul className="space-y-2.5 text-sm text-dim">
            <li><Link to="/services" className="hover:text-teal transition-colors">Services / አገልግሎቶቻችን</Link></li>
            <li><Link to="/about" className="hover:text-teal transition-colors">About Us / ስለ እኛ</Link></li>
            <li><Link to="/appointment" className="hover:text-teal transition-colors">Book Appointment / ቀጠሮ ይያዙ</Link></li>
            <li><Link to="/contact" className="hover:text-teal transition-colors">Contact / ያግኙን</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 text-center text-xs text-dim/70">
        © {new Date().getFullYear()} Unique Physiotherapy Speciality Clinic. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
