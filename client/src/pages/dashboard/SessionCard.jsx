import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, CheckCircle2, XCircle } from "lucide-react";
import api from "../../utils/api";
import { formatETB } from "../../utils/validation";

const SERVICE_PRICES = { evaluation: 1700, treatment: 1500, dry_needling: 500, cupping: 1200 };
const SERVICE_LABELS = { evaluation: "Evaluation", treatment: "Treatment", dry_needling: "Dry Needling", cupping: "Cupping" };
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "telebirr", label: "Telebirr" },
  { value: "cbe", label: "CBE" },
  { value: "other", label: "Other" },
];

// Inline pay modal shown per session row
const PayModal = ({ session, defaultPaymentMethod, onSuccess, onCancel }) => {
  const [addDryNeedling, setAddDryNeedling] = useState(false);
  const [addCupping, setAddCupping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const services = ["treatment", ...(addDryNeedling ? ["dry_needling"] : []), ...(addCupping ? ["cupping"] : [])];
  const total = services.reduce((s, id) => s + (SERVICE_PRICES[id] || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) { setError("Select a payment method"); return; }
    setLoading(true);
    setError("");
    try {
      await api.post(`/sessions/${session._id}/check-in`, { services, paymentMethod });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:hidden">
      <form onSubmit={handleSubmit} className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
        <p className="font-semibold">Record Payment — Session {session.sessionIndex}</p>

        {/* Treatment — locked/mandatory */}
        <div className="flex items-center gap-2.5 p-3 border border-teal rounded-lg bg-teal/10 opacity-80 cursor-not-allowed">
          <input type="checkbox" checked readOnly disabled className="w-4 h-4 rounded" />
          <span className="text-sm flex-1">Treatment</span>
          <span className="text-xs text-teal">Required</span>
        </div>

        {/* Dry Needling — optional */}
        <label className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors ${addDryNeedling ? "border-teal bg-teal/10" : "border-white/10 hover:bg-white/5"}`}>
          <input type="checkbox" checked={addDryNeedling} onChange={(e) => setAddDryNeedling(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm">+ Dry Needling</span>
        </label>

        {/* Cupping — optional */}
        <label className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors ${addCupping ? "border-teal bg-teal/10" : "border-white/10 hover:bg-white/5"}`}>
          <input type="checkbox" checked={addCupping} onChange={(e) => setAddCupping(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm">+ Cupping</span>
        </label>

        <div>
          <p className="text-xs text-dim mb-2">Payment method</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className={`flex items-center justify-center py-2 border rounded-lg text-sm cursor-pointer transition-colors ${paymentMethod === m.value ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-dim hover:bg-white/5"}`}>
                <input type="radio" name="pm" value={m.value} checked={paymentMethod === m.value} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-danger text-xs">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-teal">{formatETB(total)}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-xl border border-white/15 text-dim hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="text-sm font-semibold px-4 py-2 rounded-xl bg-teal text-bg hover:bg-teal-light disabled:opacity-50">
              {loading ? "Saving…" : "Confirm Paid"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const SessionCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingSession, setPayingSession] = useState(null); // session object being paid

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/patients/${id}`)
      .then(({ data }) => {
        setPatient(data.patient);
        setSessions(data.sessions);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load patient"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" /></div>;
  if (error) return <p className="text-danger p-6">{error}</p>;
  if (!patient) return null;

  const regAmount = (patient.payFor || []).reduce((s, sid) => s + (SERVICE_PRICES[sid] || 0), 0);

  // Build rows: row 0 = registration day, rows 1..N = follow-up sessions
  const rows = sessions.map((s, idx) => {
    const isFirst = idx === 0;
    const scheduledDate = new Date(s.scheduledDate);
    const checkedInAt = s.checkedInAt ? new Date(s.checkedInAt) : null;

    const displayDate = checkedInAt || (s.status === "attended" ? scheduledDate : null);
    const displayTime = checkedInAt
      ? checkedInAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "";

    const serviceLabel = s.services?.length
      ? s.services.map((sv) => SERVICE_LABELS[sv]).join(" + ")
      : isFirst
        ? (patient.payFor || []).map((sv) => SERVICE_LABELS[sv]).join(" + ")
        : "";
    const amount = s.sessionAmount || (isFirst && s.status === "attended" ? regAmount : 0);
    const isPaid = s.sessionAmount > 0 || (isFirst && s.status === "attended") || patient.paidAllSessions;
    const canPay = s.status === "scheduled" && !patient.paidAllSessions;

    return { s, idx, displayDate, displayTime, serviceLabel, amount, isPaid, canPay };
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to={`/dashboard/patients/${id}`} className="inline-flex items-center gap-1.5 text-dim hover:text-teal text-sm">
          <ArrowLeft size={16} /> Back to patient
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-teal text-bg hover:bg-teal-light"
        >
          <Printer size={16} /> Print Card
        </button>
      </div>

      {/* Card — styled to match the physical paper card */}
      <div className="bg-white text-gray-900 rounded-xl p-8 shadow-lg print:shadow-none print:rounded-none print:p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold uppercase tracking-wide">Unique Physiotherapy Speciality Clinic</h1>
          <p className="text-sm text-gray-500 mt-0.5">የኒኒ ፊዚዮቴራፒ ስፔሻሊቲ ክሊኒክ</p>
        </div>

        {/* Patient info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-5 border-b border-gray-300 pb-4">
          <div><span className="font-medium">Patient Name:</span> {patient.fullName}</div>
          <div><span className="font-medium">Card No:</span> {patient.cardNo}</div>
          <div><span className="font-medium">Age:</span> {patient.age}</div>
          <div><span className="font-medium">Gender:</span> {patient.sex}</div>
          <div className="col-span-2"><span className="font-medium">Diagnosis / Condition:</span> {patient.diagnosis}</div>
          <div className="col-span-2"><span className="font-medium">Physiotherapist:</span> {patient.physiotherapist}</div>
        </div>

        <p className="text-sm font-semibold mb-2">Treatment Sessions</p>

        {/* Sessions table */}
        <table className="w-full text-sm border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left w-12">No</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Date</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Time</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Services</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Amount</th>
              <th className="border border-gray-400 px-3 py-2 text-center w-24">Paid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, idx, displayDate, displayTime, serviceLabel, amount, isPaid, canPay }) => (
              <tr key={s._id} className={`${s.status === "attended" ? "bg-green-50" : s.status === "missed" ? "bg-red-50" : ""}`}>
                <td className="border border-gray-400 px-3 py-2 font-medium text-center">{idx}</td>
                <td className="border border-gray-400 px-3 py-2">
                  {displayDate
                    ? displayDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : <span className="text-gray-400 text-xs">
                        {new Date(s.scheduledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                  }
                </td>
                <td className="border border-gray-400 px-3 py-2 text-gray-600">{displayTime || "—"}</td>
                <td className="border border-gray-400 px-3 py-2 text-gray-700">{serviceLabel || "—"}</td>
                <td className="border border-gray-400 px-3 py-2 font-medium">
                  {amount > 0 ? formatETB(amount) : patient.paidAllSessions ? <span className="text-green-700 text-xs">Pre-paid</span> : "—"}
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-xs">
                      <CheckCircle2 size={14} /> Paid
                    </span>
                  ) : s.status === "missed" ? (
                    <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                      <XCircle size={13} /> Missed
                    </span>
                  ) : canPay ? (
                    <button
                      onClick={() => setPayingSession({ ...s, sessionIndex: idx })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal text-white hover:bg-teal-600 transition-colors print:hidden"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
          <p>N.B Please call us for any change in your appointment</p>
          <p>📍 Ayat Square | 📞 +251 907 797971</p>
        </div>
      </div>

      {/* Pay modal */}
      {payingSession && (
        <PayModal
          session={payingSession}
          defaultPaymentMethod={patient.paymentMethod}
          onSuccess={() => { setPayingSession(null); load(); }}
          onCancel={() => setPayingSession(null)}
        />
      )}
    </div>
  );
};

export default SessionCard;
