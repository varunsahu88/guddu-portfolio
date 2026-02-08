import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { 
  ArrowUpRight, ChevronRight, Github, Lock, Unlock, X, Menu, 
  Sparkles, PenTool, Activity, Bot, Target, User, Upload, Loader2, 
  ImageIcon as ImageIconLucide, Trash2, Layers, Cpu, Trophy, Flame, Quote, 
  MessageSquare, ChevronDown, Mail, Phone, Send 
} from 'lucide-react';

// Firebase config - Guddu Portfolio
const firebaseConfig = {
  apiKey: "AIzaSyCGdqMMEEIE8jugPoXiF9RE-oqm9yy8uCY",
  authDomain: "guddu-portfolio.firebaseapp.com",
  projectId: "guddu-portfolio",
  storageBucket: "guddu-portfolio.firebasestorage.app",
  messagingSenderId: "419842562841",
  appId: "1:419842562841:web:6f7453e51a16a5a21a8388",
  measurementId: "G-24QZBYXKSV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false },
  transition: { duration: 0.6 }
};

const titleContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } }
};

const titleLine = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

// Static data
const navLinks = [
  { name: "Work", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" }
];

const skills = ["FIGMA", "REACT", "NEXT.JS", "TAILWIND", "FIREBASE", "FRAMER MOTION", "AI TOOLS", "UI/UX"];

const experiences = [
  { year: "2024", role: "AI Builder", company: "Self", desc: "Building with AI tools and learning by doing." },
  { year: "2023", role: "UI/UX Designer", company: "Freelance", desc: "Creating clean interfaces and design systems." },
  { year: "2022", role: "Student", company: "Delhi", desc: "Started the journey into design and development." }
];

const testimonials = [
  { name: "Client A", role: "Startup Founder", text: "Great work on the UI. Clean and professional." },
  { name: "Client B", role: "Developer", text: "Easy to work with and delivers on time." }
];

const faqs = [
  { q: "What tools do you use?", a: "Figma for design, React/Next.js for development, and AI tools like Claude for building." },
  { q: "How long does a project take?", a: "Depends on scope. Usually 1-2 weeks for a complete website." },
  { q: "Do you do revisions?", a: "Yes, unlimited revisions until you're happy." }
];

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({ uid: 'demo-user' });
  
  const [projects, setProjects] = useState([]);
  const [newProjName, setNewProjName] = useState("");
  const [newProjLink, setNewProjLink] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const [profileData, setProfileData] = useState({ imageUrl: "" });
  const [isUpdatingImg, setIsUpdatingImg] = useState(false);
  
  const [roastInput, setRoastInput] = useState("");
  const [roastResult, setRoastResult] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hey! Main Guddu ka AI twin hoon. Kuch puchna hai?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [contactDraftInput, setContactDraftInput] = useState("");
  const [contactDraftResult, setContactDraftResult] = useState("");
  
  const [openFaq, setOpenFaq] = useState(null);
  
  const chatEndRef = useRef(null);
  const dotControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Firebase listeners (simplified for backup)
  useEffect(() => {
    try {
      const projCol = collection(db, 'artifacts', appId, 'public', 'data', 'projects');
      const unsub = onSnapshot(projCol, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjects(data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      }, (err) => console.log('Projects listener error:', err));
      return () => unsub();
    } catch (e) {
      console.log('Firebase not configured:', e);
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === "guddu88") {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPass("");
      setAdminError("");
    } else {
      setAdminError("Wrong password bhai!");
    }
  };

  const startSimpleBounce = () => {
    dotControls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    });
  };

  const handleDotClick = () => {
    dotControls.start({
      rotate: [0, 360],
      scale: [1, 1.5, 1],
      transition: { duration: 0.8 }
    });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjName || !newProjLink || !isAdmin || !user) return;
    setIsAdding(true);
    try {
      const projCol = collection(db, 'artifacts', appId, 'public', 'data', 'projects');
      await addDoc(projCol, {
        title: String(newProjName),
        link: String(newProjLink),
        desc: String(newProjDesc),
        cat: "BUILD",
        timestamp: Date.now()
      });
      setNewProjName("");
      setNewProjLink("");
      setNewProjDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!isAdmin || !user) return;
    if (!window.confirm("Bhai remove kar dein?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', id));
    } catch (err) {
      console.error("Remove failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdatingImg(true);
    // Simplified - just create object URL for demo
    const url = URL.createObjectURL(file);
    setProfileData({ imageUrl: url });
    setIsUpdatingImg(false);
  };

  const handleRoast = async () => {
    if (!roastInput.trim()) return;
    setIsRoasting(true);
    // Simulated roast response
    setTimeout(() => {
      setRoastResult(`"${roastInput}"? Bhai pehle basics seekh lo, phir bade sapne dekho. Just kidding, keep grinding! 🔥`);
      setIsRoasting(false);
    }, 1500);
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);
    // Simulated AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Interesting question about "${userMsg}"! Main Guddu ka AI twin hoon - design aur building ke baare mein kuch bhi pucho.` 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleDraftContact = async () => {
    if (!contactDraftInput.trim()) return;
    // Simulated draft
    setContactDraftResult(`Subject: Project Inquiry\n\nHi Guddu,\n\nI'm interested in discussing: ${contactDraftInput}\n\nLooking forward to connecting!\n\nBest regards`);
  };

  const ProjectCard = ({ p, isStatic = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      className="group relative bg-zinc-900 border border-zinc-800 p-4 md:p-8 rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden h-[160px] md:h-[420px] flex flex-col justify-end shadow-lg transition-all font-black uppercase"
    >
      <a href={String(p.link)} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </a>
      {isAdmin && !isStatic && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProject(p.id); }}
          className="absolute top-4 left-4 p-2 bg-black/60 text-red-500 rounded-full hover:bg-red-500 transition-all z-30 border border-white/5 shadow-xl"
        >
          <Trash2 size={16} />
        </button>
      )}
      <ArrowUpRight className="absolute top-4 right-4 md:top-8 md:right-8 text-zinc-700 group-hover:text-white transition-all w-4 h-4 md:w-7 md:h-7" />
      <div className="relative z-10 pointer-events-none text-left font-black uppercase">
        <p className="text-orange-500 text-[7px] md:text-[9px] tracking-[0.2em] mb-1 md:mb-2">{String(p.cat)}</p>
        <h3 className="text-xs md:text-3xl font-black truncate text-white">{String(p.title)}</h3>
        {p.desc && <p className="hidden md:block text-[8px] md:text-xs text-zinc-500 mt-1 md:mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium leading-relaxed">{String(p.desc)}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white scroll-smooth overflow-x-hidden font-black uppercase">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[10%] left-[5%] w-[50vw] h-[50vw] bg-orange-600 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.08, 0.03], x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] bg-blue-600 rounded-full blur-[150px]"
        />
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 font-black uppercase">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-orange-500 font-black uppercase text-[10px] tracking-widest uppercase">
                  <Lock size={16} className="inline mr-2" /> Admin Access
                </div>
                <button onClick={() => setShowAdminModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-orange-500 outline-none font-black uppercase"
                  autoFocus
                />
                {adminError && <p className="text-red-500 text-[10px] text-center">{adminError}</p>}
                <button type="submit" className="w-full bg-orange-500 py-3 rounded-xl uppercase font-black text-xs text-white">Unlock</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col items-center justify-center font-black uppercase"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 text-white bg-zinc-900 rounded-full border border-zinc-800 shadow-xl">
              <X size={24} />
            </button>
            <div className="flex flex-col gap-10 items-center justify-center text-center w-full">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-3xl text-white font-black uppercase tracking-widest hover:text-orange-500 transition-colors">
                  {link.name}
                </a>
              ))}
              <div className="flex gap-6 mt-6">
                <a href="https://github.com/varunsahu88" target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-white hover:border-orange-500 transition-all shadow-xl">
                  <Github size={28} />
                </a>
                <button onClick={() => { setShowAdminModal(true); setIsMenuOpen(false); }} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-white hover:border-orange-500 transition-all shadow-xl">
                  <Lock size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl py-3 border-b border-zinc-800' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-black tracking-tighter">
            GS<span className="text-orange-500 font-black">.</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            {navLinks.map(l => (
              <a key={l.name} href={l.href} className="text-zinc-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110 active:scale-95">
                {l.name}
              </a>
            ))}
            <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)}>
              {isAdmin ? <Unlock size={16} className="text-orange-500" /> : <Lock size={16} />}
            </button>
            <a href="#contact" className="bg-zinc-100 text-black px-6 py-2 rounded-full uppercase font-black text-[9px] hover:bg-orange-500 hover:text-white transition-all font-black uppercase">
              Hire Me
            </a>
          </div>
          <button className="md:hidden text-white relative z-50 p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-12 text-center z-10 font-black uppercase">
        <motion.div onViewportEnter={() => startSimpleBounce()} viewport={{ once: false, amount: 0.1 }} className="w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: false }}
            className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black text-orange-500 uppercase mb-3 tracking-[0.3em] shadow-xl mt-28"
          >
            <Sparkles size={10} className="inline mr-2" />
            <span>Damn Sure</span> Execution
          </motion.div>
          <motion.h1 variants={titleContainer} initial="initial" whileInView="animate" viewport={{ once: false }} className="text-[4rem] sm:text-[6rem] md:text-[12.5rem] font-black tracking-tighter leading-[0.85] select-none mb-2 font-black uppercase">
            <div className="overflow-hidden">
              <motion.span variants={titleLine} className="bg-gradient-to-b from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent block font-black uppercase">GUDDU</motion.span>
            </div>
            <div className="overflow-hidden flex items-baseline justify-center relative">
              <div className="w-5 h-5 md:w-11 md:h-11 mr-1.5 md:mr-4 opacity-0 pointer-events-none" />
              <motion.span variants={titleLine} className="bg-gradient-to-r from-orange-400 via-orange-600 to-red-600 bg-clip-text text-transparent block font-black uppercase">SAHU</motion.span>
              <motion.div
                animate={dotControls}
                onClick={handleDotClick}
                className="w-5 h-5 md:w-11 md:h-11 bg-orange-500 rounded-full ml-1.5 md:ml-4 cursor-pointer shadow-[0_0_40px_rgba(249,115,22,0.8)] border-2 border-white/20"
              />
            </div>
          </motion.h1>
          <motion.div {...fadeInUp} className="text-base sm:text-2xl md:text-4xl font-bold tracking-tight text-zinc-400 mt-4 font-black uppercase">
            Designer <span className="text-orange-500 italic">by Heart.</span> | Builder <span className="text-orange-500 italic">by AI.</span>
          </motion.div>
          <motion.p {...fadeInUp} className="max-w-xl text-[11px] md:text-lg text-zinc-500 font-light mt-4 leading-relaxed opacity-80 italic lowercase px-4 font-black uppercase">
            I architect clean UI/UX using Figma & AI tools. PRD oriented results, 100% certainty.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10 md:mt-12">
            <a href="#projects" className="group bg-white text-black px-8 md:px-12 py-3 md:py-4 rounded-[1rem] font-black text-[10px] md:text-[11px] tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center gap-3 font-black uppercase">
              Work <ChevronRight size={16} />
            </a>
            <a href="https://github.com/varunsahu88" target="_blank" rel="noopener noreferrer" className="bg-zinc-900 border border-zinc-800 text-white px-8 md:px-12 py-3 md:py-4 rounded-[1rem] font-black text-[10px] md:text-[11px] tracking-[0.2em] hover:border-orange-500/50 transition-all flex items-center gap-3 shadow-xl font-black uppercase">
              <Github size={16} className="text-orange-500" /> GitHub
            </a>
          </div>
          <motion.div {...fadeInUp} transition={{ delay: 1.4 }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-5xl opacity-60 font-black uppercase">
            <div className="flex flex-col items-center gap-2"><PenTool size={20} className="text-orange-500" /><span className="text-[9px] font-black tracking-widest text-zinc-500 font-black uppercase">Pixel <span className="text-orange-500">Perfect</span></span></div>
            <div className="flex flex-col items-center gap-2"><Activity size={20} className="text-orange-500" /><span className="text-[9px] font-black tracking-widest text-zinc-500 font-black uppercase">High <span className="text-orange-500">Fluidity</span></span></div>
            <div className="flex flex-col items-center gap-2"><Bot size={20} className="text-orange-500" /><span className="text-[9px] font-black tracking-widest text-zinc-500 font-black uppercase">AI <span className="text-orange-500">Partnered</span></span></div>
            <div className="flex flex-col items-center gap-2"><Target size={20} className="text-orange-500" /><span className="text-[9px] font-black tracking-widest text-zinc-500 font-black uppercase">Pure <span className="text-orange-500">Certainty</span></span></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Scroll */}
      <section className="py-10 border-y border-zinc-900 bg-zinc-900/5 relative overflow-hidden font-black uppercase font-black uppercase">
        <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-20 whitespace-nowrap px-10">
          {[...skills, ...skills, ...skills].map((s, i) => (
            <span key={i} className="text-[10px] md:text-[12px] font-black text-zinc-600 tracking-[0.5em] hover:text-orange-500 transition-all cursor-default font-black uppercase">{String(s)}</span>
          ))}
        </motion.div>
      </section>

      {/* Identity Section */}
      <section id="about" className="py-16 md:py-32 px-6 relative z-10 font-black uppercase">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="relative order-2 md:order-1">
            <div className="aspect-square bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-800 flex items-center justify-center overflow-hidden relative group shadow-2xl font-black uppercase">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {profileData.imageUrl ? (
                <img src={profileData.imageUrl} alt="Guddu Sahu" className="w-full h-full object-cover" />
              ) : (
                <User size={80} className="text-zinc-800 font-black uppercase" />
              )}
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-left z-10 font-black uppercase">
                <p className="text-[8px] md:text-[10px] uppercase text-orange-500 tracking-widest">Identity</p>
                <h4 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Guddu Sahu</h4>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-6 p-4 md:p-6 bg-zinc-900/80 border border-orange-500/30 rounded-3xl backdrop-blur-xl shadow-2xl font-black uppercase">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase text-orange-500"><Upload size={14} /> Update Identity Photo</div>
                <label className="flex flex-col items-center justify-center w-full h-24 md:h-28 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer bg-black/40 hover:border-orange-500/50 transition-all group font-black uppercase">
                  <div className="flex flex-col items-center">
                    {isUpdatingImg ? <Loader2 className="animate-spin text-orange-500" /> : <ImageIconLucide className="text-zinc-600 mb-2 group-hover:text-orange-500" size={24} />}
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest font-black uppercase">{isUpdatingImg ? "Resizing..." : "Gallery Upload"}</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>
          <div className="text-left space-y-6 font-black uppercase">
            <span className="text-orange-500 font-black text-[10px] uppercase block tracking-[0.4em]">My Story</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none font-black uppercase">Driven by <span className="text-orange-500 italic font-black uppercase">curiosity.</span></h2>
            <p className="text-zinc-400 text-sm md:text-lg leading-relaxed opacity-70 font-medium">Based in Delhi, I architect Clean UI/UX systems. My approach is simple: learning-by-doing and building with <span className="text-orange-500 font-black font-black uppercase">100% certainty</span>.</p>
            <div className="flex flex-wrap gap-3">
              {["UI/UX Design", "AI Builder", "Video Mastery"].map(t => <span key={t} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] text-zinc-400 uppercase font-black tracking-widest hover:text-orange-500 transition-all font-black uppercase">{t}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section id="projects" className="py-16 md:py-32 px-6 max-w-7xl mx-auto relative z-10 font-black uppercase">
        <h2 className="text-4xl md:text-[7.8rem] font-black tracking-tighter uppercase mb-8 md:mb-12 text-white leading-none font-black uppercase font-black uppercase">Experiments<span className="text-orange-500 font-black uppercase font-black uppercase">.</span></h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10 font-black uppercase">
          <ProjectCard p={{ title: "JuiceVerse", cat: "Live Demo", link: "https://varunsahu88.github.io/Juiceverse/", desc: "Branding exploration." }} isStatic={true} />
          <ProjectCard p={{ title: "Portfort", cat: "Concept", link: "https://varunsahu88.github.io/portfort02/index.html", desc: "Portfolio experiment." }} isStatic={true} />
          <ProjectCard p={{ title: "Geneva", cat: "Featured", link: "https://github.com/varunsahu88", desc: "Dashboard UI and AI logic." }} isStatic={true} />
          {projects.map(p => <ProjectCard key={p.id} p={p} />)}
          {isAdmin && (
            <div className="relative bg-zinc-900 border-2 border-dashed border-orange-500/30 p-4 md:p-10 rounded-[1.2rem] md:rounded-[3rem] flex flex-col justify-center h-[160px] md:h-[400px] shadow-2xl font-black uppercase">
              <form onSubmit={handleAddProject} className="space-y-2 md:space-y-4 text-center font-black uppercase font-black uppercase">
                <h4 className="text-[8px] md:text-[10px] font-black uppercase text-orange-500 mb-1 md:mb-2 font-black uppercase font-black uppercase">New Project</h4>
                <input value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Name" className="w-full bg-black border border-zinc-800 rounded-lg md:rounded-xl py-1.5 md:py-3 px-2 md:px-4 text-[9px] md:text-xs text-white focus:border-orange-500 outline-none" required />
                <input value={newProjLink} onChange={e => setNewProjLink(e.target.value)} placeholder="Link" className="w-full bg-black border border-zinc-800 rounded-lg md:rounded-xl py-1.5 md:py-3 px-2 md:px-4 text-[9px] md:text-xs text-white focus:border-orange-500 outline-none" required />
                <textarea value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} placeholder="Description..." className="w-full bg-black border border-zinc-800 rounded-lg md:rounded-xl py-1.5 md:py-3 px-2 md:px-4 text-[9px] md:text-xs text-white outline-none h-12 md:h-16 resize-none focus:border-orange-500" required />
                <button type="submit" disabled={isAdding} className="w-full bg-orange-500 text-white font-black py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] uppercase tracking-widest transition-all font-black uppercase">Add</button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-40 px-6 relative z-10 bg-zinc-900/10 font-black uppercase">
        <div className="max-w-7xl mx-auto font-black uppercase font-black uppercase">
          <motion.div {...fadeInUp} className="text-center mb-20 font-black uppercase">
            <span className="text-orange-500 font-black text-[10px] uppercase block tracking-[0.4em] mb-4 block">The Philosophy</span>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase text-white leading-tight uppercase">Architecture of <span className="text-orange-500 italic">Certainty.</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-black uppercase">
            <motion.div {...fadeInUp} className="bg-zinc-900/40 border border-zinc-800 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] group hover:border-orange-500/30 transition-all shadow-2xl font-black uppercase">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors font-black uppercase"><Layers className="text-orange-500 group-hover:text-white" /></div>
              <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Structured <span className="text-orange-500 font-black">Chaos</span></h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">Design systems built on logic. Har pixel ke peeche ek solid reason hai.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-zinc-900/40 border border-zinc-800 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] group hover:border-orange-500/30 transition-all shadow-2xl font-black uppercase">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors font-black uppercase"><Cpu className="text-orange-500 group-hover:text-white" /></div>
              <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tight font-black uppercase">AI <span className="text-orange-500 font-black">Partnership</span></h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">AI detect languages and settle instantly. Efficient building logic.</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-zinc-900/40 border border-zinc-800 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] group hover:border-orange-500/30 transition-all shadow-2xl font-black uppercase font-black uppercase">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors font-black uppercase"><Trophy className="text-orange-500 group-hover:text-white" /></div>
              <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tight font-black uppercase">Damn <span className="text-orange-500 font-black">Sure</span> Finish</h4>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">Jab tak result solid na ho, build khatam nahi hota. Certainty is priority.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROAST Section */}
      <section className="py-24 md:py-40 px-6 relative z-10 bg-black/20 border-y border-zinc-900 text-center font-black uppercase">
        <div className="max-w-4xl mx-auto font-black uppercase">
          <motion.div {...fadeInUp} className="inline-flex items-center gap-2 bg-zinc-900 border border-orange-500/30 px-6 py-2 rounded-full text-[10px] font-black text-orange-500 uppercase mb-8 shadow-lg font-black uppercase font-black uppercase"><Flame size={16} /> Reality Check ✨</motion.div>
          <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-10 leading-tight">Roast Your Ambition.</motion.h2>
          <div className="flex flex-col gap-6 items-center font-black uppercase">
            <input value={roastInput} onChange={e => setRoastInput(e.target.value)} placeholder="Goal likho..." className="w-full max-w-lg bg-black border border-zinc-800 rounded-2xl py-5 px-8 text-lg text-white focus:border-orange-500 outline-none transition-all shadow-inner text-center font-black uppercase font-black uppercase" />
            <button onClick={handleRoast} disabled={isRoasting} className="bg-orange-500 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.2)] active:scale-95 font-black uppercase">
              {isRoasting ? <Loader2 className="animate-spin font-black uppercase" /> : "Get Roasted ✨"}
            </button>
            {roastResult && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-black/40 rounded-2xl border border-orange-500/20 max-w-lg w-full font-black text-orange-500 text-[12px] md:text-lg uppercase">"{String(roastResult)}"</motion.div>}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 md:py-40 px-6 relative z-10 border-t border-zinc-900 bg-zinc-900/10 font-black uppercase">
        <div className="max-w-5xl mx-auto font-black uppercase font-black uppercase">
          <motion.div {...fadeInUp} className="mb-16 font-black uppercase">
            <span className="text-orange-500 font-black text-[10px] uppercase block tracking-widest">Real Journey</span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter uppercase font-black uppercase">Work <br className="hidden md:block" /><span className="text-orange-500 font-black uppercase font-black uppercase">Timeline</span><span className="text-zinc-800 font-black uppercase font-black uppercase font-black uppercase font-black uppercase font-black uppercase font-black uppercase">.</span></h2>
          </motion.div>
          <div className="space-y-12 font-black uppercase">
            {experiences.map((exp, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="grid md:grid-cols-4 gap-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:border-orange-500/20 transition-all group shadow-xl font-black uppercase font-black uppercase">
                <div className="text-orange-500 font-black text-xs uppercase tracking-widest font-black font-black uppercase">{exp.year}</div>
                <div className="md:col-span-2">
                  <h4 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors font-black uppercase font-black uppercase font-black uppercase font-black uppercase">{exp.role}</h4>
                  <p className="text-sm text-zinc-600 font-bold uppercase mt-1 tracking-widest font-black uppercase font-black uppercase font-black uppercase font-black uppercase">{exp.company}</p>
                </div>
                <div className="text-xs text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors font-black uppercase font-black uppercase">{exp.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-40 px-4 md:px-6 relative z-10 bg-zinc-900/10 border-y border-zinc-900 font-black uppercase">
        <div className="max-w-7xl mx-auto font-black uppercase">
          <motion.div {...fadeInUp} className="text-center mb-10 md:mb-20 font-black uppercase font-black uppercase">
            <Quote className="text-orange-500 mx-auto mb-4 md:mb-6 font-black uppercase font-black uppercase" size={32} />
            <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter font-black uppercase font-black uppercase">Honest <span className="text-orange-500 font-black font-black uppercase font-black uppercase">Feedback</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 font-black uppercase">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...fadeInUp} className="p-6 md:p-12 bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] md:rounded-[3rem] relative shadow-2xl group hover:border-orange-500/30 transition-all font-black uppercase font-black uppercase font-black uppercase">
                <p className="text-[10px] md:text-xl text-zinc-300 italic mb-4 md:mb-8 font-black uppercase font-black uppercase">"{String(t.text)}"</p>
                <div className="flex items-center gap-3 md:gap-4 border-t border-zinc-800 pt-4 md:pt-8 font-black uppercase">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-zinc-800 rounded-full flex items-center justify-center text-orange-500 font-black group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-lg font-black uppercase font-black uppercase font-black uppercase">{String(t.name[0])}</div>
                  <div className="font-black uppercase">
                    <h5 className="text-white font-black uppercase text-[10px] md:text-sm tracking-widest font-black uppercase font-black uppercase font-black uppercase font-black uppercase">{String(t.name)}</h5>
                    <p className="text-[8px] md:text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] font-black uppercase font-black uppercase font-black uppercase font-black uppercase">{String(t.role)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-40 px-6 relative z-10 bg-black/20 border-t border-zinc-900 font-black uppercase">
        <div className="max-w-4xl mx-auto font-black uppercase font-black uppercase">
          <motion.div {...fadeInUp} className="text-center mb-20 font-black uppercase">
            <MessageSquare className="text-orange-500 mx-auto mb-6 font-black uppercase font-black uppercase" size={40} />
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter uppercase font-black uppercase font-black uppercase">Curiosity <span className="text-orange-500 font-black uppercase font-black uppercase">Unlocked</span></h2>
          </motion.div>
          <div className="space-y-6 font-black uppercase font-black uppercase">
            {faqs.map((f, i) => (
              <motion.div key={i} {...fadeInUp} className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-orange-500/20 transition-all shadow-xl font-black uppercase font-black uppercase">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-8 text-left flex justify-between items-center transition-colors font-black uppercase font-black uppercase font-black uppercase">
                  <span className="font-black uppercase tracking-[0.2em] text-xs md:text-sm text-zinc-300 group-hover:text-orange-500 font-black uppercase">{String(f.q)}</span>
                  <ChevronDown className={`text-zinc-600 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-orange-500' : ''}`} size={20} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8 text-zinc-500 text-sm leading-relaxed border-t border-zinc-800/50 pt-6 font-medium font-black uppercase font-black uppercase">
                      {String(f.a)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 md:py-32 px-6 border-t border-zinc-900 bg-[#0c0c0c] relative z-10 text-center font-black uppercase">
        <motion.h2 {...fadeInUp} className="text-4xl md:text-[8.5rem] font-black tracking-tighter mb-16 uppercase text-white leading-none font-black uppercase font-black uppercase">Talk to <span className="text-orange-500 underline decoration-4 underline-offset-8 font-black uppercase">Me.</span></motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mb-20 text-left max-w-6xl mx-auto items-start font-black uppercase font-black uppercase font-black uppercase">
          <motion.div {...fadeInUp} className="space-y-6 flex flex-col font-black uppercase">
            <div className="flex flex-col gap-4 font-black uppercase">
              <a href="mailto:Varunsahu01p@gmail.com" className="flex items-center gap-4 text-sm md:text-xl font-bold hover:text-orange-500 transition-all group font-black uppercase">
                <div className="p-4 bg-zinc-900 rounded-[1.2rem] border border-zinc-800 group-hover:border-orange-500/50 shadow-xl transition-all font-black uppercase"><Mail size={22} className="text-orange-500 font-black uppercase font-black uppercase" /></div>
                <span className="tracking-tight text-white/80 font-black uppercase font-black uppercase">Varunsahu01p@gmail.com</span>
              </a>
              <a href="tel:+918851451642" className="flex items-center gap-4 text-sm md:text-xl font-bold hover:text-orange-500 transition-all group font-black uppercase">
                <div className="p-4 bg-zinc-900 rounded-[1.2rem] border border-zinc-800 group-hover:border-orange-500/50 shadow-xl transition-all font-black uppercase"><Phone size={22} className="text-orange-500 font-black uppercase font-black uppercase" /></div>
                <span className="tracking-tight text-white/80 font-black uppercase font-black uppercase">+91 8851451642</span>
              </a>
            </div>
            <div className="flex gap-4 pt-6 justify-start font-black uppercase">
              <a href="https://github.com/varunsahu88" target="_blank" rel="noopener noreferrer" className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 hover:bg-white hover:text-black transition-all shadow-xl font-black uppercase font-black uppercase"><Github size={26} className="text-white font-black uppercase font-black uppercase" /></a>
              <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)} className={`p-5 bg-zinc-900 rounded-2xl border border-zinc-800 transition-all shadow-xl font-black uppercase font-black uppercase font-black uppercase ${isAdmin ? 'text-orange-500 border-orange-500 animate-pulse font-black uppercase font-black uppercase' : 'text-zinc-600 font-black font-black uppercase'}`}>{isAdmin ? <Unlock size={26} /> : <Lock size={26} />}</button>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800 p-8 md:p-12 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden text-left font-black uppercase font-black uppercase font-black uppercase">
            <div className="text-orange-500 font-black uppercase text-[11px] flex items-center gap-2 tracking-[0.3em] font-black uppercase font-black uppercase"><Sparkles size={16} /> AI Assistant <span className="text-[8px] opacity-40 font-black uppercase font-black uppercase">(Gemini Powered)</span></div>
            <textarea value={contactDraftInput} onChange={e => setContactDraftInput(e.target.value)} placeholder="Idea likho..." className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-sm h-32 text-white outline-none focus:border-orange-500 transition-all shadow-inner font-medium font-black uppercase font-black uppercase" />
            <button onClick={handleDraftContact} className="w-full bg-orange-500 text-white py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl font-black uppercase">Generate Draft</button>
            {contactDraftResult && <div className="mt-4 p-4 bg-black/40 rounded-xl border border-zinc-800 text-[10px] text-zinc-300 leading-relaxed font-medium uppercase font-black uppercase whitespace-pre-line">{String(contactDraftResult)}</div>}
          </motion.div>
        </div>
      </section>

      <footer className="py-10 md:py-20 px-6 border-t border-zinc-900 text-center opacity-30 relative z-10 font-black uppercase tracking-[0.8em] text-[10px] md:text-[14px] text-zinc-500 font-black uppercase font-black uppercase font-black uppercase">
        GUDDU SAHU • <span className="text-orange-500 font-black uppercase">PIXEL CERTAINTY</span> • 2026
      </footer>

      {/* AI Bot Overlay */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[300] flex flex-col items-end font-black uppercase font-black uppercase font-black uppercase">
        <AnimatePresence>
          {showAIChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 md:mb-6 w-[85vw] sm:w-[400px] h-[500px] md:h-[550px] max-h-[70vh] bg-[#0c0c0c]/95 border border-orange-500/20 rounded-[2rem] md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden backdrop-blur-3xl font-black uppercase"
            >
              <div className="p-5 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60 font-black uppercase font-black uppercase">
                <div className="flex items-center gap-3 font-black uppercase">
                  <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20 font-black uppercase"><Bot className="text-white" size={20} /></div>
                  <div><h4 className="font-black text-[9px] md:text-[11px] text-white uppercase tracking-widest font-black uppercase">AI Twin</h4><p className="text-[6px] md:text-[7px] text-orange-500 uppercase font-black tracking-widest font-black uppercase">Active</p></div>
                </div>
                <button onClick={() => setShowAIChat(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-all font-black uppercase"><X size={18} className="text-zinc-500 font-black" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide flex flex-col font-medium text-zinc-200 text-left">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} font-black uppercase font-black uppercase font-black uppercase`}>
                    <div className={`max-w-[85%] p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] text-[11px] md:text-[13px] leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-orange-500/10'}`}>{String(msg.text)}</div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start ml-4 animate-pulse"><Loader2 size={14} className="animate-spin text-orange-500" /></div>}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleAIChat} className="p-4 md:p-6 pt-0 font-black uppercase font-black uppercase font-black uppercase">
                <div className="flex gap-2 p-1.5 bg-black border border-zinc-800 rounded-xl md:rounded-2xl items-center group focus-within:border-orange-500/50 transition-all shadow-inner font-black uppercase">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Bol bhai..." className="flex-1 bg-transparent px-2 md:px-3 text-[10px] md:text-[12px] text-white outline-none font-medium" />
                  <button type="submit" className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-xl hover:bg-orange-600 transition-all font-black uppercase"><Send size={16} /></button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-14 h-14 md:w-20 md:h-20 bg-white text-black rounded-[1.2rem] md:rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all border-4 border-black group font-black uppercase"
        >
          {showAIChat ? <X size={24} /> : <Bot size={28} className="group-hover:rotate-12 transition-transform font-black uppercase" />}
        </motion.button>
      </div>
    </div>
  );
}

export default App;
