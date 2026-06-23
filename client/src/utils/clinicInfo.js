// Sourced directly from the clinic's flyer, social ad templates, and
// website screenshots provided. Update here to change everywhere.

export const CLINIC_NAME = 'Unique Physiotherapy Speciality Clinic';
export const CLINIC_TAGLINE = 'Restoring Movement, Restoring Life';
export const CLINIC_TAGLINE_AM = 'ህመምን ይገላገሉ';

export const CLINIC_PHONE_DISPLAY = '0907 797 971';
export const CLINIC_PHONE_INTL = '+251 907 797 971';
export const CLINIC_PHONE_TEL = 'tel:+251907797971';

export const CLINIC_ADDRESS_EN =
  'Ayat Square, on the road to Goro, near Lemikukura Sub-City Office, in front of All-Mart Supermarket, opposite side of the road, Addis Ababa, Ethiopia';
export const CLINIC_ADDRESS_AM = 'አያት ወደ ጎሮ በሚወስደው መንገድ ላይ፣ ከለሚኩራ ክፍለ ከተማ ጽ/ቤት አጠገብ፣ ከኦል ማርት ሱፐርማርኬት ፊት ለፊት';

export const CLINIC_HOURS_EN = 'Open 2:00 AM – 1:00 AM (Ethiopian time), Monday – Sunday';
export const CLINIC_HOURS_AM = 'ከሌሊቱ 2:00 ሰዓት እስከ ሌሊቱ 1:00 ሰዓት ድረስ ክፍት ነው፣ ከሰኞ እስከ እሁድ';

export const CLINIC_EMAIL = 'info@uniquephysiotherapy.com';

export const CLINIC_SOCIAL = {
  instagram: 'https://instagram.com/uniquephysiotherapy',
  facebook: 'https://facebook.com/uniquephysiotherapy',
  telegram: 'https://t.me/uniquephysiotherapy',
  tiktok: 'https://vt.tiktok.com/ZSQThwu2U/',
  whatsapp: 'https://wa.me/251907797971',
};

export const GOOGLE_MAPS_QUERY = encodeURIComponent(
  'Unique Physiotherapy Speciality Clinic, Ayat, Addis Ababa, Ethiopia'
);
export const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`;
export const GOOGLE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${GOOGLE_MAPS_QUERY}`;

// Approximate coordinates for Ayat Square area, Addis Ababa (used for the map pin
// fallback). Adjust to the exact pin once you've placed the clinic on Google Maps.
export const CLINIC_LAT = 9.0192;
export const CLINIC_LNG = 38.8475;
