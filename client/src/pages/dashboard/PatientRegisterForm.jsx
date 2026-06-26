import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import api from '../../utils/api';
import { isValidEthiopianPhone, normalizeEthiopianPhone, formatETB } from '../../utils/validation';

const SERVICE_PRICES = { evaluation: 1700, treatment: 1500, dry_needling: 500, cupping: 1200 };
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe', label: 'CBE' },
  { value: 'other', label: 'Other' },
];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily (skips Sunday)' },
  { value: 'every_other_day', label: 'Every Other Day (Mon/Wed/Fri)' },
  { value: 'weekly', label: 'Weekly (same weekday)' },
];

const initialForm = {
  fullName: '', startDay: new Date().toISOString().slice(0, 10),
  phone: '', sex: '', age: '', physiotherapist: '', diagnosis: '',
  sessions: 10, address: '', branch: '', frequency: 'daily',
  payFor: ['evaluation'],
  paidAllSessions: false,
  paymentMethod: '',
};

const PatientRegisterForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    // Auto-advance Sunday to Monday on start day picker
    if (name === 'startDay' && value) {
      const picked = new Date(value);
      if (picked.getDay() === 0) {
        picked.setDate(picked.getDate() + 1);
        finalValue = picked.toISOString().slice(0, 10);
      }
    }
    setForm((f) => ({ ...f, [name]: finalValue }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
    setServerError('');
  };

  const handleServiceToggle = (serviceId) => {
    if (serviceId === 'evaluation') return; // evaluation is locked
    setForm((f) => {
      const newPayFor = f.payFor.includes(serviceId)
        ? f.payFor.filter((s) => s !== serviceId)
        : [...f.payFor, serviceId];
      return { ...f, payFor: newPayFor };
    });
    setErrors((errs) => ({ ...errs, payFor: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!isValidEthiopianPhone(form.phone)) errs.phone = 'Enter a valid Ethiopian phone number';
    if (!form.sex) errs.sex = 'Select sex';
    if (!form.age || form.age < 0 || form.age > 120) errs.age = 'Enter a valid age';
    if (!form.physiotherapist.trim()) errs.physiotherapist = 'Assigned physiotherapist is required';
    if (!form.diagnosis.trim()) errs.diagnosis = 'Diagnosis is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.sessions || form.sessions < 1) errs.sessions = 'Sessions must be at least 1';
    if (!form.payFor.includes('evaluation')) errs.payFor = 'Evaluation is required on registration day';
    if (!form.paymentMethod) errs.paymentMethod = 'Select a payment method';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      const { data } = await api.post('/patients', {
        ...form,
        phone: normalizeEthiopianPhone(form.phone),
        age: Number(form.age),
        sessions: Number(form.sessions),
        paidAllSessions: form.paidAllSessions,
        perSessionService: 'treatment',
      });
      setSuccess(data.patient);
      setForm(initialForm);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors((prev) => ({ ...prev, ...data.errors }));
      else setServerError(data?.message || 'Could not register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived payment values — perSessionService is always 'treatment'
  const regAmount = form.payFor.reduce((s, id) => s + (SERVICE_PRICES[id] || 0), 0);
  const perSessionPrice = SERVICE_PRICES['treatment'];
  const remainingSessions = Math.max(0, Number(form.sessions) - 1);
  const totalAmount = form.paidAllSessions
    ? regAmount + perSessionPrice * remainingSessions
    : regAmount;

  if (success) {
    return (
      <div className="max-w-xl mx-auto card p-10 text-center">
        <CheckCircle2 size={48} className="text-teal mx-auto mb-5" />
        <h1 className="font-display font-bold text-2xl mb-2">Patient Registered</h1>
        <p className="text-dim mb-1">Card Number</p>
        <p className="font-display font-bold text-3xl text-teal mb-6">{success.cardNo}</p>
        <p className="text-dim text-sm mb-8">
          {success.totalSessions} sessions scheduled starting {new Date(success.startDay).toLocaleDateString()}.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setSuccess(null)} className="btn-primary">Register Another</button>
          <button onClick={() => navigate(`/dashboard/patients/${success._id}`)} className="btn-secondary">View Patient</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-1">Register New Patient</h1>
      <p className="text-dim text-sm mb-7">Card number is generated automatically (UNPT0001, UNPT0002, …)</p>

      {serverError && (
        <div className="flex items-start gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-4 py-3 mb-5">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        {/* Patient Details */}
        <section className="card p-6">
          <p className="font-semibold mb-5">Patient Details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} className={`input-field ${errors.fullName ? 'has-error' : ''}`} placeholder="Patient's full name" />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>
            <div>
              <label className="label">Start Day</label>
              <input name="startDay" type="date" value={form.startDay} onChange={handleChange} className={`input-field ${errors.startDay ? 'has-error' : ''}`} />
              {errors.startDay && <p className="field-error">{errors.startDay}</p>}
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={`input-field ${errors.phone ? 'has-error' : ''}`} placeholder="0912345678" />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Sex</label>
              <select name="sex" value={form.sex} onChange={handleChange} className={`input-field ${errors.sex ? 'has-error' : ''}`}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.sex && <p className="field-error">{errors.sex}</p>}
            </div>
            <div>
              <label className="label">Age</label>
              <input name="age" type="number" min="0" max="120" value={form.age} onChange={handleChange} className={`input-field ${errors.age ? 'has-error' : ''}`} />
              {errors.age && <p className="field-error">{errors.age}</p>}
            </div>
            <div>
              <label className="label">Physiotherapist</label>
              <input name="physiotherapist" value={form.physiotherapist} onChange={handleChange} className={`input-field ${errors.physiotherapist ? 'has-error' : ''}`} placeholder="Dr. Hanna Tesfaye" />
              {errors.physiotherapist && <p className="field-error">{errors.physiotherapist}</p>}
            </div>
            <div>
              <label className="label">Branch (optional)</label>
              <input name="branch" value={form.branch} onChange={handleChange} className="input-field" placeholder="Ayat Main Branch" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Diagnosis</label>
              <input name="diagnosis" value={form.diagnosis} onChange={handleChange} className={`input-field ${errors.diagnosis ? 'has-error' : ''}`} placeholder="e.g. Low back pain & disc herniation" />
              {errors.diagnosis && <p className="field-error">{errors.diagnosis}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className={`input-field ${errors.address ? 'has-error' : ''}`} placeholder="e.g. Bole, Addis Ababa" />
              {errors.address && <p className="field-error">{errors.address}</p>}
            </div>
          </div>
        </section>

        {/* Package & Scheduling */}
        <section className="card p-6">
          <p className="font-semibold mb-5">Package & Scheduling</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Sessions</label>
              <input name="sessions" type="number" min="1" value={form.sessions} onChange={handleChange} className={`input-field ${errors.sessions ? 'has-error' : ''}`} />
              {errors.sessions && <p className="field-error">{errors.sessions}</p>}
            </div>
            <div>
              <label className="label">Frequency</label>
              <select name="frequency" value={form.frequency} onChange={handleChange} className="input-field">
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="card p-6">
          <p className="font-semibold mb-5">Payment</p>
          <div className="space-y-5">

            {/* Registration day services */}
            <div>
              <label className="label mb-2 block">Registration Day — Services</label>
              <p className="text-xs text-dim mb-3">Evaluation is always required. Add Dry Needling or Cupping if performed.</p>
              <div className="space-y-2">
                {/* Evaluation — locked */}
                <label className="flex items-center gap-3 p-3 border border-teal rounded-lg bg-teal/10 cursor-not-allowed opacity-80">
                  <input type="checkbox" checked readOnly disabled className="w-4 h-4 rounded text-teal bg-transparent border-white/30" />
                  <span className="flex-1 text-sm">Evaluation</span>
                  <span className="text-xs text-teal font-medium">Required</span>
                </label>
                {/* Dry Needling — optional add-on */}
                {[{ id: 'dry_needling', label: 'Dry Needling' }, { id: 'cupping', label: 'Cupping' }].map((s) => (
                  <label key={s.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.payFor.includes(s.id) ? 'border-teal bg-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={form.payFor.includes(s.id)}
                      onChange={() => handleServiceToggle(s.id)}
                      className="w-4 h-4 rounded text-teal bg-transparent border-white/30 focus:ring-teal"
                    />
                    <span className="flex-1 text-sm">{s.label}</span>
                    <span className="text-xs text-dim">Optional</span>
                  </label>
                ))}
              </div>
              {errors.payFor && <p className="field-error">{errors.payFor}</p>}
            </div>

            {/* Pay all sessions upfront toggle */}
            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.paidAllSessions ? 'border-teal bg-teal/10' : 'border-white/10 hover:bg-white/5'}`}>
              <input
                type="checkbox"
                checked={form.paidAllSessions}
                onChange={(e) => setForm((f) => ({ ...f, paidAllSessions: e.target.checked }))}
                className="w-4 h-4 rounded text-teal bg-transparent border-white/30 focus:ring-teal"
              />
              <div>
                <p className="text-sm font-semibold">Pay all {form.sessions || ''} sessions upfront</p>
                <p className="text-xs text-dim mt-0.5">
                  Registration ({formatETB(regAmount)}) + {remainingSessions} sessions × {formatETB(perSessionPrice)} = {formatETB(totalAmount)}
                </p>
              </div>
            </label>

            {/* Amount summary */}
            <div className="p-4 bg-teal/10 border border-teal/30 rounded-xl flex justify-between items-center">
              <span className="text-sm font-semibold">Amount to collect now</span>
              <span className="text-2xl font-bold text-teal">{formatETB(totalAmount)}</span>
            </div>

            {/* Payment Method */}
            <div>
              <label className="label mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.value} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors ${form.paymentMethod === m.value ? 'border-teal bg-teal/10 text-teal' : 'border-white/10 text-dim hover:border-white/25'}`}>
                    <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="field-error">{errors.paymentMethod}</p>}
            </div>
          </div>
        </section>

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          <Save size={18} /> {submitting ? 'Registering…' : 'Register Patient & Generate Schedule'}
        </button>
      </form>
    </div>
  );
};

export default PatientRegisterForm;
