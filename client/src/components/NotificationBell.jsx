import { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card shadow-2xl z-50 animate-floatUp">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="font-semibold text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-teal hover:text-teal-light flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-dim text-sm text-center py-8 px-4">No notifications yet.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-teal/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-dim mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-dim/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
