import { useState } from 'react';
import { CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Reveal from '../components/Reveal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidEthiopianPhone, normalizeEthiopianPhone } from '../utils/validation';

const getMinDateTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000); // at least 1hr from now
  return d.toISOString().slice(0, 16);
};

const AppointmentBooking = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: '',
    reasonNote: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!isValidEthiopianPhone(form.phone)) errs.phone = 'Enter a valid Ethiopian phone number';

    if (!form.date) {
      errs.date = 'Select a date and time';
    } else {
      const picked = new Date(form.date);
      if (picked.getTime() <= Date.now()) {
        errs.date = "Appointment time can't be in the past";
      } else if (picked.getDay() === 0) {
        errs.date = 'The clinic does not accept new bookings on Sunday. Please pick another day.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      await api.post('/appointments', {
        ...form,
        phone: normalizeEthiopianPhone(form.phone),
        date: new Date(form.date).toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors((prev) => ({ ...prev, ...data.errors }));
      else setServerError(data?.message || 'Could not book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-16">
        <div className="card p-10 max-w-md text-center">
          <CheckCircle2 size={48} className="text-teal mx-auto mb-5" />
          <h1 className="font-display font-bold text-2xl mb-2">Appointment Requested</h1>
          <p className="text-dim mb-1">We've received your request for</p>
          <p className="font-semibold text-ink mb-6">{new Date(form.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p className="text-dim text-sm">Our front desk will confirm via phone or email shortly. We'll also remind you before your visit.</p>
          <button onClick={() => { setSuccess(false); setForm((f) => ({ ...f, date: '', reasonNote: '' })); }} className="btn-primary mt-7">
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-5">
      <div className="max-w-xl mx-auto">
        <Reveal className="text-center mb-10">
          <CalendarCheck size={32} className="text-teal mx-auto mb-4" />
          <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">Book an Appointment</h1>
          <p className="amharic text-teal-light">ቀጠሮ ይያዙ</p>
          <p className="text-dim text-sm mt-3">The clinic is closed for new bookings on Sundays.</p>
        </Reveal>

        <Reveal delay={100} className="card p-8">
          {serverError && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} className={`input-field ${errors.fullName ? 'has-error' : ''}`} placeholder="Your full name" />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'has-error' : ''}`} placeholder="you@example.com" />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={`input-field ${errors.phone ? 'has-error' : ''}`} placeholder="0912345678" />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="date">Preferred Date & Time</label>
              <input
                id="date" name="date" type="datetime-local" value={form.date} onChange={handleChange}
                min={getMinDateTime()}
                className={`input-field ${errors.date ? 'has-error' : ''}`}
              />
              {errors.date && <p className="field-error">{errors.date}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reasonNote">Reason for Visit (optional)</label>
              <textarea
                id="reasonNote" name="reasonNote" rows={3} value={form.reasonNote} onChange={handleChange}
                className="input-field resize-none" placeholder="e.g. Lower back pain for 2 weeks"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 disabled:opacity-60">
              {submitting ? 'Booking…' : 'Book Appointment'}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
};

export default AppointmentBooking;
