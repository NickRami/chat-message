import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Smile, Paperclip, MoreVertical, Search, Phone, Video,
  FileText, Camera, Image, Headphones, MapPin, User as UserIcon,
  ArrowLeft, UserCircle, BellOff, Bell, Trash2, ShieldOff, X,
  Mail, Info, AlertTriangle, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

/* ═══════════════════════════════════════════════════════════════
   TOOLTIP
═══════════════════════════════════════════════════════════════ */
const Tooltip: React.FC<{ label: string; children: React.ReactNode; position?: 'bottom' | 'top' }> = ({
  label, children, position = 'bottom'
}) => (
  <div className="relative group/tip">
    {children}
    {label && (
      <span className={clsx(
        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "px-2 py-1 rounded-lg text-[11px] font-medium",
        "bg-surface-900 dark:bg-surface-950 text-white border border-white/10 shadow-xl",
        "opacity-0 group-hover/tip:opacity-100 translate-y-1 group-hover/tip:translate-y-0",
        "transition-all duration-200 z-50",
        position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
      )}>
        {label}
      </span>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   ACTION ICON BUTTON
═══════════════════════════════════════════════════════════════ */
const ActionIconBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  tooltipPos?: 'bottom' | 'top';
}> = ({ icon, label, onClick, active, danger, tooltipPos = 'bottom' }) => (
  <Tooltip label={label} position={tooltipPos}>
    <button
      onClick={onClick}
      className={clsx(
        "p-2 rounded-xl transition-all duration-200 shrink-0",
        danger
          ? "text-red-400 hover:text-red-500 hover:bg-red-500/10"
          : active
          ? "text-brand-400 bg-brand-500/10"
          : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
      )}
    >
      {icon}
    </button>
  </Tooltip>
);

/* ═══════════════════════════════════════════════════════════════
   DROPDOWN ITEM
═══════════════════════════════════════════════════════════════ */
const DropdownItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  subtitle?: string;
}> = ({ icon, label, onClick, danger, subtitle }) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 group",
      danger
        ? "text-red-500 hover:bg-red-500/10"
        : "text-zinc-700 dark:text-surface-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
    )}
  >
    <span className={clsx(
      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150",
      danger
        ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
        : "bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-surface-400 group-hover:bg-brand-500/10 group-hover:text-brand-500"
    )}>
      {icon}
    </span>
    <div className="text-left">
      <p className={clsx("font-medium text-sm", danger ? "text-red-500" : "text-zinc-800 dark:text-surface-100")}>{label}</p>
      {subtitle && <p className="text-[11px] text-zinc-400 dark:text-surface-500 mt-0.5">{subtitle}</p>}
    </div>
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   BASE MODAL WRAPPER
═══════════════════════════════════════════════════════════════ */
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
    {/* Panel */}
    <div className="relative w-full max-w-sm animate-scale-in">
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PROFILE MODAL
═══════════════════════════════════════════════════════════════ */
const ProfileModal: React.FC<{
  user: any;
  isOnline: boolean;
  getInitials: (n: string) => string;
  getAvatarColor: (n: string) => string;
  onClose: () => void;
}> = ({ user, isOnline, getInitials, getAvatarColor, onClose }) => (
  <Modal onClose={onClose}>
    <div className="bg-white dark:bg-surface-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-zinc-200 dark:border-white/[0.06]">
      {/* Banner */}
      <div className={`h-24 bg-gradient-to-br ${getAvatarColor(user?.name || '')} relative`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* Avatar */}
      <div className="px-6 pb-6">
        <div className="relative -mt-10 mb-4">
          <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarColor(user?.name || '')} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white dark:border-surface-800`}>
            {getInitials(user?.name || '')}
          </div>
          {/* Status dot */}
          <span className={clsx(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-surface-800 shadow-md",
            isOnline ? "bg-emerald-500 shadow-emerald-500/40" : "bg-zinc-400"
          )} />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-0.5">{user?.name || 'Unknown'}</h2>
        <span className={clsx(
          "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-4",
          isOnline
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-surface-400"
        )}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400")} />
          {isOnline ? 'Active now' : 'Offline'}
        </span>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-white/[0.04] rounded-xl">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
              <Mail size={15} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 dark:text-surface-500 uppercase tracking-wide font-medium">Email</p>
              <p className="text-sm font-medium text-zinc-800 dark:text-surface-100">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-white/[0.04] rounded-xl">
            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500 shrink-0">
              <Info size={15} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 dark:text-surface-500 uppercase tracking-wide font-medium">About</p>
              <p className="text-sm font-medium text-zinc-800 dark:text-surface-100">{user?.about || 'Available'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-surface-200 font-medium rounded-xl text-sm transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>
);

/* ═══════════════════════════════════════════════════════════════
   CONFIRM MODAL  (Mute / Clear / Block)
═══════════════════════════════════════════════════════════════ */
type ConfirmVariant = 'mute' | 'unmute' | 'clear' | 'block';

const CONFIRM_CONFIG: Record<ConfirmVariant, {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
}> = {
  mute: {
    icon: <BellOff size={22} />,
    iconBg: 'bg-amber-500/10 text-amber-500',
    title: 'Mute notifications',
    description: 'You won\'t receive notifications for new messages in this conversation. You can unmute anytime.',
    confirmLabel: 'Mute',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
  },
  unmute: {
    icon: <Bell size={22} />,
    iconBg: 'bg-brand-500/10 text-brand-500',
    title: 'Unmute notifications',
    description: 'You\'ll start receiving notifications for new messages in this conversation again.',
    confirmLabel: 'Unmute',
    confirmClass: 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/25',
  },
  clear: {
    icon: <Trash2 size={22} />,
    iconBg: 'bg-orange-500/10 text-orange-500',
    title: 'Clear chat',
    description: 'All messages will be removed locally from your view. This action cannot be undone.',
    confirmLabel: 'Clear chat',
    confirmClass: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25',
  },
  block: {
    icon: <ShieldOff size={22} />,
    iconBg: 'bg-red-500/10 text-red-500',
    title: 'Block user',
    description: 'This user won\'t be able to send you messages. You can unblock them from your settings.',
    confirmLabel: 'Block user',
    confirmClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/25',
  },
};

const ConfirmModal: React.FC<{
  variant: ConfirmVariant;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ variant, onConfirm, onClose }) => {
  const cfg = CONFIRM_CONFIG[variant];
  return (
    <Modal onClose={onClose}>
      <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-2xl shadow-black/40 border border-zinc-200 dark:border-white/[0.06]">
        {/* Icon */}
        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4", cfg.iconBg)}>
          {cfg.icon}
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white text-center mb-2">{cfg.title}</h3>
        <p className="text-sm text-zinc-500 dark:text-surface-400 text-center leading-relaxed mb-6">{cfg.description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-surface-200 font-semibold rounded-xl text-sm transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={clsx(
              "flex-1 py-2.5 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg",
              cfg.confirmClass
            )}
          >
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUCCESS TOAST
═══════════════════════════════════════════════════════════════ */
const Toast: React.FC<{ message: string; onHide: () => void }> = ({ message, onHide }) => {
  useEffect(() => {
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-surface-900 dark:bg-surface-950 text-white rounded-2xl shadow-2xl border border-white/[0.08]">
        <CheckCircle size={16} className="text-brand-400 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN CHAT WINDOW
═══════════════════════════════════════════════════════════════ */
const ChatWindow: React.FC<{ socket: any }> = ({ socket }) => {
  const { user } = useAuthStore();
  const {
    messages,
    fetchMessages,
    sendMessage,
    chats,
    selectedChat: chatId,
    onlineUsers
  } = useChatStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setSelectedChat } = useChatStore();
  const [isMuted, setIsMuted] = useState(false);

  // Modal state
  type ActiveModal = 'profile' | 'mute' | 'unmute' | 'clear' | 'block' | null;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeChat = chats.find((c: any) => c._id?.toString() === chatId);
  const otherUser = activeChat?.users?.find((u: any) => (u._id?.toString() || u.toString()) !== user?.id) || activeChat?.users?.[0];

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-brand-500 to-brand-700', 'from-violet-500 to-brand-600',
      'from-pink-500 to-violet-500', 'from-blue-500 to-brand-500',
      'from-emerald-400 to-blue-500', 'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600', 'from-teal-500 to-cyan-600',
    ];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
      if (socket) socket.emit('join_chat', chatId);
    }
  }, [chatId, fetchMessages, socket]);

  useEffect(() => { scrollToBottom(); }, [messages, chatId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setShowOptions(false);
      if (!target.closest('.emoji-picker-wrapper')) setShowEmojiPicker(false);
      if (!target.closest('.attachment-picker-wrapper')) setShowAttachmentOptions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOnline = !!(otherUser?._id && onlineUsers.includes(otherUser._id.toString()));

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    const msgContent = input;
    setInput('');
    setSending(true);
    try {
      await sendMessage(chatId, msgContent);
      const { messages: currentMessages } = useChatStore.getState();
      const newMsg = currentMessages[currentMessages.length - 1];
      if (socket) socket.emit('new_message', newMsg);
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😊', '😂', '😍', '👍', '🔥', '🙌', '😎', '😢', '❤️', '✨', '🤔', '🎉', '👋', '🙏', '💯', '🚀'];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  let lastDateLabel = '';

  const showToast = (msg: string) => setToast(msg);

  return (
    <div className="flex flex-col h-full chat-pattern relative">

      {/* ── Modals ─────────────────────────────────────────────── */}
      {activeModal === 'profile' && (
        <ProfileModal
          user={otherUser}
          isOnline={isOnline}
          getInitials={getInitials}
          getAvatarColor={getAvatarColor}
          onClose={() => setActiveModal(null)}
        />
      )}

      {(activeModal === 'mute' || activeModal === 'unmute') && (
        <ConfirmModal
          variant={activeModal}
          onClose={() => setActiveModal(null)}
          onConfirm={() => {
            setIsMuted(!isMuted);
            showToast(isMuted ? 'Notifications enabled' : 'Notifications muted');
          }}
        />
      )}

      {activeModal === 'clear' && (
        <ConfirmModal
          variant="clear"
          onClose={() => setActiveModal(null)}
          onConfirm={() => {
            useChatStore.setState({ messages: [] });
            showToast('Chat cleared');
          }}
        />
      )}

      {activeModal === 'block' && (
        <ConfirmModal
          variant="block"
          onClose={() => setActiveModal(null)}
          onConfirm={() => {
            setSelectedChat(null);
            showToast('User blocked');
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onHide={() => setToast(null)} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="h-16 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl flex items-center justify-between px-4 border-b border-zinc-200 dark:border-white/[0.06] shrink-0 z-10">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChat(null)}
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white lg:hidden rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar with status dot ONLY */}
          <button
            onClick={() => setActiveModal('profile')}
            className="relative group cursor-pointer"
            title="View profile"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(otherUser?.name || '')} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-200`}>
              {getInitials(otherUser?.name || '')}
            </div>
            {/* Status dot — always visible, color depends on online state */}
            <span className={clsx(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-surface-900 shadow-md transition-colors duration-300",
              isOnline
                ? "bg-emerald-500 shadow-emerald-500/50"
                : "bg-zinc-400 dark:bg-zinc-600"
            )} />
          </button>

          {/* Name only — no Online/Offline text */}
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
              {otherUser?.name || 'User'}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-surface-500 leading-tight">
              {isOnline ? 'Active now' : 'Last seen recently'}
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-0.5">
          <div className="w-px h-5 bg-zinc-200 dark:bg-white/[0.08] mx-1.5" />
          <ActionIconBtn icon={<Phone size={18} />} label="Voice Call" />
          <ActionIconBtn icon={<Video size={18} />} label="Video Call" />
          <ActionIconBtn icon={<Search size={18} />} label="Search in chat" />

          {/* More options */}
          <div className="relative" ref={dropdownRef}>
            <Tooltip label="More options">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={clsx(
                  "p-2 rounded-xl transition-all duration-200",
                  showOptions
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                )}
              >
                <MoreVertical size={18} className={clsx("transition-transform duration-200", showOptions && "rotate-90")} />
              </button>
            </Tooltip>

            {showOptions && (
              <div className={clsx(
                "absolute right-0 top-full mt-2 w-56 z-50",
                "bg-white dark:bg-surface-800",
                "border border-zinc-200 dark:border-white/[0.08]",
                "rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60",
                "overflow-hidden animate-scale-in"
              )}>
                <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-surface-500">
                    Conversation
                  </p>
                </div>

                <div className="py-1.5">
                  <DropdownItem
                    icon={<UserCircle size={16} />}
                    label="View Profile"
                    subtitle={otherUser?.email}
                    onClick={() => { setActiveModal('profile'); setShowOptions(false); }}
                  />
                  <DropdownItem
                    icon={isMuted ? <Bell size={16} /> : <BellOff size={16} />}
                    label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                    subtitle={isMuted ? 'Re-enable alerts' : 'Silence this chat'}
                    onClick={() => { setActiveModal(isMuted ? 'unmute' : 'mute'); setShowOptions(false); }}
                  />
                  <DropdownItem
                    icon={<Trash2 size={16} />}
                    label="Clear chat"
                    subtitle="Remove local messages"
                    onClick={() => { setActiveModal('clear'); setShowOptions(false); }}
                  />
                </div>

                <div className="border-t border-zinc-100 dark:border-white/[0.06] py-1.5">
                  <DropdownItem
                    icon={<ShieldOff size={16} />}
                    label="Block user"
                    danger
                    onClick={() => { setActiveModal('block'); setShowOptions(false); }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg: any, idx: number) => {
          const msgSenderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
          const isSender = msgSenderId === user?.id;
          const currentDateLabel = getDateLabel(msg.createdAt);
          const showDateLabel = currentDateLabel !== lastDateLabel;
          lastDateLabel = currentDateLabel;

          return (
            <React.Fragment key={msg._id || idx}>
              {showDateLabel && (
                <div className="flex justify-center py-3">
                  <span className="text-[11px] text-zinc-500 dark:text-surface-400 bg-zinc-100 dark:bg-surface-800/60 backdrop-blur-sm px-3 py-1 rounded-full border border-zinc-200 dark:border-white/[0.04]">
                    {currentDateLabel}
                  </span>
                </div>
              )}
              <div className={clsx("flex animate-slide-up", isSender ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[70%] rounded-2xl px-3.5 py-2 shadow-md",
                  isSender
                    ? "bg-gradient-to-br from-brand-600 to-brand-700 rounded-br-md"
                    : "bg-white dark:bg-surface-800/80 backdrop-blur-sm border border-zinc-200 dark:border-white/[0.06] rounded-bl-md"
                )}>
                  <p className={clsx("text-sm leading-relaxed", isSender ? "text-white" : "text-zinc-800 dark:text-surface-200")}>
                    {msg.content}
                  </p>
                  <div className={clsx("flex items-center gap-1 justify-end mt-1", isSender ? "text-white/50" : "text-surface-500")}>
                    <span className="text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSender && (
                      <svg viewBox="0 0 16 15" width="14" height="13" className={msg.status === 'read' ? 'fill-blue-400' : 'fill-white/40'}>
                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ─────────────────────────────────────────── */}
      <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/[0.06] px-4 py-3 shrink-0 relative">

        {showEmojiPicker && (
          <div className="emoji-picker-wrapper absolute bottom-full left-4 mb-2 p-3 bg-white dark:bg-surface-800 border border-zinc-200 dark:border-white/[0.06] rounded-2xl shadow-2xl grid grid-cols-8 gap-2 z-50 animate-fade-in">
            {commonEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-white/[0.1] rounded-xl transition-all hover:scale-110 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {showAttachmentOptions && (
          <div className="attachment-picker-wrapper absolute bottom-full left-16 mb-4 p-4 bg-white dark:bg-surface-800 border border-zinc-200 dark:border-white/[0.06] rounded-3xl shadow-2xl z-50 animate-fade-in">
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: <FileText size={22} />, label: 'Document', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/30' },
                { icon: <Camera size={22} />, label: 'Camera', color: 'bg-pink-500', shadow: 'shadow-pink-500/30' },
                { icon: <Image size={22} />, label: 'Gallery', color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
                { icon: <Headphones size={22} />, label: 'Audio', color: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
                { icon: <MapPin size={22} />, label: 'Location', color: 'bg-green-600', shadow: 'shadow-green-600/30' },
                { icon: <UserIcon size={22} />, label: 'Contact', color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    if (opt.label === 'Gallery' || opt.label === 'Document') fileInputRef.current?.click();
                    else alert(`${opt.label} coming soon!`);
                    setShowAttachmentOptions(false);
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={clsx(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 group-hover:scale-110 group-active:scale-90",
                    opt.color, opt.shadow
                  )}>
                    {opt.icon}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-surface-300">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) alert(`Attachment simulated: ${file.name}`);
          }} className="hidden" />

          <Tooltip label="Emoji" position="top">
            <button
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentOptions(false); }}
              className={clsx(
                "p-2 rounded-xl transition-all duration-200 shrink-0",
                showEmojiPicker ? "bg-amber-400/10 text-amber-400" : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
              )}
            >
              <Smile size={22} />
            </button>
          </Tooltip>

          <Tooltip label="Attach file" position="top">
            <button
              onClick={() => { setShowAttachmentOptions(!showAttachmentOptions); setShowEmojiPicker(false); }}
              className={clsx(
                "p-2 rounded-xl transition-all duration-200 shrink-0",
                showAttachmentOptions ? "bg-brand-500/10 text-brand-400 rotate-45" : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
              )}
            >
              <Paperclip size={22} />
            </button>
          </Tooltip>

          <form onSubmit={handleSend} className="flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-surface-800/60 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-surface-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form>

          <Tooltip label={input.trim() ? "Send" : ""} position="top">
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-200 shrink-0",
                input.trim()
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95"
                  : "text-zinc-400 dark:text-surface-500 bg-zinc-100 dark:bg-surface-800/40 cursor-not-allowed"
              )}
            >
              <Send size={20} className={clsx("transition-transform duration-200", input.trim() && "translate-x-0.5 -translate-y-0.5")} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
