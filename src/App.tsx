/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Heart, 
  Wind, 
  Layers, 
  ShieldCheck, 
  Palette, 
  Maximize2, 
  Star,
  ChevronRight,
  Menu,
  X,
  Play,
  Loader2,
  Video,
  Check,
  Settings, Package, ShoppingCart, Truck, LayoutDashboard, LogOut, 
  Eye, BarChart3, TrendingUp, Search, Filter, ArrowUpRight, 
  ArrowDownRight, MoreVertical, Trash2, Edit, Save, Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, auth } from "./firebase";
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, 
  doc, onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [pixelId, setPixelId] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scrollEvents, setScrollEvents] = useState({ p50: false, p75: false, p95: false });
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    address: "",
    quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [isPixelUpdating, setIsPixelUpdating] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    sku: "",
    category: "General",
    stock: 0,
    price: 0,
    image: ""
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const isVideoInView = useInView(videoSectionRef, { amount: 0.5, once: true });

  // Scroll Tracking Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent >= 50 && !scrollEvents.p50) {
        setScrollEvents(prev => ({ ...prev, p50: true }));
        triggerPixelEvent("ViewContent_50");
      }
      if (scrollPercent >= 75 && !scrollEvents.p75) {
        setScrollEvents(prev => ({ ...prev, p75: true }));
        triggerPixelEvent("ViewContent_75");
      }
      if (scrollPercent >= 95 && !scrollEvents.p95) {
        setScrollEvents(prev => ({ ...prev, p95: true }));
        triggerPixelEvent("ViewContent_95");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollEvents, pixelId]);

  const triggerPixelEvent = (eventName: string) => {
    if (!pixelId) return;
    console.log(`[Pixel] Triggering ${eventName} for ID: ${pixelId}`);
    // Real pixel implementation would go here (fbq, gtag, etc.)
    if ((window as any).fbq) {
      (window as any).fbq('trackCustom', eventName);
    }
  };

  // Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "hmsolyman33@gmail.com") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Fetch Pixel Config
    const fetchPixel = async () => {
      const docRef = doc(db, "pixelConfig", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPixelId(docSnap.data().pixelId);
      }
    };
    fetchPixel();

    return () => unsubscribe();
  }, []);

  // Load Facebook Pixel Script
  useEffect(() => {
    if (!pixelId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pixelId]);

  useEffect(() => {
    if (isLoggedIn) {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const unsubscribeOrders = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const unsubscribeInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
        setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubscribeOrders();
        unsubscribeInventory();
      };
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === "hmsolyman33@gmail.com" && adminPassword === "87654321") {
      setIsSubmitting(true);
      try {
        // Try to sign in
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (error: any) {
        // If user doesn't exist, try to create it (bootstrap)
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            alert("Admin account created and logged in!");
          } catch (signUpError: any) {
            alert("Login failed: " + signUpError.message);
          }
        } else {
          alert("Login failed: " + error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsAdminMode(false);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: orderForm.name,
        phone: orderForm.phone,
        address: orderForm.address,
        items: [{ name: "Magic Performance Sports Bra", size: selectedSize, color: selectedColor, quantity: orderForm.quantity }],
        status: "pending",
        createdAt: serverTimestamp()
      });
      setOrderSuccess(true);
      triggerPixelEvent("Purchase");
    } catch (error: any) {
      alert("Order failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePixelId = async (newId: string) => {
    try {
      await setDoc(doc(db, "pixelConfig", "main"), { pixelId: newId, enabled: true });
      setPixelId(newId);
      alert("Pixel ID updated!");
    } catch (error: any) {
      alert("Update failed: " + error.message);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (error: any) {
      alert("Update failed: " + error.message);
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInventoryLoading(true);
    try {
      if (editingItem) {
        await updateDoc(doc(db, "inventory", editingItem.id), {
          ...inventoryForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "inventory"), {
          ...inventoryForm,
          createdAt: serverTimestamp()
        });
      }
      setIsInventoryModalOpen(false);
      setEditingItem(null);
      setInventoryForm({ name: "", sku: "", category: "General", stock: 0, price: 0, image: "" });
    } catch (error: any) {
      alert("Inventory operation failed: " + error.message);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const openInventoryModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setInventoryForm({
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "General",
        stock: item.stock || 0,
        price: item.price || 0,
        image: item.image || ""
      });
    } else {
      setEditingItem(null);
      setInventoryForm({ name: "", sku: "", category: "General", stock: 0, price: 0, image: "" });
    }
    setIsInventoryModalOpen(true);
  };

  const galleryImages = [
    "https://i.ibb.co/v4hy9Xcn/header.jpg",
    "https://i.ibb.co/tMKmHg0N/img1.jpg",
    "https://i.ibb.co/Swb7d8bP/img2.jpg",
    "https://i.ibb.co/DfYrcgMh/img3.jpg",
    "https://i.ibb.co/C5r3WV6X/img4.jpg",
    "https://i.ibb.co/0Vm4Wk67/img5.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (carouselRef.current && contentRef.current) {
        const carouselWidth = carouselRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setDragConstraints({
          left: -(contentWidth - carouselWidth),
          right: 0
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-rose-500" />,
      title: "হাই-কোয়ালিটি ম্যাটেরিয়াল",
      desc: "প্রিমিয়াম নাইলন ও স্প্যানডেক্স দিয়ে তৈরি যা দীর্ঘস্থায়ী।"
    },
    {
      icon: <Wind className="w-6 h-6 text-rose-500" />,
      title: "সফট ও ব্রিদেবল",
      desc: "ভেতরে কটন মোল্ড কাপ যা প্রচণ্ড গরমেও প্রশান্তি দেয়।"
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "বাটারফ্লাই লেস ডিজাইন",
      desc: "চমৎকার ডিজাইন যা আপনাকে দিবে এক ইউনিক ও স্টাইলিশ লুক।"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
      title: "বাড়তি সাপোর্ট",
      desc: "চওড়া ইলাস্টিক বেল্ট যা সারাদিন নিখুঁত সাপোর্ট নিশ্চিত করে।"
    }
  ];

  const sizes = [
    { label: "M", size: "৩৪" },
    { label: "L", size: "৩৬" },
    { label: "XL", size: "৩৮" },
    { label: "2XL", size: "৪০" },
    { label: "3XL", size: "৪২" }
  ];

  const colors = [
    { name: "Black", class: "bg-black", image: "https://i.ibb.co/tMKmHg0N/img1.jpg" },
    { name: "Nude", class: "bg-[#E3C5AF]", image: "https://i.ibb.co/Swb7d8bP/img2.jpg" },
    { name: "Rose", class: "bg-rose-300", image: "https://i.ibb.co/DfYrcgMh/img3.jpg" },
    { name: "Blue", class: "bg-blue-300", image: "https://i.ibb.co/C5r3WV6X/img4.jpg" },
    { name: "Grey", class: "bg-stone-400", image: "https://i.ibb.co/0Vm4Wk67/img5.jpg" }
  ];

  const testimonials = [
    {
      name: "সাদিয়া ইসলাম",
      location: "ঢাকা",
      image: "https://i.ibb.co/tMKmHg0N/img1.jpg",
      rating: 5,
      text: "অসাধারণ একটি প্রোডাক্ট! বাটারফ্লাই ডিজাইনটা সত্যিই ইউনিক আর ম্যাটেরিয়াল অনেক সফট। সারাদিন পরে থাকলেও কোনো অস্বস্তি হয় না।"
    },
    {
      name: "নুসরাত জাহান",
      location: "চট্টগ্রাম",
      image: "https://i.ibb.co/Swb7d8bP/img2.jpg",
      rating: 5,
      text: "আমি এর আগে অনেক স্পোর্টস ব্রা ব্যবহার করেছি, কিন্তু ম্যাজিক পারফরম্যান্সের মতো সাপোর্ট আর কোথাও পাইনি। কালারগুলোও খুব সুন্দর।"
    },
    {
      name: "ফারহানা আক্তার",
      location: "সিলেট",
      image: "https://i.ibb.co/DfYrcgMh/img3.jpg",
      rating: 4,
      text: "খুবই আরামদায়ক। বিশেষ করে জিম করার সময় এটি অনেক ভালো সাপোর্ট দেয়। ডেলিভারিও খুব দ্রুত পেয়েছি। ধন্যবাদ!"
    }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  if (isAdminMode) {
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-stone-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Admin Login</h2>
              <p className="text-stone-500 text-sm mt-2">Enter your credentials to access the panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to Dashboard <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="w-full text-stone-400 font-bold py-2 hover:text-stone-600 transition-colors"
              >
                Back to Store
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-stone-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-stone-100 hidden lg:flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-bold text-stone-900">Magic Admin</span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
              { id: 'orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders' },
              { id: 'inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
              { id: 'pixel', icon: <Settings className="w-5 h-5" />, label: 'Pixel Setup' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-rose-50 text-rose-600 shadow-sm" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-stone-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <header className="bg-white border-b border-stone-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-bold text-stone-900 capitalize">{activeTab}</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAdminMode(false)}
                className="text-sm font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-full"
              >
                View Store
              </button>
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-stone-400" />
              </div>
            </div>
          </header>

          <div className="p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Orders', value: orders.length, icon: <ShoppingCart />, color: 'bg-blue-500' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: <Loader2 />, color: 'bg-amber-500' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: <CheckCircle2 />, color: 'bg-green-500' },
                    { label: 'Pixel Status', value: pixelId ? 'Active' : 'Missing', icon: <Settings />, color: 'bg-rose-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", stat.color)}>
                          {stat.icon}
                        </div>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Stats</span>
                      </div>
                      <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-stone-900">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-rose-500">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-stone-900">{order.customerName}</p>
                              <p className="text-xs text-stone-400">{order.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                order.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-stone-500">
                              {order.createdAt?.toDate().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => updateOrderStatus(order.id, order.status === 'pending' ? 'completed' : 'pending')}
                                className="text-rose-500 hover:text-rose-600 font-bold text-xs"
                              >
                                Toggle Status
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                  <h3 className="font-bold text-stone-900">All Orders ({orders.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Customer & Contact</th>
                        <th className="px-6 py-4">Address</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-stone-900">{order.customerName}</p>
                            <p className="text-xs text-stone-400">{order.phone}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-500 max-w-xs truncate">
                            {order.address}
                          </td>
                          <td className="px-6 py-4">
                            {order.items?.map((item: any, idx: number) => (
                              <p key={idx} className="text-xs text-stone-600">
                                {item.name} ({item.size}/{item.color}) x{item.quantity}
                              </p>
                            ))}
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-stone-50 border-none rounded-lg px-3 py-1 text-xs font-bold outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={async () => {
                                  if(confirm("Delete this order?")) {
                                    await deleteDoc(doc(db, "orders", order.id));
                                  }
                                }}
                                className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  const bookingId = "STE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
                                  await updateDoc(doc(db, "orders", order.id), { 
                                    status: "shipped",
                                    courierStatus: "booked",
                                    bookingId: bookingId
                                  });
                                  alert(`Courier Booked! ID: ${bookingId}`);
                                }}
                                disabled={order.status === 'shipped' || order.status === 'completed'}
                                className={cn(
                                  "p-2 transition-colors",
                                  order.status === 'shipped' || order.status === 'completed' 
                                    ? "text-stone-200 cursor-not-allowed" 
                                    : "text-stone-400 hover:text-blue-500"
                                )}
                                title="Book Courier"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            </div>
                            {order.bookingId && (
                              <p className="text-[10px] text-blue-500 font-bold mt-1">ID: {order.bookingId}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">Inventory Management</h3>
                    <p className="text-sm text-stone-500">Manage your product stock and details</p>
                  </div>
                  <button 
                    onClick={() => openInventoryModal()}
                    className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Product
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="text"
                      placeholder="Search products..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <select 
                    value={inventoryCategory}
                    onChange={(e) => setInventoryCategory(e.target.value)}
                    className="bg-stone-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <div className="flex items-center justify-end px-2">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Items: {inventory.length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {inventory
                          .filter(item => {
                            const matchesSearch = item.name?.toLowerCase().includes(inventorySearch.toLowerCase()) || item.sku?.toLowerCase().includes(inventorySearch.toLowerCase());
                            const matchesCategory = inventoryCategory === "All" || item.category === inventoryCategory;
                            return matchesSearch && matchesCategory;
                          })
                          .map((item) => (
                          <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Package className="w-5 h-5 text-stone-400" />
                                  )}
                                </div>
                                <span className="font-bold text-stone-900">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-stone-500 font-mono">{item.sku || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-[10px] font-bold uppercase">{item.category || 'General'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "font-bold",
                                item.stock <= 5 ? "text-rose-500" : item.stock <= 15 ? "text-amber-500" : "text-green-500"
                              )}>
                                {item.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-stone-900">৳{item.price}</td>
                            <td className="px-6 py-4">
                              {item.stock <= 0 ? (
                                <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold uppercase">Out of Stock</span>
                              ) : item.stock <= 10 ? (
                                <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase">Low Stock</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase">In Stock</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openInventoryModal(item)}
                                  className="p-2 text-stone-400 hover:text-blue-500 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(confirm("Delete this product?")) {
                                      await deleteDoc(doc(db, "inventory", item.id));
                                    }
                                  }}
                                  className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pixel' && (
              <div className="max-w-2xl">
                <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">Facebook Pixel Setup</h3>
                  <p className="text-stone-500 mb-8">Enter your Facebook Pixel ID to track events like ViewContent, Purchase, and Scroll depth.</p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Pixel ID</label>
                      <input 
                        type="text" 
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        placeholder="e.g. 123456789012345"
                      />
                    </div>
                    <button 
                      onClick={() => updatePixelId(pixelId)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Save Configuration
                    </button>
                  </div>

                  <div className="mt-10 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" /> Active Events
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'Purchase (on order success)',
                        'ViewContent_50 (50% scroll)',
                        'ViewContent_75 (75% scroll)',
                        'ViewContent_95 (95% scroll)',
                        'PageView (automatic)'
                      ].map((ev, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-stone-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900">Magic Performance</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">বৈশিষ্ট্য</a>
              <a href="#video" onClick={(e) => handleNavClick(e, 'video')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">ভিডিও</a>
              <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">রিভিউ</a>
              <a href="#details" onClick={(e) => handleNavClick(e, 'details')} className="text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors">বিস্তারিত</a>
              <a href="#order" onClick={(e) => handleNavClick(e, 'order')} className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">অর্ডার করুন</a>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-stone-100 px-4 py-6 flex flex-col gap-4"
          >
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-lg font-medium text-stone-800">বৈশিষ্ট্য</a>
            <a href="#video" onClick={(e) => handleNavClick(e, 'video')} className="text-lg font-medium text-stone-800">ভিডিও</a>
            <a href="#testimonials" onClick={(e) => handleNavClick(e, 'testimonials')} className="text-lg font-medium text-stone-800">রিভিউ</a>
            <a href="#details" onClick={(e) => handleNavClick(e, 'details')} className="text-lg font-medium text-stone-800">বিস্তারিত</a>
            <a href="#order" onClick={(e) => handleNavClick(e, 'order')} className="bg-rose-500 text-white px-6 py-3 rounded-xl text-center font-bold">অর্ডার করুন</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
              প্রিমিয়াম কোয়ালিটি স্পোর্টস ব্রা
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 leading-[1.1] mb-6">
              ম্যাজিক পারফরম্যান্স — <br />
              <span className="text-rose-500 italic">স্টাইল ও কমফোর্টের</span> সেরা কম্বো!
            </h1>
            <p className="text-lg text-stone-600 mb-8 max-w-lg leading-relaxed">
              সারাদিন সতেজ আর আত্মবিশ্বাসী থাকতে চান? আমাদের এই স্পোর্টস ব্রা আপনার ডেলি লাইফ আর ওয়ার্কআউটকে করবে আরও সহজ ও আরামদায়ক। এর চমৎকার Butterfly Lace Design আপনাকে দিবে এক ইউনিক লুক। 🦋
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#order" 
                onClick={(e) => handleNavClick(e, 'order')}
                className="flex items-center justify-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 group"
              >
                এখনই কিনুন 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="flex items-center gap-3 px-4">
                <div className="flex -space-x-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                      <img src={`https://i.ibb.co/C5r3WV6X/img4.jpg`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-stone-500 font-medium">৫০০০+ সন্তুষ্ট গ্রাহক</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-rose-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:ml-auto">
              {galleryImages.map((img, i) => (
                <div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img 
                    src={img} 
                    alt={`Product detail ${i + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <motion.section 
        id="video" 
        ref={videoSectionRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-stone-900 text-white overflow-hidden relative scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                পণ্যটি সরাসরি <span className="text-rose-500">অ্যাকশনে</span> দেখুন
              </h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                আমাদের স্পোর্টস ব্রা-এর ফিটিং, কমফোর্ট এবং স্টাইল সরাসরি ভিডিওতে দেখে নিন। এটি আপনার শরীরের সাথে নিখুঁতভাবে ফিট হয় এবং ওয়ার্কআউটের সময় সর্বোচ্চ সাপোর্ট নিশ্চিত করে।
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">প্রিমিয়াম কোয়ালিটি</p>
                    <p className="text-sm text-stone-400">ভিডিওতে কাপড়ের মান যাচাই করুন</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">নিখুঁত ফিটিং</p>
                    <p className="text-sm text-stone-400">শরীরের সাথে মানানসই ডিজাইন</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-[350px] aspect-[9/16] bg-stone-800 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-stone-700 relative group">
                {isVideoInView && (
                  <iframe 
                    src="https://www.youtube.com/embed/7gk2QRdY6yI?autoplay=1&mute=1&loop=1&playlist=7gk2QRdY6yI&rel=0" 
                    title="Magic Performance Sports Bra Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">কেন এটি আপনার সংগ্রহে রাখা জরুরি?</h2>
            <p className="text-stone-500">সেরা মানের ম্যাটেরিয়াল এবং আধুনিক ডিজাইনের সমন্বয় যা আপনাকে দিবে সর্বোচ্চ আরাম।</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-xl hover:shadow-rose-100/50"
              >
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-rose-50/50 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">গ্রাহকদের মতামত</h2>
            <p className="text-stone-500">আমাদের সন্তুষ্ট গ্রাহকদের কাছ থেকে সরাসরি শুনে নিন তাদের অভিজ্ঞতার কথা।</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-rose-100 relative"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={cn("w-4 h-4 fill-current", idx >= t.rating && "text-stone-200")} 
                    />
                  ))}
                </div>
                <p className="text-stone-600 mb-8 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-100" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-stone-900">{t.name}</h4>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Product Details & Size Guide */}
      <motion.section 
        id="details" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-stone-50 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6 md:mb-8 flex items-center gap-3">
                <Palette className="text-rose-500" /> সাইজ গাইড
              </h2>
              
              <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">সাইজ বেছে নিন</p>
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">সোয়াইপ করুন →</span>
                </div>
                
                <div className="relative" ref={carouselRef}>
                  <motion.div 
                    ref={contentRef}
                    drag="x"
                    dragConstraints={dragConstraints}
                    dragElastic={0.1}
                    className="flex gap-2 md:gap-4 cursor-grab active:cursor-grabbing py-2"
                  >
                    {sizes.map((s, i) => (
                      <motion.div 
                        key={i} 
                        onClick={() => setSelectedSize(s.label)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex-shrink-0 w-14 md:w-28 text-center p-2 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 relative group",
                          selectedSize === s.label 
                            ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-200 scale-105" 
                            : "bg-stone-50 border-stone-100 text-stone-900 hover:border-rose-200"
                        )}
                      >
                        {selectedSize === s.label && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-white text-rose-500 rounded-full p-0.5 shadow-md border border-rose-100"
                          >
                            <Check className="w-2 h-2 md:w-3 md:h-3" />
                          </motion.div>
                        )}
                        <p className={cn("text-lg md:text-2xl font-black", selectedSize === s.label ? "text-white" : "text-rose-500")}>{s.label}</p>
                        <p className={cn("text-[10px] md:text-xs font-bold", selectedSize === s.label ? "text-rose-100" : "text-stone-400")}>({s.size})</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <p className="mt-8 text-sm text-stone-500 italic flex items-center gap-2 mb-6">
                  <Maximize2 className="w-4 h-4" /> আপনার সঠিক সাইজটি বেছে নিন নিখুঁত ফিটিংয়ের জন্য।
                </p>

                <div className="mt-6 border-t border-stone-100 pt-6">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">সাইজ চার্ট (ইঞ্চি)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="py-2 font-bold text-stone-900">সাইজ</th>
                          <th className="py-2 font-bold text-stone-900">বক্ষ (Bust)</th>
                          <th className="py-2 font-bold text-stone-900">উপযুক্ত (Weight)</th>
                        </tr>
                      </thead>
                      <tbody className="text-stone-600">
                        {sizes.map((s, i) => (
                          <tr key={i} className={cn("border-b border-stone-50 last:border-0", selectedSize === s.label && "bg-rose-50/50")}>
                            <td className="py-2 font-bold">{s.label}</td>
                            <td className="py-2">{s.size}"</td>
                            <td className="py-2">{i === 0 ? "৪৫-৫০" : i === 1 ? "৫০-৫৫" : i === 2 ? "৫৫-৬০" : i === 3 ? "৬০-৬৫" : "৬৫-৭০"} কেজি</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-rose-500 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-6">প্রোডাক্ট স্পেসিফিকেশন</h3>
                <ul className="space-y-4">
                  {[
                    "ম্যাটেরিয়াল: হাই-কোয়ালিটি নাইলন ও স্প্যানডেক্স",
                    "সফট টাচ: ভেতরে কটন মোল্ড কাপ",
                    "ডিজাইন: সিমলেস এবং গ্যাদার ফাংশন",
                    "সাপোর্ট: চওড়া ইলাস্টিক বেল্ট",
                    "কালার: ৫টি আকর্ষণীয় কালার"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-rose-200" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img src="https://i.ibb.co/tMKmHg0N/img1.jpg" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="aspect-square rounded-3xl overflow-hidden">
                  <img src="https://i.ibb.co/Swb7d8bP/img2.jpg" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Order Section */}
      <motion.section 
        id="order" 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white relative overflow-hidden scroll-mt-16"
      >
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="bg-stone-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">অর্ডার কনফার্ম করুন</h2>
              <p className="text-stone-400">নিচের ফর্মটি পূরণ করে আপনার অর্ডারটি সম্পন্ন করুন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
            </div>

            {orderSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-rose-500/10 rounded-[2rem] border border-rose-500/20"
              >
                <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">ধন্যবাদ! আপনার অর্ডারটি সফল হয়েছে।</h3>
                <p className="text-stone-400 mb-8">আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
                <button 
                  onClick={() => setOrderSuccess(false)}
                  className="bg-rose-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-600 transition-all"
                >
                  আরেকটি অর্ডার করুন
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleOrderSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">আপনার নাম</label>
                  <input 
                    type="text" 
                    required
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    placeholder="পুরো নাম লিখুন" 
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">মোবাইল নম্বর</label>
                  <input 
                    type="tel" 
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    placeholder="০১৭XXXXXXXX" 
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-400 uppercase">পুরো ঠিকানা</label>
                <textarea 
                  rows={3} 
                  required
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder="আপনার বর্তমান ঠিকানা লিখুন" 
                  className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">সাইজ নির্বাচন করুন</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none appearance-none"
                  >
                    {sizes.map((s) => (
                      <option key={s.label} value={s.label}>{s.label} ({s.size})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase">কালার নির্বাচন করুন</label>
                  <select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-stone-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500 transition-all outline-none appearance-none"
                  >
                    {colors.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-3 mt-8"
              >
                <ShoppingBag className="w-6 h-6" /> {isSubmitting ? "প্রসেসিং..." : "অর্ডার কনফার্ম করুন"}
              </button>
            </form>
            )}

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-stone-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> ক্যাশ অন ডেলিভারি
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> ৩ দিনের মধ্যে রিটার্ন
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> সারা বাংলাদেশে হোম ডেলিভারি
              </div>
            </div>
          </div>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-20 w-64 h-64 bg-rose-100 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl -z-0"></div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900">Magic Performance</span>
          </div>
          <p className="text-stone-500 text-sm">© ২০২৬ ম্যাজিক পারফরম্যান্স। সর্বস্বত্ব সংরক্ষিত।</p>
          <button 
            onClick={() => setIsAdminMode(true)}
            className="mt-4 text-[10px] text-stone-300 hover:text-stone-400 transition-colors uppercase tracking-[0.2em] font-bold"
          >
            Admin Access
          </button>
        </div>
      </footer>

      {/* Inventory Modal */}
      <AnimatePresence>
        {isInventoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInventoryModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-stone-900">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleInventorySubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text"
                    required
                    value={inventoryForm.name}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    placeholder="e.g. Magic Sports Bra"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">SKU</label>
                    <input 
                      type="text"
                      value={inventoryForm.sku}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                      placeholder="SKU-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category</label>
                    <select 
                      value={inventoryForm.category}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    >
                      <option value="General">General</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stock Quantity</label>
                    <input 
                      type="number"
                      required
                      value={inventoryForm.stock}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, stock: parseInt(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price (৳)</label>
                    <input 
                      type="number"
                      required
                      value={inventoryForm.price}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, price: parseInt(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Image URL (Optional)</label>
                  <input 
                    type="url"
                    value={inventoryForm.image}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, image: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isInventoryLoading}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  {isInventoryLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {editingItem ? 'Update Product' : 'Save Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
