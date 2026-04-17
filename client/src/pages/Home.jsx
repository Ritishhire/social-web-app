import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const Ic = ({ d, size = 22, fill = "none", sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  home:    <Ic d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  search:  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:    <Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />,
  msg:     <Ic d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  user:    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  heart:  (f) => <svg width={18} height={18} viewBox="0 0 24 24" fill={f?"#ff2d55":"none"} stroke={f?"#ff2d55":"currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  comment: <Ic d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={18} />,
  send2:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  trash:   <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  edit:    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  image:   <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  share:   <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  back:    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  clock:   <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check:   <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const ago = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return `${Math.floor(s)}s`;
  if (s < 3600)  return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

const GRADS = [
  "from-blue-600 via-indigo-600 to-purple-600",
  "from-pink-500 via-rose-500 to-red-500",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-cyan-400 via-blue-500 to-indigo-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
];
const gradFor = (s = "") => GRADS[s.charCodeAt(0) % GRADS.length];

function Av({ name = "?", size = "w-10 h-10", text = "text-sm" }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradFor(name)} shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-white ${text} flex-shrink-0 z-10 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/>
    </svg>
  );
}

const NOTIF_EMOJI = { like:"❤️", comment:"💬", follow:"🪐", share:"✨", message:"✉️" };
const NOTIF_COPY  = { like:"liked your post", comment:"commented on your post", follow:"entered your orbit", share:"amplified your post", message:"sent you a transmission" };

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function Home() {
  const navigate    = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId        = currentUser._id;

  // panel: "feed" | "search" | "notifications" | "messages" | "profile"
  const [panel, setPanel] = useState("feed");

  /* ── viewed user profile ── */
  const [viewUserId, setViewUserId] = useState(null);  // non-null → show UserProfilePanel
  const prevPanel = useRef("feed");                    // panel to go back to after closing profile

  /* ── feed ── */
  const [posts, setPosts]             = useState([]);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [caption, setCaption]         = useState("");
  const [imgUrl, setImgUrl]           = useState("");
  const [posting, setPosting]         = useState(false);
  const loaderRef = useRef(null);

  /* ── comments ── */
  const [openCmt, setOpenCmt]   = useState({});   // postId → bool
  const [cmtText, setCmtText]   = useState({});   // postId → string
  const [cmtBusy, setCmtBusy]   = useState({});   // postId → bool

  /* ── share-post modal ── */
  const [sharePost, setSharePost] = useState(null);   // post object to share in DM

  /* ── notifications ── */
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);

  /* ── search ── */
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);

  /* ── profile ── */
  const [profile, setProfile] = useState(null);

  /* ── modals & overlays ── */
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: "", bio: "", profilePic: "" });

  /* ── messages ── */
  const [chats, setChats]         = useState([]);        // list of chats (with memberDetails)
  const [activeChat, setActiveChat] = useState(null);    // { chatId, otherId, otherName }
  const [msgs, setMsgs]           = useState([]);        // messages in active chat
  const [msgText, setMsgText]     = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [newMsgUserId, setNewMsgUserId] = useState("");  // search state inside messages
  const [msgSearchQ, setMsgSearchQ]    = useState("");
  const [msgSearchRes, setMsgSearchRes] = useState([]);
  const [msgSearching, setMsgSearching] = useState(false);
  const msgBottom = useRef(null);

  /* ── toast ── */
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  /* ══ FETCH FEED ══ */
  const fetchFeed = useCallback(async (p = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoadingFeed(true);
      const r = await API.get(`/posts?page=${p}&limit=6`);
      setPosts(prev => append ? [...prev, ...r.data.posts] : r.data.posts);
      setTotalPages(r.data.totalPages);
      setPage(p);
    } catch { showToast("error", "Failed to load posts"); }
    finally { setLoadingFeed(false); setLoadingMore(false); }
  }, [showToast]);

  useEffect(() => { fetchFeed(1); }, [fetchFeed]);

  /* ══ INFINITE SCROLL ══ */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages && !loadingMore)
        fetchFeed(page + 1, true);
    }, { threshold: 1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [page, totalPages, loadingMore, fetchFeed]);

  /* ══ FETCH NOTIFICATIONS ══ */
  const fetchNotifs = useCallback(async () => {
    try {
      const r = await API.get("/notifications");
      setNotifs(r.data);
      setUnread(r.data.filter(n => !n.isRead).length);
    } catch {}
  }, []);
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  /* ══ FETCH PROFILE ══ */
  useEffect(() => {
    if (!myId) return;
    API.get(`/users/profile/${myId}`).then(r => setProfile(r.data)).catch(() => {});
  }, [myId]);

  /* ══ FETCH CHATS ══ */
  const fetchChats = useCallback(async () => {
    if (!myId) return;
    try { const r = await API.get(`/chat/${myId}`); setChats(r.data); } catch {}
  }, [myId]);
  useEffect(() => { fetchChats(); }, [fetchChats]);

  /* ══ SEARCH USERS BY NAME (debounced) ══ */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { const r = await API.get(`/users/search?q=${encodeURIComponent(query)}`); setResults(r.data); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  /* ══ MESSAGE PANEL: SEARCH USERS ══ */
  useEffect(() => {
    if (!msgSearchQ.trim()) { setMsgSearchRes([]); return; }
    const t = setTimeout(async () => {
      setMsgSearching(true);
      try { const r = await API.get(`/users/search?q=${encodeURIComponent(msgSearchQ)}`); setMsgSearchRes(r.data); }
      catch { setMsgSearchRes([]); }
      finally { setMsgSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [msgSearchQ]);

  /* ══ SCROLL MESSAGES TO BOTTOM ══ */
  useEffect(() => { msgBottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  /* ══════════ ACTIONS ══════════ */

  const handlePost = async () => {
    if (!caption.trim() && !imgUrl.trim()) return;
    setPosting(true);
    try {
      const r = await API.post("/posts/create", { userId: myId, caption, image: imgUrl });
      setPosts(prev => [r.data, ...prev]);
      setCaption(""); setImgUrl("");
      showToast("success", "Signal transmitted");
    } catch { showToast("error", "Transmission failed"); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    try {
      await API.put(`/posts/like/${postId}`);
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(myId);
        return { ...p, likes: liked ? p.likes.filter(i => i !== myId) : [...p.likes, myId] };
      }));
    } catch { showToast("error", "Action failed"); }
  };

  const handleComment = async (postId) => {
    const text = (cmtText[postId] || "").trim();
    if (!text) return;
    setCmtBusy(s => ({ ...s, [postId]: true }));
    try {
      await API.put(`/posts/comment/${postId}`, { text });
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, comments: [...p.comments, { userId: { _id: myId, name: currentUser.name }, text }] } : p
      ));
      setCmtText(c => ({ ...c, [postId]: "" }));
    } catch { showToast("error", "Comment failed"); }
    finally { setCmtBusy(s => ({ ...s, [postId]: false })); }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/users/edit/${myId}`, editProfileData);
      setProfile(res.data);
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...res.data }));
      setEditProfile(false);
      showToast("success", "Identity sync complete");
      window.location.reload();
    } catch { showToast("error", "Update failed"); }
  };

  const handleEditPostSubmit = async (e) => {
    e.preventDefault();
    if (!editPost) return;
    try {
      const res = await API.put(`/posts/${editPost._id}`, { caption: editPost.caption, image: editPost.image });
      setPosts(prev => prev.map(p => p._id === editPost._id ? res.data : p));
      setEditPost(null);
      showToast("success", "Post updated");
    } catch { showToast("error", "Update failed"); }
  };

  const handleDelete = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      showToast("success", "Erased from timeline");
    } catch { showToast("error", "Could not erase"); }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(c => Math.max(0, c - 1));
    } catch {}
  };

  /* ── open or create a chat with another user ── */
  const openDirectMessage = async (otherId, otherName) => {
    if (!otherId || otherId === myId) return;
    try {
      const r = await API.post("/chat/create", { receiverId: otherId });
      setActiveChat({ chatId: r.data._id, otherId, otherName });
      const msgR = await API.get(`/chat/message/${r.data._id}`);
      setMsgs(msgR.data);
      setPanel("messages");
      fetchChats();
      setMsgSearchQ(""); setMsgSearchRes([]);
      setViewUserId(null); // Ensure profile overlay is dismissed
    } catch { showToast("error", "Could not connect"); }
  };

  /* ── load messages for an existing chat ── */
  const loadChat = async (chat) => {
    const other = chat.memberDetails?.find(m => m?._id?.toString() !== myId);
    setActiveChat({ chatId: chat._id, otherId: other?._id, otherName: other?.name || "User" });
    try {
      const r = await API.get(`/chat/message/${chat._id}`);
      setMsgs(r.data);
    } catch { showToast("error", "Loading failed"); }
  };

  /* ── send a message (text + optional sharedPost) ── */
  const handleSendMsg = async (sharedPost = null) => {
    const text = msgText.trim();
    if (!text && !sharedPost) return;
    if (!activeChat) return;
    setSendingMsg(true);
    try {
      const payload = {
        chatId:        activeChat.chatId,
        receiverId:    activeChat.otherId,
        text:          text || "",
        sharedPostId:  sharedPost?._id || null,
      };
      const r = await API.post("/chat/message", payload);
      // Attach sharedPost data locally for immediate display
      const newMsg = { ...r.data, sharedPostId: sharedPost || r.data.sharedPostId };
      setMsgs(prev => [...prev, newMsg]);
      setMsgText("");
      if (sharedPost) setSharePost(null);
    } catch { showToast("error", "Message failed"); }
    finally { setSendingMsg(false); }
  };

  /* ── share post → open DM picker ── */
  const handleShareToDM = (post) => {
    setSharePost(post);
    setPanel("messages");
  };

  /* ── open another user's profile ── */
  const handleViewProfile = (userId) => {
    if (!userId) return;
    if (userId === myId || userId?.toString() === myId) {
      setViewUserId(null);       // Close the viewed profile panel if open
      setPanel("profile");       // Switch our main view to the Profile Tab
      return;
    }
    prevPanel.current = panel;
    setViewUserId(userId);
    // on small screens, switch the right panel into view
    if (panel === "feed") setPanel("search");  // anything non-feed to show right panel
  };

  /* ── close user profile ── */
  const handleCloseProfile = () => {
    setViewUserId(null);
    setPanel(prevPanel.current);
  };

  /* ══════════ NAV CONFIG ══════════ */
  const nav = [
    { key: "feed",          label: "Dashboard",     icon: Icons.home  },
    { key: "search",        label: "Explore",       icon: Icons.search },
    { key: "notifications", label: "Notifications", icon: Icons.bell, badge: unread },
    { key: "messages",      label: "Chats",         icon: Icons.msg   },
    { key: "profile",       label: "Profile",       icon: Icons.user  },
  ];

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-[#03060d] text-white overflow-hidden relative selection:bg-indigo-500/30 font-['Inter',sans-serif]">

      {/* ── ALIEN AURORA BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[130px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[130px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen animate-blob" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* ── MAIN CONTENT WRAPPER (DASHBOARD PADDING) ── */}
      <div className="relative z-10 w-full h-full flex p-3 md:p-5 gap-4 md:gap-5 max-w-[1700px] mx-auto">

        {/* ── TOAST ── */}
        {toast && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-sm font-semibold backdrop-blur-3xl border animate-[toastIn_0.4s_cubic-bezier(0.16,1,0.3,1)] ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}>
            {toast.type === "success" ? "✨" : "⚠️"} {toast.msg}
          </div>
        )}

        {/* ── SHARE-TO-DM MODAL ── */}
        {sharePost && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all" onClick={() => setSharePost(null)}>
            <div className="bg-[#0a0d1a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.7)] transform animate-[zoomIn_0.3s_ease]" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-1 tracking-tight">Transmit Post</h3>
              <p className="text-sm text-gray-400 mb-5">Select a frequency to broadcast</p>
              
              {/* Post preview */}
              <div className="rounded-2xl border border-white/5 p-4 mb-5 bg-white/[0.02] shadow-inner">
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">Payload Preview</p>
                <div className="flex items-center gap-2 mb-2">
                  <Av name={sharePost.userId?.name || "User"} size="w-6 h-6" text="text-[10px]" />
                  <span className="text-xs text-gray-300">{sharePost.userId?.name || "User"}</span>
                </div>
                {sharePost.caption && <p className="text-sm text-gray-100 line-clamp-2">{sharePost.caption}</p>}
              </div>

              <input
                type="text"
                value={msgSearchQ}
                onChange={e => setMsgSearchQ(e.target.value)}
                placeholder="Search coordinates…"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.05] transition-all mb-4"
              />

              <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scroll pr-2">
                {msgSearchRes.length > 0
                  ? msgSearchRes.map(u => (
                      <button key={u._id} onClick={() => { openDirectMessage(u._id, u.name).then(() => handleSendMsg(sharePost)); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition-all text-left group">
                        <Av name={u.name} size="w-10 h-10" />
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.bio || "No bio"}</p>
                        </div>
                      </button>
                    ))
                  : chats.map(c => {
                      const other = c.memberDetails?.find(m => m?._id?.toString() !== myId);
                      if (!other) return null;
                      return (
                        <button key={c._id} onClick={async () => { await loadChat(c); handleSendMsg(sharePost); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition-all text-left group">
                          <Av name={other.name || "U"} size="w-10 h-10" />
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{other.name}</p>
                            <p className="text-xs text-gray-500 truncate">{other.bio || "Recent connection"}</p>
                          </div>
                        </button>
                      );
                    })
                }
              </div>
              <button onClick={() => setSharePost(null)} className="mt-5 w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 text-sm font-medium text-white transition-all hover:scale-[1.02]">Cancel</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            FLOATING CAPSULE SIDEBAR
        ════════════════════════════════ */}
        <aside className="hidden md:flex flex-col items-center xl:items-start w-[80px] xl:w-[260px] h-full bg-white/[0.02] backdrop-blur-[40px] border border-white/5 rounded-[2rem] py-6 px-4 flex-shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-40 transition-all duration-300 group/sidebar overflow-hidden custom-scroll">
          
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10 px-2 w-full cursor-default">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22" className="relative z-10"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
            <span className="hidden xl:block text-2xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tighter">Nexus</span>
          </div>

          <nav className="flex flex-col gap-2 w-full flex-1">
            {nav.map(item => (
              <button key={item.key} onClick={() => setPanel(item.key)}
                className={`relative flex items-center xl:justify-start justify-center gap-4 px-4 py-3.5 rounded-[1.25rem] w-full transition-all duration-300 group hover:scale-[1.02] ${
                  panel === item.key
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"
                }`}>
                <span className={`relative flex-shrink-0 transition-colors ${panel === item.key ? "text-indigo-400" : "group-hover:text-white"}`}>
                  {item.icon}
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center px-1 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
                <span className="hidden xl:block text-[15px] font-semibold tracking-wide">{item.label}</span>
                {panel === item.key && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />}
              </button>
            ))}
          </nav>

          {/* Bottom user section */}
          <div className="mt-8 w-full p-3 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group-hover/sidebar:bg-white/[0.04] transition-colors">
            <button onClick={() => setPanel("profile")} className="flex items-center xl:justify-start justify-center gap-3 w-full hover:scale-[1.02] transition-transform">
              <Av name={currentUser.name || "?"} size="w-10 h-10" text="text-base" />
              <div className="hidden xl:block text-left min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{currentUser.email}</p>
              </div>
            </button>
            <button onClick={handleLogout}
              className="mt-3 flex items-center justify-center xl:justify-start gap-3 w-full p-2.5 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-medium text-sm border border-transparent hover:border-rose-500/20">
              {Icons.logout}
              <span className="hidden xl:block">Disconnect</span>
            </button>
          </div>
        </aside>

        {/* ════════════════════════════════
            CENTER FEED (BENTO STYLED)
        ════════════════════════════════ */}
        <main className={`flex-1 h-full overflow-y-auto custom-scroll rounded-[2rem] relative ${panel !== "feed" ? "hidden lg:block lg:max-w-none" : "block"} transition-all duration-500`}>
          <div className="max-w-[640px] w-full mx-auto pb-20 pt-2 md:pt-4 space-y-6">

            {/* Create Post Bento Box */}
            <div className="group relative rounded-[2rem] bg-[#0a0d1a]/60 backdrop-blur-2xl border border-white/10 p-1 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/20 afu">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="bg-[#05070e]/80 rounded-[1.8rem] p-5 relative z-10 space-y-4">
                <div className="flex gap-4">
                  <div className="pt-1"><Av name={currentUser.name || "?"} size="w-12 h-12" text="text-lg" /></div>
                  <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder={`Transmit your thoughts, ${currentUser.name?.split(" ")[0] || "explorer"}...`}
                    rows={2}
                    className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:placeholder-gray-600 transition-all font-medium leading-relaxed"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5 ml-[60px]">
                  <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] px-4 py-2.5 transition-all border border-transparent focus-within:border-white/10 focus-within:bg-white/[0.03]">
                    <span className="text-indigo-400">{Icons.image}</span>
                    <input type="text" value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                      placeholder="Attach image frequency (URL)"
                      className="flex-1 bg-transparent text-white placeholder-gray-600 text-xs font-semibold tracking-wide focus:outline-none" />
                  </div>
                  <button onClick={handlePost} disabled={posting || (!caption.trim() && !imgUrl.trim())}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-indigo-300 text-sm font-black disabled:opacity-30 disabled:hover:bg-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                    {posting ? <Spinner size={18} /> : <span className="flex items-center gap-1.5 uppercase tracking-wider">{Icons.send2} Send</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              {loadingFeed
                ? [1,2,3].map(i => <SkeletonPost key={i} />)
                : posts.length === 0
                  ? <EmptyState icon="✨" title="The void is empty" sub="Initiate the first transmission above." />
                  : posts.map((post, idx) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      myId={myId}
                      openComments={openCmt}
                      setOpenComments={setOpenCmt}
                      cmtText={cmtText}
                      setCmtText={setCmtText}
                      cmtBusy={cmtBusy}
                      onLike={handleLike}
                      onComment={handleComment}
                      onDelete={handleDelete}
                      onMessage={openDirectMessage}
                      onShareToDM={handleShareToDM}
                      onViewProfile={handleViewProfile}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    />
                  ))
              }
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loaderRef} className="py-6 flex justify-center pb-20">
              {loadingMore && <div className="text-indigo-400 bg-indigo-500/10 p-3 rounded-full"><Spinner size={24} /></div>}
              {!loadingMore && !loadingFeed && page >= totalPages && posts.length > 0 && (
                <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
                  <span className="w-12 h-px bg-gradient-to-r from-transparent to-gray-600"></span>
                  End of transmissions
                  <span className="w-12 h-px bg-gradient-to-l from-transparent to-gray-600"></span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ════════════════════════════════
            DYNAMIC RIGHT PANEL (GLASS WIDGET)
        ════════════════════════════════ */}
        <aside className={`${panel === "feed" ? "hidden lg:flex" : "flex"} flex-col w-full md:w-[380px] xl:w-[420px] h-full bg-[#0a0d1a]/50 backdrop-blur-[30px] border border-white/5 rounded-[2.5rem] flex-shrink-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 transform transition-all duration-500`}>

          {/* ── User profile viewer overlays everything else ── */}
          {viewUserId
            ? <UserProfilePanel
                userId={viewUserId}
                myId={myId}
                onClose={handleCloseProfile}
                onMessage={openDirectMessage}
                onViewProfile={handleViewProfile}
                onImageClick={setFullScreenImg}
              />
            : (
              <>
                {panel === "search" && (
                  <SearchPanel query={query} setQuery={setQuery} results={results} searching={searching} myId={myId} onMessage={openDirectMessage} onViewProfile={handleViewProfile} />
                )}
                {panel === "notifications" && (
                  <NotifsPanel notifs={notifs} unread={unread} onMark={markRead} onMessage={openDirectMessage} onViewProfile={handleViewProfile} />
                )}
                {panel === "messages" && (
                  <MessagesPanel
                    myId={myId} chats={chats} activeChat={activeChat} setActiveChat={setActiveChat}
                    msgs={msgs} setMsgs={setMsgs} msgText={msgText} setMsgText={setMsgText}
                    sendingMsg={sendingMsg} msgBottom={msgBottom} onLoadChat={loadChat}
                    onSend={handleSendMsg} onOpenDM={openDirectMessage} msgSearchQ={msgSearchQ}
                    setMsgSearchQ={setMsgSearchQ} msgSearchRes={msgSearchRes} msgSearching={msgSearching}
                  />
                )}
                {(panel === "profile" || panel === "feed") && ( // Show profile by default on desktop if panel is feed
                  <ProfilePanel profile={profile} currentUser={currentUser} myPosts={posts.filter(p => {
                    const uid = p.userId?._id || p.userId;
                    return uid === myId || uid?.toString() === myId;
                  })} onViewProfile={handleViewProfile} onEditProfile={() => {
                    setEditProfileData({ name: profile?.name || "", bio: profile?.bio || "", profilePic: profile?.profilePic || "" });
                    setEditProfile(true);
                  }} onImageClick={setFullScreenImg} />
                )}
              </>
            )
          }

        </aside>

        {/* ════════════════════════════════
            MOBILE BOTTOM NAVIGATION
        ════════════════════════════════ */}
        <nav className="md:hidden fixed bottom-5 left-4 right-4 z-[100] bg-[#0a0d1a]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
          {nav.map(item => (
            <button key={item.key} onClick={() => setPanel(item.key)}
              className={`relative p-3 rounded-2xl transition-all duration-300 active:scale-90 ${
                panel === item.key 
                  ? "bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-white shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]" 
                  : "text-gray-500 hover:text-white"
              }`}>
              {item.icon}
              {item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
              )}
            </button>
          ))}
          <button onClick={handleLogout} className="p-3 rounded-2xl text-gray-500 hover:text-rose-400 transition-all active:scale-90">
            {Icons.logout}
          </button>
        </nav>

        {/* ════ MODALS & OVERLAYS ════ */}

        {/* FULLSCREEN IMAGE */}
        {fullScreenImg && (
          <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-[fadeUpIn_0.3s_ease]" onClick={() => setFullScreenImg(null)}>
             <img src={fullScreenImg} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" alt="Fullscreen view" />
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {editProfile && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all" onClick={() => setEditProfile(false)}>
            <div className="bg-[#0a0d1a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.7)] transform animate-[zoomIn_0.3s_ease]" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg tracking-tight mb-4">Edit Profile</h3>
              <form onSubmit={handleEditProfileSubmit} className="space-y-3">
                <input type="text" value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} placeholder="Name" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500/50 outline-none" required />
                <textarea value={editProfileData.bio} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} placeholder="Bio Signature" rows={3} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500/50 outline-none custom-scroll resize-none" />
                <input type="text" value={editProfileData.profilePic} onChange={e => setEditProfileData({...editProfileData, profilePic: e.target.value})} placeholder="Avatar (URL)" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500/50 outline-none" />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditProfile(false)} className="flex-1 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 text-sm font-medium text-white transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-sm font-bold text-white transition-all">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT POST MODAL */}
        {editPost && (
          <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all" onClick={() => setEditPost(null)}>
            <div className="bg-[#0a0d1a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.7)] transform animate-[zoomIn_0.3s_ease]" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg tracking-tight mb-4">Edit Transmission</h3>
              <form onSubmit={handleEditPostSubmit} className="space-y-3">
                <textarea value={editPost.caption} onChange={e => setEditPost({...editPost, caption: e.target.value})} placeholder="Update thoughts..." rows={3} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500/50 outline-none custom-scroll resize-none" />
                <input type="text" value={editPost.image} onChange={e => setEditPost({...editPost, image: e.target.value})} placeholder="Image Frequency (URL)" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500/50 outline-none" />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditPost(null)} className="flex-1 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/10 text-sm font-medium text-white transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-sm font-bold text-white transition-all">Update Post</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* Global & Animations */
        * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
        
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: drift 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes fadeUpIn { from { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        .afu { animation: fadeUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        @keyframes toastIn { from { opacity:0; transform:translate(-50%, -20px) scale(0.9); filter: blur(5px); } to { opacity:1; transform:translate(-50%, 0) scale(1); filter: blur(0); } }
        @keyframes zoomIn { from { opacity:0; transform:scale(0.95); filter: blur(10px); } to { opacity:1; transform:scale(1); filter: blur(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes messagePop { from { opacity:0; transform:scale(0.95); transform-origin: left bottom; } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }
}

/* ══════════════════════════════════════════════════════
   POST CARD (ULTRA PREMIUM)
══════════════════════════════════════════════════════ */
function PostCard({ post, myId, openComments, setOpenComments, cmtText, setCmtText, cmtBusy, onLike, onComment, onDelete, onEdit, onMessage, onShareToDM, onViewProfile, onImageClick, style }) {
  const liked   = post.likes?.includes(myId);
  const isMe    = (post.userId?._id || post.userId) === myId || (post.userId?._id || post.userId)?.toString() === myId;
  const expanded = openComments[post._id];
  const authorName = post.userId?.name || "Unknown Entity";
  const myText   = cmtText[post._id] || "";

  return (
    <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-xl overflow-visible transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] afu" style={style}>
      
      {/* Decorative gradient blur behind post */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2rem] pointer-events-none" />

      {post.isShared && (
        <div className="px-6 pt-4 pb-0 text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          {Icons.share} Resonant Signal
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-3 relative z-10">
        <button className="flex items-center gap-4 text-left group/author" onClick={() => !isMe && onViewProfile(post.userId?._id || post.userId)}>
          <Av name={authorName} size="w-12 h-12" />
          <div>
            <p className="text-[15px] font-bold text-white group-hover/author:text-transparent group-hover/author:bg-clip-text group-hover/author:bg-gradient-to-r group-hover/author:from-indigo-300 group-hover/author:to-purple-300 transition-all">{authorName}</p>
            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">{Icons.clock} {ago(post.createdAt)}</p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          {!isMe && (
            <button onClick={() => onMessage(post.userId?._id || post.userId, authorName)}
              className="p-2.5 rounded-full text-gray-500 hover:text-white hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all active:scale-95">
              {Icons.msg}
            </button>
          )}
          {isMe && (
            <>
              <button onClick={() => onEdit && onEdit(post)} className="p-2.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all active:scale-95">
                {Icons.edit}
              </button>
              <button onClick={() => onDelete(post._id)}
                className="p-2.5 rounded-full text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all active:scale-95">
                {Icons.trash}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {post.caption && (
        <div className="px-6 pb-4">
          <p className="text-[15px] text-gray-200 leading-relaxed font-light">{post.caption}</p>
        </div>
      )}

      {/* Image (Edge to edge inside padding) */}
      {post.image && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl overflow-hidden border border-white/5 relative group/img">
            {/* Inner glow */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none z-10" />
            <img src={post.image} onClick={() => onImageClick && onImageClick(post.image)} alt="" className="w-full object-cover max-h-[500px] group-hover/img:scale-105 transition-transform duration-700 ease-out cursor-pointer" onError={e => e.target.style.display = "none"} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 py-3 flex gap-5 text-xs font-semibold tracking-wide text-gray-500 border-t border-white/[0.03]">
        <span className="flex items-center gap-1.5">{post.likes?.length || 0} Reacts</span>
        <span className="flex items-center gap-1.5">{post.comments?.length || 0} Replies</span>
      </div>

      {/* Action Bar */}
      <div className="flex border-t border-white/[0.03] p-1.5 relative z-10 bg-black/10 rounded-b-[2rem]">
        <ActionBtn 
          icon={Icons.heart(liked)} 
          label={liked ? "Liked" : "Like"} 
          active={liked} 
          className={`hover:bg-rose-500/10 ${liked ? "text-rose-400 !font-bold" : "text-gray-400 hover:text-rose-300"}`} 
          onClick={() => onLike(post._id)} 
        />
        <ActionBtn 
          icon={Icons.comment} 
          label="Reply" 
          active={expanded} 
          className={`hover:bg-indigo-500/10 ${expanded ? "text-indigo-400 !font-bold bg-indigo-500/5" : "text-gray-400 hover:text-indigo-300"}`} 
          onClick={() => setOpenComments(c => ({ ...c, [post._id]: !c[post._id] }))} 
        />
        <ActionBtn 
          icon={Icons.share} 
          label="Transmit" 
          className="text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400" 
          onClick={() => onShareToDM(post)} 
        />
      </div>

      {/* Comments Drawer (Glass) */}
      {expanded && (
        <div className="border-t border-white/[0.05] p-4 space-y-4 bg-white/[0.01] rounded-b-[2rem] animate-[fadeUpIn_0.3s_ease]">
          {post.comments?.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scroll">
              {post.comments.map((c, i) => (
                <div key={i} className="flex gap-3 items-start group/cmt">
                  <Av name={c.userId?.name || "U"} size="w-8 h-8" text="text-[11px]" />
                  <div className="flex-1 rounded-[1.25rem] rounded-tl-sm px-4 py-3 bg-white/[0.03] border border-white/5 group-hover/cmt:bg-white/[0.05] transition-colors">
                    <p className="text-[13px] font-bold text-white mb-0.5">{c.userId?.name || "Entity"}</p>
                    <p className="text-[13px] text-gray-300 font-light leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 pt-2">
            <Av name={myId || "U"} size="w-8 h-8" />
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 focus-within:border-indigo-500/50 focus-within:bg-black/40 transition-all shadow-inner">
              <input type="text" value={myText}
                onChange={e => setCmtText(c => ({ ...c, [post._id]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && onComment(post._id)}
                placeholder="Broadcast a reply..."
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none" />
              <button onClick={() => onComment(post._id)} disabled={cmtBusy[post._id] || !myText.trim()}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/[0.05] transition-all hover:scale-110 active:scale-90">
                {cmtBusy[post._id] ? <Spinner size={14} /> : Icons.send2}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, className = "", onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-95 ${className}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   SEARCH PANEL (MINIMAL)
══════════════════════════════════════════════════════ */
function SearchPanel({ query, setQuery, results, searching, onViewProfile }) {
  return (
    <div className="flex flex-col h-full animate-[slideInRight_0.3s_ease]">
      <div className="px-6 pt-8 pb-5 border-b border-white/5 relative z-10">
        <h2 className="text-2xl font-black mb-5 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Explore Network</h2>
        <div className="flex items-center gap-3 rounded-2xl bg-black/20 border border-white/10 px-5 py-3.5 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
          <span className="text-gray-400">{Icons.search}</span>
          <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search entities by name..."
            className="flex-1 bg-transparent text-white placeholder-gray-600 font-medium focus:outline-none" />
          {searching && <Spinner size={16} />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-4 pb-28 md:pb-4">
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map(u => (
              <div key={u._id} onClick={() => onViewProfile(u._id)} 
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all group cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl">
                <Av name={u.name} size="w-12 h-12" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{u.bio || "No bio signature"}</p>
                  <div className="flex gap-3 mt-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    <span>{u.followersCount} Followers</span>
                    <span>{u.followingCount} Following</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-45">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (!searching && query) ? (
          <EmptyState icon="🛸" title="Ghost town" sub={`No signals match "${query}"`} />
        ) : (
          <EmptyState icon="🔭" title="Search the void" sub="Enter coordinates to begin" />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
══════════════════════════════════════════════════════ */
function NotifsPanel({ notifs, unread, onMark, onMessage, onViewProfile }) {
  const handleClick = (n) => {
    if (!n.isRead) onMark(n._id);
    if (!n.senderId || typeof n.senderId !== "object") return;
    
    if (n.type === "message") {
      onMessage(n.senderId._id, n.senderId.name);
    } else {
      onViewProfile(n.senderId._id);
    }
  };

  return (
    <div className="flex flex-col h-full animate-[slideInRight_0.3s_ease]">
      <div className="px-6 pt-8 pb-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Notifications</h2>
        {unread > 0 && <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]">{unread} Pings</span>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2 pb-28 md:pb-4">
        {notifs.length === 0
          ? <EmptyState icon="🌌" title="Quiet sector" sub="No signals detected yet" />
          : notifs.map(n => (
            <div key={n._id} onClick={() => handleClick(n)}
              className={`relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                !n.isRead 
                  ? "bg-indigo-500/10 border border-indigo-500/20 shadow-[0_5px_20px_rgba(99,102,241,0.1)]" 
                  : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]"
              }`}>
              <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-xl shadow-inner ${!n.isRead ? "bg-indigo-500/20" : "bg-black/20"}`}>
                {NOTIF_EMOJI[n.type] || "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] leading-tight ${!n.isRead ? "text-white font-medium" : "text-gray-300"}`}>
                  <span className="font-bold">{n.senderId?.name || "Entity"}</span> <span className="text-indigo-300">{NOTIF_COPY[n.type] || n.type}</span>
                </p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">{ago(n.createdAt)} ago</p>
              </div>
              {!n.isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,1)] animate-ping" />}
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MESSAGES PANEL (NEUMORPHIC / GLASS)
══════════════════════════════════════════════════════ */
function MessagesPanel({ myId, chats, activeChat, setActiveChat, msgs, setMsgs, msgText, setMsgText, sendingMsg, msgBottom, onLoadChat, onSend, onOpenDM, msgSearchQ, setMsgSearchQ, msgSearchRes, msgSearching }) {

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full animate-[slideInRight_0.3s_ease]">
        <div className="px-6 pt-8 pb-5 border-b border-white/5">
          <h2 className="text-2xl font-black mb-5 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Comms Link</h2>
          <div className="flex items-center gap-3 rounded-2xl bg-black/20 border border-white/10 px-5 py-3.5 focus-within:border-indigo-500/50 transition-all">
            <span className="text-gray-400">{Icons.search}</span>
            <input type="text" value={msgSearchQ} onChange={e => setMsgSearchQ(e.target.value)}
              placeholder="Find entity to establish link..."
              className="flex-1 bg-transparent text-white placeholder-gray-600 font-medium focus:outline-none" />
            {msgSearching && <Spinner size={16} />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2 pb-28 md:pb-4">
          {msgSearchQ && msgSearchRes.map(u => (
            <button key={u._id} onClick={() => onOpenDM(u._id, u.name)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all text-left group">
              <div className="relative">
                <Av name={u.name} size="w-12 h-12" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-[#0a0d1a] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">Initialize connection</p>
              </div>
            </button>
          ))}

          {!msgSearchQ && (chats.length === 0
            ? <EmptyState icon="📡" title="No active links" sub='Search to establish a comms link' />
            : chats.map((chat, idx) => {
                const other = chat.memberDetails?.find(m => m?._id?.toString() !== myId);
                if (!other) return null;
                return (
                  <button key={chat._id} onClick={() => onLoadChat(chat)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/5 transition-all text-left animate-[fadeUpIn_0.4s_ease_both] group"
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                    <Av name={other.name || "U"} size="w-12 h-12" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors">{other.name}</p>
                      <p className="text-[12px] text-gray-500 truncate mt-0.5 font-medium">Encrypted channel ready</p>
                    </div>
                  </button>
                );
              })
          )}
          {msgSearchQ && !msgSearching && msgSearchRes.length === 0 && <EmptyState icon="🕵️" title="No entities found" />}
        </div>
      </div>
    );
  }

  /* ── CHAT DETAIL VIEW ── */
  return (
    <div className="flex flex-col h-full bg-[#03050a]/40 shadow-inner animate-[slideInRight_0.2s_ease]">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl z-10">
        <button onClick={() => setActiveChat(null)} className="p-2.5 rounded-xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          {Icons.back}
        </button>
        <Av name={activeChat.otherName || "U"} size="w-10 h-10" />
        <div>
          <p className="font-bold text-[15px] text-white tracking-wide">{activeChat.otherName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/80">Link Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 custom-scroll">
        {msgs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-semibold tracking-wide text-white mb-1">Channel Secured</p>
            <p className="text-xs text-gray-500">Say hello to {activeChat.otherName}</p>
          </div>
        )}
        {msgs.map((m, i) => {
          const mine = m.senderId?.toString() === myId || m.senderId === myId;
          const sharedPost = m.sharedPostId;
          return (
            <div key={m._id || i} className={`flex w-full ${mine ? "justify-end" : "justify-start"} animate-[messagePop_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]`}>
              <div className={`max-w-[85%] space-y-1.5 flex flex-col ${mine ? "items-end" : "items-start"}`}>
                
                {sharedPost && (
                  <div className={`rounded-2xl border border-white/10 p-3 text-xs w-full max-w-[240px] overflow-hidden ${mine ? "bg-indigo-600/20 backdrop-blur-md" : "bg-white/[0.05]"}`}>
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-indigo-300 tracking-wider">
                      {Icons.share} <span className="mt-[1px]">Data Packet</span>
                    </div>
                    {sharedPost.image && (
                      <img src={sharedPost.image} className="rounded-xl w-full object-cover h-32 mb-2 border border-white/10" onError={e => e.target.style.display="none"} alt="" />
                    )}
                    {sharedPost.caption && <p className="text-gray-200 line-clamp-2 leading-relaxed">{sharedPost.caption}</p>}
                  </div>
                )}
                
                {m.text && (
                  <div className={`px-5 py-3 rounded-[1.5rem] text-[14px] leading-relaxed font-medium shadow-md ${
                    mine
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-[0_5px_15px_rgba(99,102,241,0.3)]"
                      : "bg-[#121626] text-gray-200 border border-white/5 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                )}
                <span className="text-[9px] font-bold tracking-widest text-gray-600 uppercase px-1">{ago(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={msgBottom} />
      </div>

      {/* Input */}
      <div className="p-4 pb-28 md:pb-4 bg-white/[0.01] border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2 bg-[#0a0d1a]/80 shadow-inner rounded-2xl border border-white/10 p-1.5 focus-within:border-indigo-500/50 transition-all">
          <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Transmit message..."
            className="flex-1 bg-transparent px-4 text-white placeholder-gray-600 text-[14px] font-medium focus:outline-none" />
          <button onClick={() => onSend()} disabled={sendingMsg || !msgText.trim()}
            className="p-3 rounded-xl bg-white text-[#0a0d1a] hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-30 disabled:hover:bg-white disabled:hover:shadow-none transition-all hover:scale-105 active:scale-95">
            {sendingMsg ? <Spinner size={16} /> : Icons.send2}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BENTO PROFILE PANELS
══════════════════════════════════════════════════════ */

function ProfilePanel({ profile, currentUser, myPosts, onViewProfile, onEditProfile, onImageClick }) {
  const [subView, setSubView] = useState("posts"); // "posts", "followers", "following"
  
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll animate-[slideInRight_0.3s_ease] pb-28 md:pb-0">
      {/* Dynamic Banner */}
      <div className="h-32 bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 relative overflow-hidden flex-shrink-0">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] mix-blend-overlay"></div>
         <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#0a0d1a] to-transparent"></div>
      </div>

      <div className="px-6 pb-6 relative z-10">
        <div className="flex justify-between items-end -mt-12 mb-6">
          <div className="ring-[6px] ring-[#0a0d1a] rounded-[1.8rem] bg-[#0a0d1a] shadow-2xl">
             <Av name={currentUser.name || "?"} size="w-24 h-24" text="text-3xl" />
          </div>
          <button onClick={onEditProfile} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white shadow-lg backdrop-blur-md active:scale-95 transition-all outline-none flex items-center gap-2">
            {Icons.edit} Edit Identity
          </button>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-4">{profile?.name || currentUser.name}</h2>
        
        {profile?.bio && <p className="text-[14px] text-gray-300 font-medium leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-2xl">{profile.bio}</p>}
        {profile?.description && <p className="text-[12px] text-gray-500 mt-3">{profile.description}</p>}

        {/* Bento Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
          {[
            { v: profile?.followersCount ?? 0, l: "Followers", k: "followers" },
            { v: profile?.followingCount ?? 0, l: "Following", k: "following" },
            { v: myPosts.length,               l: "Posts",     k: "posts"     },
          ].map((s, i) => (
            <div key={s.l} onClick={() => setSubView(s.k)} 
              className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.03] ${
                subView === s.k 
                  ? 'bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                  : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
              }`}>
              <p className={`font-black text-xl mb-1 ${subView === s.k ? 'text-indigo-300' : 'text-white'}`}>{s.v}</p>
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="animate-[fadeUpIn_0.3s_ease]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              {subView === "posts" ? "Transmission Log" : subView === "followers" ? "Network Listeners" : "Tracking"}
            </h3>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          
          {subView === "posts" && (
            myPosts.length === 0 ? <EmptyState icon="📸" title="Blank slate" /> : (
              <div className="grid grid-cols-3 gap-2">
                {myPosts.slice(0, 9).map((p, idx) => (
                  <div key={p._id} className="aspect-square rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-black/20 relative group/post animate-[fadeUpIn_0.4s_ease_both]" style={{ animationDelay: `${idx*0.05}s` }}>
                    {p.image ? (
                      <>
                        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover/post:opacity-100 transition-opacity z-10 mix-blend-overlay cursor-pointer" onClick={() => onImageClick && onImageClick(p.image)}></div>
                        <img src={p.image} onClick={() => onImageClick && onImageClick(p.image)} className="w-full h-full object-cover group-hover/post:scale-110 transition-transform duration-500 cursor-pointer" onError={e=>e.target.style.display="none"} alt="" />
                      </>
                    ) : (
                      <p className="text-[11px] font-medium text-gray-400 p-3 text-center line-clamp-4 leading-relaxed group-hover/post:text-white transition-colors">{p.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {(subView === "followers" || subView === "following") && (
            <div className="space-y-2">
              {(subView === "followers" ? profile?.followers : profile?.following)?.length === 0 ? (
                <EmptyState icon="👻" title="No contacts found" />
              ) : (
                (subView === "followers" ? profile?.followers : profile?.following)?.map((u, idx) => (
                  <div key={u._id} onClick={() => onViewProfile(u._id)} 
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer hover:scale-[1.02] group animate-[fadeUpIn_0.3s_ease_both]" style={{ animationDelay: `${idx*0.05}s` }}>
                    <Av name={u.name} size="w-10 h-10" />
                    <p className="flex-1 text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                    <span className="text-gray-600 group-hover:text-white transition-colors rotate-0 group-hover:-rotate-45 transform duration-300">
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserProfilePanel({ userId, myId, onClose, onMessage, onViewProfile, onImageClick }) {
  const [profile, setProfile]         = useState(null);
  const [userPosts, setUserPosts]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [following, setFollowing]     = useState(false);
  const [followBusy, setFollowBusy]   = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [subView, setSubView]         = useState("posts");

  useEffect(() => {
    if (!userId) return;
    setLoading(true); setProfile(null); setUserPosts([]); setSubView("posts");
    Promise.all([ API.get(`/users/profile/${userId}`), API.get(`/posts?limit=50`) ])
    .then(([pRes, feedRes]) => {
      const p = pRes.data;
      setProfile(p);
      setFollowCount(p.followersCount ?? 0);
      setFollowing(p.followers?.some(f => (f._id || f)?.toString() === myId));
      setUserPosts((feedRes.data.posts || []).filter(post => {
        const uid = post.userId?._id || post.userId;
        return uid?.toString() === userId?.toString();
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId, myId]);

  const handleFollow = async () => {
    setFollowBusy(true);
    try {
      if (following) {
        await API.put(`/users/unfollow/${userId}`);
        setFollowing(false); setFollowCount(c => Math.max(0, c - 1));
      } else {
        await API.put(`/users/follow/${userId}`);
        setFollowing(true); setFollowCount(c => c + 1);
      }
    } catch {} finally { setFollowBusy(false); }
  };

  return (
    <div className="flex flex-col h-full animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      {/* Top bar (Glass header) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center pointer-events-none">
        <button onClick={onClose} className="pointer-events-auto p-3 rounded-2xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 shadow-lg transition-all active:scale-90 border border-white/10 hover:border-white/20">
          {Icons.back}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 animate-pulse">Scanning Data...</p>
        </div>
      ) : !profile ? (
        <EmptyState icon="🛸" title="Entity vanished" sub="Could not establish connection" />
      ) : (
        <div className="flex-1 overflow-y-auto custom-scroll relative">
          
          {/* Banner */}
          <div className="h-44 bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 relative flex-shrink-0">
             <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
             <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-[#0a0d1a] to-transparent"></div>
          </div>

          <div className="px-6 pb-8 relative z-10">
            <div className="flex justify-between items-end -mt-16 mb-5">
              <div className="ring-[6px] ring-[#0a0d1a] rounded-[1.8rem] bg-[#0a0d1a] shadow-2xl shrink-0">
                <Av name={profile.name || "?"} size="w-[100px] h-[100px]" text="text-4xl" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleFollow} disabled={followBusy}
                  className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all shadow-lg active:scale-95 ${
                    following
                      ? "bg-white/10 border border-white/20 text-white hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40"
                      : "bg-white text-black hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  }`}>
                  {followBusy ? <Spinner size={16} /> : following ? "Following ✓" : "Follow"}
                </button>
                <button onClick={() => onMessage(userId, profile.name)}
                  className="p-2.5 rounded-2xl border border-white/10 bg-white/[0.02] text-white hover:bg-white/10 transition-all shadow-lg active:scale-95">
                  {Icons.msg}
                </button>
              </div>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{profile.name}</h2>
            <p className="text-[13px] font-bold text-indigo-400 mb-4">{profile.email}</p>
            
            {profile.bio && <p className="text-[14px] text-gray-200 mt-2 leading-relaxed bg-white/[0.03] border border-white/5 p-4 rounded-2xl">{profile.bio}</p>}
            {profile.description && <p className="text-[12px] text-gray-500 mt-3">{profile.description}</p>}

            {/* Bento Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
              {[
                { v: followCount,               l: "Followers", k: "followers" },
                { v: profile.followingCount ?? 0, l: "Following", k: "following" },
                { v: userPosts.length,          l: "Posts",     k: "posts"     },
              ].map(s => (
                <div key={s.l} onClick={() => setSubView(s.k)} 
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.03] ${
                    subView === s.k 
                      ? 'bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
                  }`}>
                  <p className={`font-black text-xl mb-1 ${subView === s.k ? 'text-indigo-300' : 'text-white'}`}>{s.v}</p>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className="animate-[fadeUpIn_0.3s_ease]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{subView}</h3>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              {subView === "posts" && (
                userPosts.length === 0 ? <EmptyState icon="📭" title="No broadcasts" /> : (
                  <div className="grid grid-cols-3 gap-2">
                    {userPosts.slice(0, 9).map((p, idx) => (
                      <div key={p._id} className="aspect-square rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-black/20 group/post animate-[fadeUpIn_0.4s_ease_both]" style={{ animationDelay: `${idx*0.05}s` }}>
                        {p.image ? (
                           <>
                             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/post:opacity-100 transition-opacity z-10 mix-blend-overlay cursor-pointer" onClick={() => onImageClick && onImageClick(p.image)}></div>
                             <img src={p.image} onClick={() => onImageClick && onImageClick(p.image)} className="w-full h-full object-cover group-hover/post:scale-110 transition-transform duration-500 cursor-pointer" onError={e=>e.target.style.display="none"} alt="" />
                           </>
                        ) : (
                          <p className="text-[11px] text-gray-400 p-3 text-center line-clamp-4 leading-relaxed group-hover/post:text-white transition-colors">{p.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {(subView === "followers" || subView === "following") && (
                <div className="space-y-2">
                  {(subView === "followers" ? profile?.followers : profile?.following)?.length === 0 ? (
                    <EmptyState icon="🕸️" title="Space is empty" />
                  ) : (
                    (subView === "followers" ? profile?.followers : profile?.following)?.map((u, idx) => (
                      <div key={u._id} onClick={() => onViewProfile(u._id)} 
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer hover:scale-[1.02] group animate-[fadeUpIn_0.3s_ease_both]" style={{ animationDelay: `${idx*0.05}s` }}>
                        <Av name={u.name} size="w-10 h-10" />
                        <p className="flex-1 text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                        <span className="text-gray-600 group-hover:text-white transition-colors rotate-0 group-hover:-rotate-45 transform duration-300">
                           <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TINY SHARED COMPONENTS
══════════════════════════════════════════════════════ */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-[fadeUpIn_0.5s_ease]">
      <div className="w-20 h-20 bg-white/[0.02] border border-white/5 shadow-inner flex items-center justify-center rounded-[2rem] mb-5">
        <span className="text-4xl filter drop-shadow-lg">{icon}</span>
      </div>
      <p className="font-bold text-white text-lg tracking-tight mb-1">{title}</p>
      {sub && <p className="text-[13px] font-medium text-gray-500">{sub}</p>}
    </div>
  );
}

function SkeletonPost() {
  return (
    <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 animate-pulse space-y-4 shadow-sm">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-white/10 rounded-full w-1/3" />
          <div className="h-2.5 bg-white/5 rounded-full w-1/5" />
        </div>
      </div>
      <div className="h-3 bg-white/10 rounded-full w-3/4" />
      <div className="h-3 bg-white/10 rounded-full w-1/2" />
      <div className="h-64 bg-white/5 rounded-2xl w-full" />
    </div>
  );
}
