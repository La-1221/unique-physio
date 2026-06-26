import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Phone, MapPin, User, Stethoscope, Calendar,
  CheckCircle2, XCircle, Clock, DollarSign, ClipboardList,
} from "lucide-react";
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

const statusStyles = {
  scheduled: { bg: "bg-white/10", text: "text-dim", Icon: Clock },
  attended: { bg: "bg-teal/15", text: "text-teal", Icon: CheckCircle2 },
  missed: { bg: "bg-danger/15", text: "text-danger", Icon: XCircle },
};

// Inline check-in payment form for a single session
const CheckInForm = ({ session, defaultPaymentMethod, onSuccess, onCancel }) => {
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
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-surface2 border border-white/10 rounded-xl space-y-3">
      <p className="text-xs font-semibold text-dim uppercase tracking-wide">Record Payment</p>

      {/* Treatment — locked/mandatory */}
      <div className="flex items-center gap-2.5 p-2.5 border border-teal rounded-lg bg-teal/10 opacity-80 cursor-not-allowed">
        <input type="checkbox" checked readOnly disabled className="w-4 h-4 rounded" />
        <span className="text-sm flex-1">Treatment</span>
        <span className="text-xs text-teal">Required</span>
      </div>

      {/* Dry Needling — optional */}
      <label className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-colors ${addDryNeedling ? "border-teal bg-teal/10" : "border-white/10 hover:bg-white/5"}`}>
        <input type="checkbox" checked={addDryNeedling} onChange={(e) => setAddDryNeedling(e.target.checked)} className="w-4 h-4 rounded text-teal bg-transparent border-white/30 focus:ring-teal" />
        <span className="text-sm">+ Dry Needling</span>
      </label>

      {/* Cupping — optional */}
      <label className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-colors ${addCupping ? "border-teal bg-teal/10" : "border-white/10 hover:bg-white/5"}`}>
        <input type="checkbox" checked={addCupping} onChange={(e) => setAddCupping(e.target.checked)} className="w-4 h-4 rounded text-teal bg-transparent border-white/30 focus:ring-teal" />
        <span className="text-sm">+ Cupping</span>
      </label>

      {/* Payment method */}
      <div className="grid grid-cols-4 gap-1.5">
        {PAYMENT_METHODS.map((m) => (
          <label key={m.value} className={`flex items-center justify-center rounded-lg border py-1.5 text-xs cursor-pointer transition-colors ${paymentMethod === m.value ? "border-teal bg-teal/10 text-teal" : "border-white/10 text-dim hover:border-white/25"}`}>
            <input type="radio" name={`pm_${session._id}`} value={m.value} checked={paymentMethod === m.value} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
            {m.label}
          </label>
        ))}
      </div>

      {error && <p className="text-danger text-xs">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-teal">{formatETB(total)}</span>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-white">Cancel</button>
          <button type="submit" disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal text-bg hover:bg-teal-light disabled:opacity-50">
            {loading ? "Saving…" : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </form>
  );
};

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCheckIn, setActiveCheckIn] = useState(null); // sessionId currently showing form
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleMarkMissed = async (sessionId) => {
    setActionLoading(sessionId);
    try {
      await api.post(`/sessions/${sessionId}/mark-missed`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not mark as missed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />;
  if (error) return <p className="text-danger">{error}</p>;
  if (!patient) return null;

  const regAmount = (patient.payFor || []).reduce((s, sid) => s + (SERVICE_PRICES[sid] || 0), 0);
  const perSessionPrice = SERVICE_PRICES["treatment"] || 0;
  const allSessionsTotal = regAmount + perSessionPrice * Math.max(0, patient.totalSessions - 1);

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard/patients" className="inline-flex items-center gap-1.5 text-dim hover:text-teal text-sm mb-6">
        <ArrowLeft size={16} /> Back to patients
      </Link>

      {/* Patient Info */}
      <div className="card p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-teal text-sm mb-1">{patient.cardNo}</p>
            <h1 className="font-display font-bold text-2xl">{patient.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/dashboard/patients/${id}/session-card`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-teal hover:border-teal/40 transition-colors"
            >
              <ClipboardList size={13} /> Session Card
            </Link>
            <span className={`text-sm px-3 py-1.5 rounded-full ${patient.status === "active" ? "bg-teal/10 text-teal" : "bg-white/10 text-dim"}`}>
              {patient.status}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2.5 text-dim"><Phone size={15} className="text-teal" /> {patient.phone}</div>
          <div className="flex items-center gap-2.5 text-dim"><User size={15} className="text-teal" /> {patient.sex}, {patient.age} years</div>
          <div className="flex items-center gap-2.5 text-dim"><Stethoscope size={15} className="text-teal" /> {patient.physiotherapist}</div>
          <div className="flex items-center gap-2.5 text-dim"><MapPin size={15} className="text-teal" /> {patient.address}</div>
          <div className="flex items-center gap-2.5 text-dim sm:col-span-2"><Calendar size={15} className="text-teal" /> Diagnosis: {patient.diagnosis}</div>
        </div>

        {/* Sessions + Payment summary */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5 text-sm">
          <div>
            <p className="text-dim text-xs mb-1">Sessions</p>
            <p className="font-display font-bold text-xl">{patient.sessionsRemaining} / {patient.totalSessions} remaining</p>
          </div>
          <div>
            <p className="text-dim text-xs mb-1">Registration Day</p>
            <p className="font-semibold">{formatETB(regAmount)}</p>
            <p className="text-xs text-dim mt-0.5">
              {(patient.payFor || []).map((s) => SERVICE_LABELS[s]).join(" + ")}
            </p>
          </div>
          <div>
            <p className="text-dim text-xs mb-1">Per Session (base)</p>
            <p className="font-semibold">{formatETB(perSessionPrice)}</p>
            <p className="text-xs text-dim mt-0.5">Treatment</p>
            {patient.paidAllSessions && (
              <p className="text-xs text-teal mt-1">All sessions paid — {formatETB(allSessionsTotal)}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-4 py-3 bg-teal/10 border border-teal/20 rounded-xl">
          <span className="text-sm text-dim flex items-center gap-2"><DollarSign size={14} className="text-teal" /> Total collected</span>
          <span className="font-bold text-teal">{formatETB(patient.amount)}</span>
        </div>
      </div>

      {/* Session Calendar */}
      <div className="card p-7">
        <p className="font-semibold mb-5">Session Calendar</p>
        <div className="space-y-2">
          {sessions.map((s, idx) => {
            const style = statusStyles[s.status];
            const sessionDate = new Date(s.scheduledDate);
            const today = new Date();
            const isToday =
              sessionDate.getFullYear() === today.getFullYear() &&
              sessionDate.getMonth() === today.getMonth() &&
              sessionDate.getDate() === today.getDate();
            const isFirst = idx === 0;
            const sessionServiceLabel = s.services?.length
              ? s.services.map((sv) => SERVICE_LABELS[sv]).join(" + ")
              : isFirst
                ? (patient.payFor || []).map((sv) => SERVICE_LABELS[sv]).join(" + ")
                : "Treatment";
            const sessionPrice = s.sessionAmount || (isFirst ? regAmount : perSessionPrice);
            const isPaid = s.sessionAmount > 0 || patient.paidAllSessions;

            return (
              <div key={s._id}>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface2 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                      <style.Icon size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        Session {idx + 1} —{" "}
                        {sessionDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        {s.isMakeupSession && <span className="ml-2 text-xs text-warn">Makeup</span>}
                      </p>
                      <p className="text-xs text-dim mt-0.5">
                        <span className={`capitalize ${style.text}`}>{s.status}</span>
                        {s.status === "attended" && (
                          <> · {sessionServiceLabel} · {formatETB(sessionPrice)}</>
                        )}
                        {isPaid && s.status === "attended" && (
                          <span className="ml-1.5 text-teal font-medium">✓ Paid</span>
                        )}
                        {patient.paidAllSessions && s.status !== "attended" && (
                          <span className="ml-1.5 text-teal">Pre-paid</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {s.status === "scheduled" && (
                    <div className="flex gap-2">
                      {!patient.paidAllSessions ? (
                        <button
                          onClick={() => setActiveCheckIn(activeCheckIn === s._id ? null : s._id)}
                          disabled={actionLoading === s._id || !isToday}
                          title={!isToday ? "Check-in is only available on the session day" : ""}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal text-bg hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Check In & Pay
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setActionLoading(s._id);
                            try {
                              await api.post(`/sessions/${s._id}/check-in`);
                              load();
                            } catch (err) {
                              alert(err.response?.data?.message || "Check-in failed");
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === s._id || !isToday}
                          title={!isToday ? "Check-in is only available on the session day" : ""}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal text-bg hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Check In
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkMissed(s._id)}
                        disabled={actionLoading === s._id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/15 text-dim hover:text-danger hover:border-danger/40 disabled:opacity-50"
                      >
                        Missed
                      </button>
                    </div>
                  )}
                </div>
                {activeCheckIn === s._id && (
                  <CheckInForm
                    session={s}
                    defaultPaymentMethod={patient.paymentMethod}
                    onSuccess={() => { setActiveCheckIn(null); load(); }}
                    onCancel={() => setActiveCheckIn(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
