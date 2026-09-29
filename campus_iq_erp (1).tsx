import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, Calendar, Clock, CheckCircle, AlertTriangle, UserCheck, 
  Search, Bell, Shield, MapPin, DollarSign, HelpCircle, Bot, Send, 
  Sparkles, Download, Plus, Trash2, Edit3, Check, X, FileText, 
  Users, Award, PhoneCall, Radio, Filter, RefreshCw, LogOut, Moon, 
  Sun, ChevronRight, MessageSquare, CreditCard, ExternalLink, Info, 
  Layers, CheckSquare, UploadCloud, Eye, AlertCircle, Volume2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';


// Firebase Initialization Guard
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'campusiq-app';
try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn("Firebase context fallback mode active:", err);
}

// Initial Mock Seed Data for instant vibrant UI preview
const INITIAL_DEMO_USERS = {
  student: {
    uid: "std-101",
    name: "Alex Morgan",
    email: "student@campusiq.edu",
    role: "student",
    rollNumber: "CS-2024-042",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  faculty: {
    uid: "fcl-201",
    name: "Dr. Robert Vance",
    email: "faculty@campusiq.edu",
    role: "faculty",
    employeeId: "EMP-CSE-889",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  admin: {
    uid: "adm-301",
    name: "Elena Rostova",
    email: "admin@campusiq.edu",
    role: "admin",
    employeeId: "ADM-HQ-001",
    department: "Academic Operations",
    designation: "Director of Systems",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  }
};


const INITIAL_SUBJECTS_ATTENDANCE = [
  { id: 'sub-1', code: 'CS601', name: 'Artificial Intelligence & Machine Learning', faculty: 'Dr. Robert Vance', attended: 28, total: 32, category: 'Core' },
  { id: 'sub-2', code: 'CS602', name: 'Full-Stack Web Development', faculty: 'Prof. Sarah Jenkins', attended: 24, total: 25, category: 'Lab' },
  { id: 'sub-3', code: 'CS603', name: 'Data Structures & Algorithms', faculty: 'Dr. Alan Turing', attended: 18, total: 26, category: 'Core' },
  { id: 'sub-4', code: 'CS604', name: 'Cloud Computing Architecture', faculty: 'Prof. David Miller', attended: 22, total: 24, category: 'Elective' },
  { id: 'sub-5', code: 'CS605', name: 'Cybersecurity Fundamentals', faculty: 'Dr. Lisa Hayes', attended: 15, total: 22, category: 'Core' }
];

const INITIAL_TIMETABLE = [
  { id: 't-1', day: 'Monday', time: '09:00 AM - 10:30 AM', subject: 'Artificial Intelligence', room: 'Tech Block A-101', faculty: 'Dr. Robert Vance', live: true },
  { id: 't-2', day: 'Monday', time: '10:45 AM - 12:15 PM', subject: 'Web Development Lab', room: 'Computing Lab 3', faculty: 'Prof. Sarah Jenkins', live: false },
  { id: 't-3', day: 'Monday', time: '01:30 PM - 03:00 PM', subject: 'Data Structures', room: 'Tech Block B-204', faculty: 'Dr. Alan Turing', live: false },
  { id: 't-4', day: 'Tuesday', time: '09:00 AM - 10:30 AM', subject: 'Cloud Computing', room: 'Lecture Hall 2', faculty: 'Prof. David Miller', live: false },
  { id: 't-5', day: 'Wednesday', time: '11:00 AM - 12:30 PM', subject: 'Cybersecurity', room: 'Tech Block A-101', faculty: 'Dr. Lisa Hayes', live: false }
];

const INITIAL_ASSIGNMENTS = [
  { id: 'asg-1', subject: 'CS601 - AI & ML', title: 'Neural Network Optimization Models', deadline: '2026-10-05', status: 'Pending', points: '100 pts', description: 'Implement backpropagation algorithm from scratch in Python or C++ and test on Iris dataset.' },
  { id: 'asg-2', subject: 'CS602 - Web Dev', title: 'React ERP Component Suite', deadline: '2026-09-30', status: 'Submitted', grade: '95/100', points: '100 pts', description: 'Design modular UI components using Tailwind CSS and React state hooks.' },
  { id: 'asg-3', subject: 'CS603 - DSA', title: 'Graph Traversal Algorithms Benchmark', deadline: '2026-10-12', status: 'Pending', points: '50 pts', description: 'Compare time and space complexities of Dijkstra vs A* pathfinding.' }
];

const INITIAL_NOTES = [
  { id: 'note-1', title: 'Module 3: Convolutional Neural Networks', subject: 'CS601 - AI & ML', format: 'PDF Document', size: '4.2 MB', date: 'Sep 24, 2026', downloads: 142 },
  { id: 'note-2', title: 'React Hooks & State Management Architecture', subject: 'CS602 - Web Dev', format: 'PDF Presentation', size: '2.8 MB', date: 'Sep 22, 2026', downloads: 210 },
  { id: 'note-3', title: 'Red-Black Trees & B-Trees Notes', subject: 'CS603 - DSA', format: 'ZIP Archive', size: '12.1 MB', date: 'Sep 18, 2026', downloads: 89 }
];


const INITIAL_CLASSROOMS = [
  { id: 'cr-101', name: 'Tech Block A-101', block: 'Block A', capacity: 80, status: 'Occupied', currentClass: 'CS601 - Artificial Intelligence', facilities: ['Smart Board', 'Projector', 'AC', 'Wi-Fi'] },
  { id: 'cr-102', name: 'Tech Block A-102', block: 'Block A', capacity: 60, status: 'Vacant', currentClass: 'None', facilities: ['Projector', 'Wi-Fi'] },
  { id: 'cr-201', name: 'Science Lab B-203', block: 'Block B', capacity: 40, status: 'Vacant', currentClass: 'None', facilities: ['Computers', 'Lab Equipment', 'AC'] },
  { id: 'cr-301', name: 'Main Auditorium', block: 'Central Wing', capacity: 400, status: 'Reserved', currentClass: 'Hackathon Orientation Briefing', facilities: ['Surround Audio', 'Stage Lighting', 'Live Stream Rig'] }
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'Mid-Semester Examination Schedule Published', category: 'Exam', priority: 'Urgent', date: 'Sep 28, 2026', author: 'Academic Office', body: 'The mid-semester examinations will commence from Oct 15th. Detailed seating plans will be updated shortly on Campus IQ.' },
  { id: 'ann-2', title: 'Annual Smart Campus Hackathon 2026 Registration Open', category: 'Event', priority: 'Notice', date: 'Sep 27, 2026', author: 'Tech Club', body: 'Team registration for the 36-hour hackathon is live. Prize pool of $5,000 for top AI innovations.' }
];

const INITIAL_EVENTS = [
  { id: 'ev-1', title: 'InnovateX 2026 Tech Symposium', date: 'Oct 04, 2026', location: 'Main Auditorium', organizer: 'Dept of CSE', rsvps: 284, capacity: 400, category: 'Academic' },
  { id: 'ev-2', title: 'Inter-Departmental Robotics Championship', date: 'Oct 10, 2026', location: 'Indoor Sports Arena', organizer: 'Robotics Society', rsvps: 156, capacity: 200, category: 'Competition' }
];

const INITIAL_FEES = [
  { id: 'fee-1', title: 'Tuition Fee - Fall Semester 2026', category: 'Academic', amount: 3500, dueDate: 'Oct 15, 2026', status: 'Pending' },
  { id: 'fee-2', title: 'Hostel & Mess Maintenance Quarter 3', category: 'Hostel', amount: 850, dueDate: 'Sep 30, 2026', status: 'Pending' },
  { id: 'fee-3', title: 'Library & Online Journal Portal Pass', category: 'Library', amount: 150, dueDate: 'Sep 10, 2026', status: 'Paid', receiptId: 'REC-2026-99211' }
];

const INITIAL_LOST_FOUND = [
  { id: 'lf-1', type: 'Lost', title: 'MacBook Air M2 (Space Gray)', location: 'Central Library 2nd Floor', date: 'Sep 28, 2026', status: 'Open', contact: 'alex@campusiq.edu', notes: 'Has a blue vinyl sticker on top cover.' },
  { id: 'lf-2', type: 'Found', title: 'Noise-Canceling Wireless Earbuds', location: 'Cafeteria Ground Floor', date: 'Sep 29, 2026', status: 'Claim Pending', contact: 'Campus Security Office', notes: 'Turned into desk 4.' }
];

const INITIAL_EMERGENCY_CONTACTS = [
  { id: 'em-1', title: 'Campus Security Central Hotline', phone: '+1 (800) 555-0199', location: 'Gate 1 Headquarters', responseTime: '< 3 Mins' },
  { id: 'em-2', title: 'University Health Center & Ambulance', phone: '+1 (800) 555-0112', location: 'Medical Block C', responseTime: '24/7 Service' },
  { id: 'em-3', title: 'Women Safety & Counseling Cell', phone: '+1 (800) 555-0144', location: 'Student Welfare Hub', responseTime: 'Immediate Response' },
  { id: 'em-4', title: 'Dean of Student Affairs Helpline', phone: '+1 (800) 555-0188', location: 'Admin Building R-10', responseTime: 'Office Hours' }
];


const callGeminiAPI = async (promptText, contextPrompt = "") => {
  try {
    const apiKey = ""; // Runtime key auto-populated by platform environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are Campus IQ AI - the official intelligent assistant for Campus IQ ERP. 
You provide friendly, accurate, highly structured academic assistance, study advice, attendance guidance, and campus navigation answers. Keep responses organized with clear subheadings, bullet points, or step-by-step actions. Context: ${contextPrompt}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "I am unable to generate a response at this moment. Please try again.";
  } catch (err) {
    console.error("Gemini AI API call failed:", err);
    return "Campus IQ AI System Notice: Unable to connect to AI server. Please verify network connectivity or retry in a few seconds.";
  }
};


export default function App() {
  // Authentication & System State
  const [user, setUser] = useState(INITIAL_DEMO_USERS.student);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // ERP Dynamic Collections Data
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS_ATTENDANCE);
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [classrooms, setClassrooms] = useState(INITIAL_CLASSROOMS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [fees, setFees] = useState(INITIAL_FEES);
  const [lostFound, setLostFound] = useState(INITIAL_LOST_FOUND);

  // UI Interactive Modals State
  const [sosActive, setSosActive] = useState(false);
  const [paymentModalFee, setPaymentModalFee] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [newAssignmentModal, setNewAssignmentModal] = useState(false);
  const [newLostFoundModal, setNewLostFoundModal] = useState(false);
  const [roomBookingModal, setRoomBookingModal] = useState(null);

  // AI Assistant Chat Context
  const [aiChat, setAiChat] = useState([
    { sender: 'bot', text: 'Hello Alex! I am your Campus IQ AI Assistant. Ask me about your attendance targets, exam study plans, assignment help, or campus facilities!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Trigger Toast Notification helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };


  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth initialization silent fallback:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && db) {
        // Fetch or listen to Firestore cloud backup using valid 2-segment path (collection/document)
        const docRef = doc(db, 'appData', appId);
        onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.subjects) setSubjects(data.subjects);
            if (data.assignments) setAssignments(data.assignments);
            if (data.fees) setFees(data.fees);
          }
        }, (err) => console.log("Firestore sync warning:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  // Quick Demo Login switch handler
  const handleQuickDemoLogin = (roleKey) => {
    const demoProfile = INITIAL_DEMO_USERS[roleKey];
    setUser(demoProfile);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    showToast(`Logged in as ${demoProfile.name} (${demoProfile.role.toUpperCase()})`);
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast("Logged out successfully");
  };


  const overallAttendancePct = useMemo(() => {
    const totalAttended = subjects.reduce((acc, curr) => acc + curr.attended, 0);
    const totalClasses = subjects.reduce((acc, curr) => acc + curr.total, 0);
    return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  }, [subjects]);

  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter(a => a.status === 'Pending').length;
  }, [assignments]);

  const totalUnpaidFees = useMemo(() => {
    return fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  }, [fees]);


  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white mb-2">
              <Bot className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Campus IQ
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered Smart Campus ERP Platform</p>
          </div>

          {/* Quick Demo Login Credentials Selector */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block text-center">
              ⚡ Instant 1-Click Demo Evaluation Login
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleQuickDemoLogin('student')}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Alex Morgan (Student)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">student@campusiq.edu • CS-2024</div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-md">Student</span>
              </button>

              <button 
                onClick={() => handleQuickDemoLogin('faculty')}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Dr. Robert Vance (Faculty)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">faculty@campusiq.edu • Associate Prof</div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-md">Faculty</span>
              </button>

              <button 
                onClick={() => handleQuickDemoLogin('admin')}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Elena Rostova (Admin)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">admin@campusiq.edu • System Director</div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-md">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleQuickDemoLogin('student'); }} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Campus Email</label>
              <input 
                type="email" 
                defaultValue="student@campusiq.edu" 
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Password</label>
              <input 
                type="password" 
                defaultValue="••••••••" 
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Sign In to Campus IQ
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} flex transition-colors duration-200`}>
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* Emergency Global SOS Trigger Banner */}
      {sosActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white px-6 py-3 shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300" />
            <div>
              <span className="font-bold text-lg">EMERGENCY SOS ALERT ACTIVATED</span>
              <p className="text-xs opacity-90">Campus Security & Health Services dispatched to your active location.</p>
            </div>
          </div>
          <button 
            onClick={() => { setSosActive(false); showToast("Emergency SOS canceled"); }}
            className="px-4 py-1.5 bg-white text-rose-700 rounded-lg font-bold text-xs hover:bg-rose-50"
          >
            Cancel Alert
          </button>
        </div>
      )}

      {/* Responsive Navigation Sidebar */}
      <aside className={`w-64 border-r ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} flex flex-col fixed inset-y-0 z-30 transition-all`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Campus IQ</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Smart ERP v3.1</span>
          </div>
        </div>

        {/* User Identity Info Box */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 mx-3 my-3 rounded-2xl flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500" />
          <div className="overflow-hidden">
            <div className="font-bold text-sm truncate">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role} Account</div>
          </div>
        </div>

        {/* Navigation Items Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layers },
            { id: 'attendance', label: 'Attendance Management', icon: UserCheck },
            { id: 'timetable', label: 'Timetable & Schedule', icon: Calendar },
            { id: 'assignments', label: 'Assignments & Notes', icon: BookOpen },
            { id: 'classrooms', label: 'Classroom Availability', icon: MapPin },
            { id: 'events', label: 'Events & Notices', icon: Bell },
            { id: 'fees', label: 'Fees & Finance', icon: DollarSign },
            { id: 'lostfound', label: 'Lost & Found Portal', icon: HelpCircle },
            { id: 'emergency', label: 'Emergency Help SOS', icon: AlertTriangle, highlight: true },
            { id: 'aiassistant', label: 'AI Academic Assistant', icon: Sparkles, badge: 'Gemini' },
            { id: 'directory', label: 'Campus Directory', icon: Users },
            { id: 'profile', label: 'Profile & Settings', icon: Edit3 }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : item.highlight 
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">Dark Mode</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:opacity-80"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Screen Content Body */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className={`h-16 border-b ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold capitalize">{activeTab.replace(/([A-Z])/g, ' $1')}</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800 capitalize">
              Role: {user.role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSosActive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS Emergency</span>
            </button>

            <button 
              onClick={() => setActiveTab('aiassistant')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen Component View Switches */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              user={user} 
              subjects={subjects} 
              overallAttendancePct={overallAttendancePct} 
              pendingAssignmentsCount={pendingAssignmentsCount} 
              timetable={timetable}
              announcements={announcements}
              totalUnpaidFees={totalUnpaidFees}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView 
              user={user} 
              subjects={subjects} 
              setSubjects={setSubjects} 
              showToast={showToast}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableView 
              user={user} 
              timetable={timetable} 
              setTimetable={setTimetable}
              showToast={showToast}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView 
              user={user} 
              assignments={assignments} 
              setAssignments={setAssignments}
              notes={notes}
              showToast={showToast}
            />
          )}

          {activeTab === 'classrooms' && (
            <ClassroomsView 
              user={user} 
              classrooms={classrooms} 
              setClassrooms={setClassrooms}
              showToast={showToast}
            />
          )}

          {activeTab === 'events' && (
            <EventsView 
              user={user} 
              events={events} 
              setEvents={setEvents}
              announcements={announcements}
              showToast={showToast}
            />
          )}

          {activeTab === 'fees' && (
            <FeesView 
              user={user} 
              fees={fees} 
              setFees={setFees}
              setPaymentModalFee={setPaymentModalFee}
              setReceiptModal={setReceiptModal}
              showToast={showToast}
            />
          )}

          {activeTab === 'lostfound' && (
            <LostFoundView 
              user={user} 
              lostFound={lostFound} 
              setLostFound={setLostFound}
              showToast={showToast}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyView setSosActive={setSosActive} />
          )}

          {activeTab === 'aiassistant' && (
            <AiAssistantView 
              aiChat={aiChat} 
              setAiChat={setAiChat} 
              aiInput={aiInput} 
              setAiInput={setAiInput} 
              aiLoading={aiLoading} 
              setAiLoading={setAiLoading}
              user={user}
              overallAttendancePct={overallAttendancePct}
            />
          )}

          {activeTab === 'directory' && <DirectoryView />}

          {activeTab === 'profile' && (
            <ProfileView user={user} setUser={setUser} showToast={showToast} />
          )}
        </div>
      </main>

      {/* Payment Gateway Modal */}
      {paymentModalFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Mock Fee Payment Portal</h3>
              <button onClick={() => setPaymentModalFee(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
              <div className="text-xs text-slate-500">Item Title</div>
              <div className="font-bold text-sm">{paymentModalFee.title}</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">${paymentModalFee.amount}.00</div>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Cardholder Name" defaultValue={user.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
              <input type="text" placeholder="Card Number" defaultValue="4532 •••• •••• 8892" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM/YY" defaultValue="12/28" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
                <input type="password" placeholder="CVV" defaultValue="991" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
              </div>
            </div>
            <button 
              onClick={() => {
                setFees(fees.map(f => f.id === paymentModalFee.id ? { ...f, status: 'Paid', receiptId: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}` } : f));
                setPaymentModalFee(null);
                showToast("Payment processed successfully!");
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
            >
              Pay ${paymentModalFee.amount}.00 Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function DashboardView({ user, subjects, overallAttendancePct, pendingAssignmentsCount, timetable, announcements, totalUnpaidFees, setActiveTab }) {
  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            Campus IQ Smart ERP Portal
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {user.name}! 👋</h2>
          <p className="text-indigo-100 max-w-xl text-sm">
            {user.role === 'student' && `Semester 6 CSE • Overall Attendance is ${overallAttendancePct}% (${overallAttendancePct >= 75 ? 'Safe Zone' : 'Warning Zone'})`}
            {user.role === 'faculty' && `Department of CSE • You have 3 active lectures scheduled for today.`}
            {user.role === 'admin' && `System Admin Panel • 1,240 Total Students Enrolled Campus-wide.`}
          </p>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div onClick={() => setActiveTab('attendance')} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500 transition">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Overall Attendance</span>
            <UserCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black">{overallAttendancePct}%</div>
          <span className={`text-xs font-bold ${overallAttendancePct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {overallAttendancePct >= 75 ? '✓ Above 75% Requirement' : '⚠ Below 75% Target'}
          </span>
        </div>

        <div onClick={() => setActiveTab('assignments')} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500 transition">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Pending Assignments</span>
            <BookOpen className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black">{pendingAssignmentsCount}</div>
          <span className="text-xs text-slate-400">Due within next 7 days</span>
        </div>

        <div onClick={() => setActiveTab('timetable')} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500 transition">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Today's Schedule</span>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black">3 Classes</div>
          <span className="text-xs text-indigo-500 font-bold">1 Lecture Currently Live</span>
        </div>

        <div onClick={() => setActiveTab('fees')} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500 transition">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Outstanding Fees</span>
            <DollarSign className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black">${totalUnpaidFees}</div>
          <span className="text-xs text-slate-400">Due by Oct 15, 2026</span>
        </div>
      </div>

      {/* Main Grid: Schedule and Priority Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Timetable Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Today's Live Schedule Overview</span>
            </h3>
            <button onClick={() => setActiveTab('timetable')} className="text-xs font-bold text-indigo-600 hover:underline">View Full Timetable</button>
          </div>

          <div className="space-y-3">
            {timetable.map((slot) => (
              <div key={slot.id} className={`p-4 rounded-xl border flex items-center justify-between ${slot.live ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{slot.subject}</span>
                    {slot.live && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full animate-pulse">
                        LIVE NOW
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{slot.time}</span>
                    <span>•</span>
                    <span>{slot.room}</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{slot.faculty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Campus Notices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Priority Notices</span>
            </h3>
            <button onClick={() => setActiveTab('events')} className="text-xs font-bold text-indigo-600 hover:underline">All Notices</button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{ann.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function AttendanceView({ user, subjects, setSubjects, showToast }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id);
  const [targetPct, setTargetPct] = useState(85);

  // Subject target calculator calculation
  const targetSub = subjects.find(s => s.id === selectedSubject) || subjects[0];
  const requiredClassesToTarget = useMemo(() => {
    if (!targetSub) return 0;
    const { attended, total } = targetSub;
    const targetDecimal = targetPct / 100;
    if ((attended / total) >= targetDecimal) return 0;
    const needed = Math.ceil((targetDecimal * total - attended) / (1 - targetDecimal));
    return Math.max(0, needed);
  }, [targetSub, targetPct]);

  // Faculty toggle attendance helper
  const handleFacultyMark = (subId, incrementAttended) => {
    setSubjects(subjects.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          total: s.total + 1,
          attended: incrementAttended ? s.attended + 1 : s.attended
        };
      }
      return s;
    }));
    showToast(`Attendance recorded for ${subjects.find(s=>s.id===subId)?.code}`);
  };

  return (
    <div className="space-y-8">
      {/* Attendance Target Calculator Widget for Students */}
      {user.role === 'student' && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">Interactive Attendance Goal Target Calculator</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-300">Select Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Attendance Percentage (%)</label>
              <input 
                type="number" 
                value={targetPct} 
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" 
                min="50" max="100"
              />
            </div>
            <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl text-center">
              <div className="text-xs text-indigo-300">Classes Needed Consecutively</div>
              <div className="text-xl font-extrabold text-amber-400">{requiredClassesToTarget} Classes</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Subject-Wise Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Subject Attendance Breakdown</h3>
            <p className="text-xs text-slate-500">Minimum mandatory attendance required by university regulation: 75%</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="p-4">Subject & Code</th>
                <th className="p-4">Faculty In-Charge</th>
                <th className="p-4">Attended / Conducted</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Status Badge</th>
                {user.role !== 'student' && <th className="p-4 text-right">Faculty Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {subjects.map((sub) => {
                const pct = Math.round((sub.attended / sub.total) * 100);
                const isSafe = pct >= 75;
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{sub.name}</div>
                      <div className="text-xs text-slate-400">{sub.code} • {sub.category}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{sub.faculty}</td>
                    <td className="p-4 font-bold">{sub.attended} / {sub.total} Classes</td>
                    <td className="p-4 font-black text-base">{pct}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isSafe ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {isSafe ? '✓ Safe (>75%)' : '⚠ Warning (<75%)'}
                      </span>
                    </td>
                    {user.role !== 'student' && (
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleFacultyMark(sub.id, true)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">+ Present</button>
                        <button onClick={() => handleFacultyMark(sub.id, false)} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">+ Absent</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function TimetableView({ user, timetable, setTimetable, showToast }) {
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const filteredSchedule = timetable.filter(t => t.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Day Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${selectedDay === day ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Slot Cards List */}
      <div className="space-y-4">
        {filteredSchedule.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            No lectures scheduled for {selectedDay}.
          </div>
        ) : (
          filteredSchedule.map(slot => (
            <div key={slot.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black">{slot.subject}</span>
                  {slot.live && (
                    <span className="px-2.5 py-0.5 text-xs font-extrabold bg-rose-600 text-white rounded-full animate-pulse">
                      LIVE NOW
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {slot.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {slot.room}</span>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Instructor: {slot.faculty}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function AssignmentsView({ user, assignments, setAssignments, notes, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('assignments');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button 
          onClick={() => setActiveSubTab('assignments')}
          className={`pb-3 font-bold text-sm border-b-2 ${activeSubTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
        >
          Active Assignments ({assignments.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('notes')}
          className={`pb-3 font-bold text-sm border-b-2 ${activeSubTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
        >
          Lecture Notes & PDFs ({notes.length})
        </button>
      </div>

      {activeSubTab === 'assignments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(asg => (
            <div key={asg.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{asg.subject}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${asg.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {asg.status}
                </span>
              </div>
              <h3 className="font-extrabold text-base">{asg.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{asg.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Due: {asg.deadline}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{asg.points}</span>
              </div>
              {asg.status === 'Pending' && user.role === 'student' && (
                <button 
                  onClick={() => {
                    setAssignments(assignments.map(a => a.id === asg.id ? { ...a, status: 'Submitted' } : a));
                    showToast(`Assignment '${asg.title}' submitted!`);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                >
                  Submit Solution PDF
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{note.title}</h4>
                  <p className="text-xs text-slate-400">{note.subject} • {note.size} • Uploaded {note.date}</p>
                </div>
              </div>
              <button 
                onClick={() => showToast(`Downloaded ${note.title}`)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function ClassroomsView({ user, classrooms, setClassrooms, showToast }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classrooms.map(cr => (
          <div key={cr.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">{cr.block}</span>
              <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${cr.status === 'Vacant' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {cr.status}
              </span>
            </div>
            <h3 className="font-bold text-lg">{cr.name}</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Capacity: {cr.capacity} Seats</div>
              <div>Current: {cr.currentClass}</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {cr.facilities.map(f => (
                <span key={f} className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                  {f}
                </span>
              ))}
            </div>
            {cr.status === 'Vacant' && (
              <button 
                onClick={() => showToast(`Room reservation request sent for ${cr.name}`)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Reserve Room
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


function EventsView({ user, events, setEvents, announcements, showToast }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Upcoming Campus Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => (
            <div key={ev.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-md">{ev.category}</span>
                <span className="text-xs text-slate-400">{ev.date}</span>
              </div>
              <h4 className="font-bold text-base">{ev.title}</h4>
              <p className="text-xs text-slate-500">Location: {ev.location} • Organizer: {ev.organizer}</p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600">{ev.rsvps} / {ev.capacity} RSVP'd</span>
                <button 
                  onClick={() => {
                    setEvents(events.map(e => e.id === ev.id ? { ...e, rsvps: e.rsvps + 1 } : e));
                    showToast(`RSVP Confirmed for ${ev.title}!`);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  RSVP Spot
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function FeesView({ user, fees, setFees, setPaymentModalFee, setReceiptModal, showToast }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg">Academic Fees & Dues Statement</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold">
            <tr>
              <th className="p-4">Fee Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {fees.map(f => (
              <tr key={f.id}>
                <td className="p-4 font-bold">{f.title}</td>
                <td className="p-4 text-slate-500">{f.category}</td>
                <td className="p-4 text-slate-500">{f.dueDate}</td>
                <td className="p-4 font-black">${f.amount}.00</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${f.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {f.status === 'Pending' ? (
                    <button onClick={() => setPaymentModalFee(f)} className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">Pay Fee</button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Receipt: {f.receiptId}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function LostFoundView({ user, lostFound, setLostFound, showToast }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Campus Lost & Found Notices</h3>
        <button 
          onClick={() => {
            const newItem = { id: `lf-${Date.now()}`, type: 'Lost', title: 'Student ID Card & Keys', location: 'Science Block B', date: 'Today', status: 'Open', contact: user.email, notes: 'Contact owner immediately' };
            setLostFound([newItem, ...lostFound]);
            showToast("Lost item report logged!");
          }}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
        >
          + Report Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lostFound.map(item => (
          <div key={item.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${item.type === 'Lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {item.type}
              </span>
              <span className="text-xs text-slate-400">{item.date}</span>
            </div>
            <h4 className="font-bold text-base">{item.title}</h4>
            <p className="text-xs text-slate-500">Location: {item.location}</p>
            <p className="text-xs text-slate-400 italic">"{item.notes}"</p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600">
              Contact: {item.contact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function EmergencyView({ setSosActive }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-center">
      <div className="p-10 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/30 rounded-3xl space-y-6">
        <AlertTriangle className="w-16 h-16 text-rose-600 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">Campus Emergency SOS Protocol</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Pressing the SOS button below will trigger a real-time emergency signal to Campus Security, Medical Cell, and dispatch location services.
        </p>
        <button 
          onClick={() => setSosActive(true)}
          className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xl rounded-2xl shadow-2xl shadow-rose-600/50 transition transform hover:scale-105 active:scale-95"
        >
          🚨 TRIGGER IMMEDIATE SOS 🚨
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {INITIAL_EMERGENCY_CONTACTS.map(c => (
          <div key={c.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-sm">{c.title}</h4>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{c.phone}</div>
            <p className="text-xs text-slate-400">{c.location} • Response: {c.responseTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function AiAssistantView({ aiChat, setAiChat, aiInput, setAiInput, aiLoading, setAiLoading, user, overallAttendancePct }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || aiInput;
    if (!textToSend.trim() || aiLoading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setAiChat(prev => [...prev, userMsg]);
    if (!queryText) setAiInput('');
    setAiLoading(true);

    const contextInfo = `User Name: ${user.name}, Role: ${user.role}, Department: ${user.department}, Attendance: ${overallAttendancePct}%`;
    const responseText = await callGeminiAPI(textToSend, contextInfo);

    setAiChat(prev => [...prev, { sender: 'bot', text: responseText }]);
    setAiLoading(false);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Campus IQ AI Academic Advisor</h3>
          <p className="text-[10px] text-slate-400">Powered by Gemini 3 Flash Intelligence</p>
        </div>
      </div>

      {/* Recommended Quick Chips */}
      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto">
        {[
          "How can I improve my overall attendance to 85%?",
          "Draft an official leave request email for my professor",
          "Generate a 7-day revision schedule for AI & ML midterms",
          "What are the library rules regarding book reservations?"
        ].map((chip, idx) => (
          <button 
            key={idx} 
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-indigo-600 dark:text-indigo-400 font-medium whitespace-nowrap hover:bg-indigo-50"
          >
            💡 {chip}
          </button>
        ))}
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {aiChat.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Campus IQ AI is analyzing academic records & generating answer...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
        <input 
          type="text" 
          value={aiInput} 
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI anything about your courses, attendance, or campus rules..." 
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={() => handleSendMessage()}
          disabled={aiLoading}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
}


function DirectoryView() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">Key Faculty & Staff Directory</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Dr. Robert Vance', title: 'Associate Professor & HOD', dept: 'Computer Science', email: 'vance@campusiq.edu', office: 'Tech Block Room 302' },
          { name: 'Prof. Sarah Jenkins', title: 'Senior Web Engineering Lecturer', dept: 'Computer Science', email: 'jenkins@campusiq.edu', office: 'Tech Block Room 308' },
          { name: 'Dr. Alan Turing', title: 'Algorithms Research Lead', dept: 'Mathematics & Computing', email: 'turing@campusiq.edu', office: 'Science Block Room 104' }
        ].map((fac, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-base">{fac.name}</h4>
            <div className="text-xs font-semibold text-indigo-600">{fac.title}</div>
            <p className="text-xs text-slate-500">{fac.dept} • {fac.office}</p>
            <p className="text-xs font-mono text-slate-400">{fac.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function ProfileView({ user, setUser, showToast }) {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-6">
        <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20" />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-slate-500 capitalize">{user.role} Account • {user.department}</p>
          <span className="text-xs font-mono text-indigo-600">{user.email}</span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400">Full Name</label>
          <input type="text" defaultValue={user.name} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400">Department</label>
          <input type="text" defaultValue={user.department} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"/>
        </div>
        <button 
          onClick={() => showToast("Profile settings updated!")}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md"
        >
          Save Profile Changes
        </button>
      </div>
    </div>
  );
}