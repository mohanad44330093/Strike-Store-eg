"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyD5QzxJsQe9x-IqPY5_rVFL_5itPUcI9sQ",
  authDomain: "strik-store.firebaseapp.com",
  databaseURL: "https://strik-store-default-rtdb.firebaseio.com",
  projectId: "strik-store",
  storageBucket: "strik-store.firebasestorage.app",
  messagingSenderId: "524403653148",
  appId: "1:524403653148:web:8756216aad2db867bb3dd9",
  measurementId: "G-Z1ME3G1FKX",
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

const db = getFirestore(app);


import "./page.css";


const AboutUs = dynamic(() => import("../AboutUs/page"), {
  ssr: false,
});

/* ================= TYPES ================= */

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  discount?: number;
  images?: string[];
  stockState?: boolean;
}

interface CartProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

/* ================= HELPERS ================= */

const getFinalPrice = (product: Product) => {
  if (product.discount && product.discount > 0) {
    return Number((product.price * (1 - product.discount / 100)).toFixed(2));
  }
  return product.price;
};

/* ================= PRODUCT IMAGE SLIDER ================= */

function ProductImageSlider({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);  // ← جديد
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="product_image_wrapper no_image">
        <span className="material-symbols-outlined">image_not_supported</span>
      </div>
    );
  }

  const goTo = (index: number) =>
    setCurrentIndex((index + validImages.length) % validImages.length);

  return (
    <>
      <div className="product_image_wrapper">
        {validImages.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${title} - ${i + 1}`}
            className={`product_image ${i === currentIndex ? "slide_active" : ""}`}
            onClick={() => setLightboxOpen(true)}   // ← جديد
            style={{ cursor: "zoom-in" }}           // ← جديد
          />
        ))}
        {validImages.length > 1 && (
          <>
            <button
              className="slide_arrow slide_arrow_left"
              onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
            >‹</button>
            <button
              className="slide_arrow slide_arrow_right"
              onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
            >›</button>
            <div className="slide_dots">
              {validImages.map((_, i) => (
                <button
                  key={i}
                  className={`slide_dot ${i === currentIndex ? "slide_dot_active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}  {/* ← جديد */}
      {lightboxOpen && (
        <ImageLightbox
          images={validImages}
          initialIndex={currentIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/* ================= IMAGE LIGHTBOX ================= */

function ImageLightbox({
  images, initialIndex, title, onClose,
}: {
  images: string[]; initialIndex: number; title: string; onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  const validImages = images.filter(Boolean);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [currentIndex, scale]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goTo = (index: number) => {
    setCurrentIndex((index + validImages.length) % validImages.length);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };
  const resetZoom = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    setStartDrag({ x: e.clientX, y: e.clientY });
    setStartOffset({ ...offset });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: startOffset.x + (e.clientX - startDrag.x),
      y: startOffset.y + (e.clientY - startDrag.y),
    });
  };
  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1) return;
    const t = e.touches[0];
    setDragging(true);
    setStartDrag({ x: t.clientX, y: t.clientY });
    setStartOffset({ ...offset });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({
      x: startOffset.x + (t.clientX - startDrag.x),
      y: startOffset.y + (t.clientY - startDrag.y),
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  return (
    <div className="lightbox_overlay" onClick={onClose}>
      <div className="lightbox_container" onClick={(e) => e.stopPropagation()}>

        {/* Top Bar */}
        <div className="lightbox_topbar">
          <span className="lightbox_title">{title}</span>
          <div className="lightbox_controls">
            <button className="lb_btn" onClick={zoomOut} disabled={scale <= 1} title="Zoom Out">
              <span className="material-symbols-outlined">zoom_out</span>
            </button>
            <span className="lb_zoom_label">{Math.round(scale * 100)}%</span>
            <button className="lb_btn" onClick={zoomIn} disabled={scale >= 4} title="Zoom In">
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button className="lb_btn" onClick={resetZoom} title="Reset">
              <span className="material-symbols-outlined">zoom_out_map</span>
            </button>
            <button className="lb_btn lb_close_btn" onClick={onClose} title="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Image Area */}
        <div
          className={`lightbox_image_area ${scale > 1 ? "grab_cursor" : ""} ${dragging ? "grabbing_cursor" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setDragging(false)}
          onWheel={handleWheel}
        >
          <img
            src={validImages[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="lightbox_img"
            draggable={false}
            style={{
              transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
              transition: dragging ? "none" : "transform 0.2s ease",
              cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              className="lb_arrow lb_arrow_left"
              onClick={() => goTo(currentIndex - 1)}
            >‹</button>
            <button
              className="lb_arrow lb_arrow_right"
              onClick={() => goTo(currentIndex + 1)}
            >›</button>
          </>
        )}

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="lightbox_thumbnails">
            {validImages.map((url, i) => (
              <button
                key={i}
                className={`lb_thumb ${i === currentIndex ? "lb_thumb_active" : ""}`}
                onClick={() => goTo(i)}
              >
                <img src={url} alt={`${title} - ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="lightbox_counter">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
}

/* ================= TOAST ================= */

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`toast_notification ${visible ? "toast_visible" : ""}`}>
      <span className="material-symbols-outlined">check_circle</span>
      {message}
    </div>
  );
}

/* ================= SEARCH BAR WITH SUGGESTIONS ================= */

function SearchBarWithSuggestions({
  products, isArabic, onAddToCart,
}: {
  products: Product[]; isArabic: boolean; onAddToCart: (p: Product) => void;
}) {
  const [queryVal, setQueryVal] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = queryVal.trim().length === 0
    ? []
    : products.filter((p) =>
      p.title.toLowerCase().includes(queryVal.toLowerCase()) ||
      p.description.toLowerCase().includes(queryVal.toLowerCase())
    ).slice(0, 6);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = focused && queryVal.trim().length > 0;

  return (
    <div className="smart_search_wrapper" ref={containerRef}>
      <div className={`smart_search_box ${focused ? "focused" : ""}`}>
        <span className="material-symbols-outlined search_icon_inner">search</span>
        <input
          type="text"
          placeholder={isArabic ? "ابحث عن منتج..." : "Search products..."}
          value={queryVal}
          onChange={(e) => setQueryVal(e.target.value)}
          onFocus={() => setFocused(true)}
          className="smart_search_input"
          autoComplete="off"
        />
        {queryVal && (
          <button className="search_clear_btn" onClick={() => { setQueryVal(""); setFocused(false); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search_dropdown">
          {suggestions.length === 0 ? (
            <div className="search_no_results_inline">
              <span className="material-symbols-outlined">search_off</span>
              <span>{isArabic ? "لا توجد نتائج" : "No results found"}</span>
            </div>
          ) : (
            suggestions.map((product) => (
              <div key={product.id} className="search_suggestion_item">
                <div className="suggestion_image">
                  <img src={product.images?.[0] ?? ""} alt={product.title} />
                </div>
                <div className="suggestion_info">
                  <p className="suggestion_title">{product.title}</p>
                  <div className="suggestion_price">
                    {product.discount && product.discount > 0 ? (
                      <>
                        <span className="suggestion_original">{product.price} EGP</span>
                        <span className="suggestion_discounted">{getFinalPrice(product).toFixed(2)} EGP</span>
                      </>
                    ) : (
                      <span className="suggestion_final">{product.price} EGP</span>
                    )}
                  </div>
                </div>
                <button
                  className={`suggestion_add_btn ${product.stockState === false ? "out_of_stock_btn" : ""}`}
                  disabled={product.stockState === false}
                  onClick={() => { if(product.stockState !== false){ onAddToCart(product); setQueryVal(""); setFocused(false); } }}
                >
                  <span className="material-symbols-outlined">
                    {product.stockState === false ? "block" : "shopping_bag"}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ================= SETTINGS MODAL ================= */

function SettingsModal({
  visible, onClose, language, onLanguageChange, isArabic,
}: {
  visible: boolean; onClose: () => void; language: string;
  onLanguageChange: (lang: "en" | "ar") => void; isArabic: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="settings_modal_overlay" onClick={onClose}>
      <div className="settings_modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings_header">
          <h2>{isArabic ? "الإعدادات" : "Settings"}</h2>
          <button className="close_settings" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="settings_content">
          <div className="setting_group">
            <label className="setting_label">{isArabic ? "اللغة" : "Language"}</label>
            <div className="language_options">
              <button className={`lang_option ${language === "en" ? "active" : ""}`} onClick={() => onLanguageChange("en")}>
                🇺🇸 English
              </button>
              <button className={`lang_option ${language === "ar" ? "active" : ""}`} onClick={() => onLanguageChange("ar")}>
                🇪🇬 العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HERO SECTION ================= */

function HeroSection({ isArabic, onShopNow, onLearnMore }: {
  isArabic: boolean; onShopNow: () => void; onLearnMore: () => void;
}) {
  return (
    <section className="hero_section">
      <div className="hero_content">
        <div className="hero_badge">
          {isArabic ? "ملابس رياضيه ممتازه" : "PREMIUM COMPRESSION WEAR"}
        </div>
        <img src="./images/StrikeWhiteLogo.png" alt="STRIKE." className="strike_hero_logo_img" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
        <h1 className="Strike_Logo_for_hero_section hidden">
          STRIKE<span className="dot">.</span>
        </h1>
        <p className="hero_description">
          {isArabic
            ? "اكتشف قوة الأداء الحقيقي. ملابس رياضية مصممة للرياضيين الجادين — خامات متطورة، تصميم محكم، وأداء يتخطى الحدود."
            : "Unlock your true performance. Engineered compression wear built for serious athletes — advanced fabrics, sculpted fit, and performance that breaks limits."}
        </p>
        <div className="hero_buttons">
          <button className="shop_btn" onClick={onShopNow}>
            {isArabic ? "تسوق الآن" : "Shop Now"}
          </button>
          <button className="learn_btn" onClick={onLearnMore}>
            {isArabic ? "اعرف أكثر" : "Learn More"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURE SECTION ================= */

function FeatureSection({ isArabic }: { isArabic: boolean }) {
  const features = isArabic ? [
    { icon: "bolt", title: "افضل اداء", description: "خامة مميزه مصممة لدعم العضلات أثناء الحركات المتفجرة." },
    { icon: "air", title: "راحة فائقة", description: "تقنية متطورة لامتصاص العرق تبقيك منتعشاً وجافاً." },
    { icon: "verified", title: "جودة عالية", description: "خامات مختبرة من قبل رياضيين محترفين تدوم طويلاً." },
  ] : [
    { icon: "bolt", title: "Maximum Performance", description: "Engineered compression fabric that supports muscles during explosive movements." },
    { icon: "air", title: "Breathable Comfort", description: "Advanced moisture-wicking technology keeps you cool, dry, and focused." },
    { icon: "verified", title: "Premium Quality", description: "Athlete-tested materials built to outlast your toughest training days." },
  ];

  return (
    <section className="features_section" id="target_box">
      {features.map((f, i) => (
        <div className="feature_box" key={i}>
          <span className="material-symbols-outlined feature_icon">{f.icon}</span>
          <h2>{f.title}</h2>
          <p>{f.description}</p>
        </div>
      ))}
    </section>
  );
}

/* ================= SIDE MENU ================= */

function SideMenu({
  isArabic,
  isOpen,
  onClose,
  onNavigate,
}: {
  isArabic: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const router = useRouter();

  const links = isArabic
    ? [
      { id: "short-sleeves", label: "أكمام قصيرة", icon: "apparel" },
      { id: "long-sleeves", label: "أكمام طويلة", icon: "styler" },
      { id: "tank-top", label: "تانك توب", icon: "fitness_center" },
      { id: "target_box", label: "المميزات", icon: "star" },
      { id: "about-us", label: "من نحن", icon: "info" },
    ]
    : [
      { id: "short-sleeves", label: "Short Sleeves", icon: "apparel" },
      { id: "long-sleeves", label: "Long Sleeves", icon: "styler" },
      { id: "tank-top", label: "Tank Tops", icon: "fitness_center" },
      { id: "target_box", label: "Features", icon: "star" },
      { id: "about-us", label: "About Us", icon: "info" },
    ];

  return (
    <nav className={`List ${isOpen ? "open" : ""} ${isArabic ? "rtl" : "ltr"}`}>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <button
              className="object"
              onClick={() => {
                if (link.id === "about-us") {
                  router.push("/AboutUs");
                  onClose();
                  return;
                }

                onNavigate(link.id);
                onClose();
              }}
            >
              <span className="material-symbols-outlined object_icon">
                {link.icon}
              </span>
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ================= MARKET LIST (CART) ================= */

function MarketList({ isArabic, isOpen, items, onClose, onRemove, onIncrease, onDecrease }: {
  isArabic: boolean; isOpen: boolean; items: CartProduct[];
  onClose: () => void; onRemove: (id: string) => void;
  onIncrease: (id: string) => void; onDecrease: (id: string) => void;
}) {
  const router = useRouter();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {isOpen && <div className="cart_overlay" onClick={onClose} />}
      <aside className={`market_list ${isOpen ? "open" : ""} ${isArabic ? "rtl" : "ltr"}`}>
        <div className="market_header">
          <h2>{isArabic ? "سلة التسوق" : "Shopping Cart"}</h2>
          <button className="close_cart" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="market_products">
              {items.map((item) => (
                <div key={item.id} className="cart_product">
                  <div className="cart_product_image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="cart_product_info">
                    <h3>{item.title}</h3>
                    <p>{item.price.toFixed(2)} EGP</p>
                    <div className="quantity_controls">
                      <button className="qty_btn" onClick={() => onDecrease(item.id)}>−</button>
                      <span className="qty_display">{item.quantity}</span>
                      <button className="qty_btn" onClick={() => onIncrease(item.id)}>+</button>
                    </div>
                  </div>
                  <button className="remove_btn" onClick={() => onRemove(item.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="market_footer">
              <div className="total_price">
                <span>{isArabic ? "المجموع" : "Total"}:</span>
                <h3>{total.toFixed(2)} EGP</h3>
              </div>
              <button className="checkout_btn" onClick={() => { onClose(); router.push("/checkout"); }}>
                {isArabic ? "الدفع" : "Checkout"}
              </button>
            </div>
          </>
        ) : (
          <div className="empty_cart">
            <span className="material-symbols-outlined">shopping_cart</span>
            <p>{isArabic ? "السلة فارغة" : "Your cart is empty"}</p>
          </div>
        )}
      </aside>
    </>
  );
}

/* ================= HEADER ================= */

function Header({
  isArabic, products, cartCount, isMenuOpen,
  onToggleMenu, onToggleCart, onOpenSettings, onAddToCart,
}: {
  isArabic: boolean; products: Product[]; cartCount: number; isMenuOpen: boolean;
  onToggleMenu: () => void; onToggleCart: () => void;
  onOpenSettings: () => void; onAddToCart: (p: Product) => void;
}) {
  return (
    <header className="strike_header">
      <div className="header_top_row">
        <div className="header_left">
          <button className={`List_box ${isMenuOpen ? "active" : ""}`} onClick={onToggleMenu}>
            <div className="top_line"></div>
            <div className="middle_line"></div>
            <div className="end_line"></div>
          </button>
          <a href="#" className="Logo">
            <img src="./images/StrikeWhiteLogo.png" alt="STRIKE." className="strike_header_logo_img" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <span className="Strike_Logo_For_Header hidden">STRIKE<span className="dot">.</span></span>
          </a>
        </div>

        <div className="header_right">
          <div className="market_cart">
            <button className="cart_btn" onClick={onToggleCart}>
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && <span className="counter">{cartCount}</span>}
            </button>
            <button className="settings_btn" onClick={onOpenSettings}>
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="header_bottom_row">
        <SearchBarWithSuggestions products={products} isArabic={isArabic} onAddToCart={onAddToCart} />
      </div>
    </header>
  );
}

/* ================= MAIN PAGE ================= */

export default function MainPageEN() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isHydrated, setIsHydrated] = useState(false);
  const isArabic = language === "ar";

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const shortSleevesScrollRef = useRef<HTMLDivElement>(null);
  const longSleevesScrollRef = useRef<HTMLDivElement>(null);
  const tankTopScrollRef = useRef<HTMLDivElement>(null);

  const shortSleevesProducts = allProducts.filter((p) => p.category === "Short Sleeves Compression");
  const longSleevesProducts = allProducts.filter((p) => p.category === "Long Sleeves Compression");
  const tankTopProducts = allProducts.filter((p) => p.category === "Top Tank Compression");

  /* ---- Initialize Firebase and Load Products ---- */
  useEffect(() => {
    try {
      const q = query(collection(db, "products"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const allProds: Product[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            allProds.push({
              id: doc.id,
              title: data.title || "",
              category: data.category || "",
              price: data.price || 0,
              description: data.description || "",
              discount: data.discount || 0,
              images: Array.isArray(data.images) ? data.images : [],
              stockState: data.stockState !== false,
            });
          });
          setAllProducts(allProds);
          setLoading(false);
          setFirebaseError(null);
        },
        (error) => {
          console.error("Firebase Error:", error);
          setFirebaseError("Failed to load products. Please refresh the page.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setFirebaseError("Failed to initialize Firebase.");
      setLoading(false);
    }
  }, []);

  /* ---- Hydration & Language Setup ---- */
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem("UserLanguage");
    if (saved === "Arabic") setLanguage("ar");
  }, []);

  /* ---- Load Cart from LocalStorage ---- */
  useEffect(() => {
    if (isHydrated) {
      const saved = localStorage.getItem("strike_cart");
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch {
          setCartItems([]);
        }
      }
    }
  }, [isHydrated]);

  /* ---- Manage Body Scroll ---- */
  useEffect(() => {
    if (isCartOpen || isMenuOpen) {
      document.body.classList.add("no_scroll");
    } else {
      document.body.classList.remove("no_scroll");
    }
    return () => document.body.classList.remove("no_scroll");
  }, [isCartOpen, isMenuOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
    localStorage.setItem("UserLanguage", newLanguage === "ar" ? "Arabic" : "English");
    setSettingsModalVisible(false);
    window.location.reload();
  };

  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const finalPrice = getFinalPrice(product);
      const updated = existing
        ? prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1, price: finalPrice } : item)
        : [...prev, { id: product.id, title: product.title, image: product.images?.[0] ?? "", price: finalPrice, quantity: 1 }];
      localStorage.setItem("strike_cart", JSON.stringify(updated));
      return updated;
    });
    showToast(`${product.title} ${isArabic ? "تمت الإضافة للسلة" : "added to cart!"}`);
  }, [isArabic]);

  const removeItem = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("strike_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const increaseQuantity = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      localStorage.setItem("strike_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const decreaseQuantity = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item);
      localStorage.setItem("strike_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });
  };

  const ProductSlider = ({
    title, products, scrollRef, sectionId,
  }: {
    title: string; products: Product[];
    scrollRef: React.RefObject<HTMLDivElement | null>; sectionId: string;
  }) => (
    <section className="slider_section" id={sectionId}>
      <div className="slider_header">
        <h2 className="slider_title">{title}</h2>
      </div>
      <div className="slider_controls">
        <button className="slider_arrow" onClick={() => scroll(scrollRef, "left")}>‹</button>
        <button className="slider_arrow" onClick={() => scroll(scrollRef, "right")}>›</button>
      </div><br /><br />
      {products.length === 0 ? (
        <div className="slider_empty">{isArabic ? "سيتم الاضافة قريباً" : "Coming Soon"}</div>
      ) : (
        <div className="slider_container" ref={scrollRef}>
          {products.map((product) => (
            <div className="product_card" key={product.id}>
              <div className="card_image_area">
                <ProductImageSlider images={product.images ?? []} title={product.title} />
                {product.discount !== 0 && <div className="discount_badge">-{product.discount}%</div>}
              </div>
              <div className="product_info">
                <h3 className="product_title">{product.title}</h3>
                <p className="product_description">{product.description}</p>
                <div className="product_price_section">
                  {product.discount && product.discount > 0 ? (
                    <div className="price_container">
                      <span className="original_price">{product.price} EGP</span>
                      <span className="discounted_price">{getFinalPrice(product).toFixed(2)} EGP</span>
                    </div>
                  ) : (
                    <span className="product_price">{product.price} EGP</span>
                  )}
                </div>
                {product.stockState === false ? (
                <button className="add_to_cart_btn out_of_stock_main_btn" disabled>
                  <span className="material-symbols-outlined">block</span>
                  {isArabic ? "نفدت الكمية" : "Out Of Stock"}
                </button>
                ) : (
                <button className="add_to_cart_btn" onClick={() => addToCart(product)}>
                  <span className="material-symbols-outlined">shopping_bag</span>
                  {isArabic ? "أضف للسلة" : "Add To Cart"}
                </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  

  // Prevent rendering until hydrated (fixes redirect layout issue)
  if (!isHydrated) {
    return (
      <div className={`strike_page_root container ${isArabic ? "rtl" : "ltr"}`}>
        <div className="sliders_loading">
          <div className="loading_spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast message={'Added To Cart'} visible={toastVisible} />

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        isArabic={isArabic}
      />

      <SideMenu
        isArabic={isArabic}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={scrollToSection}
      />

      <MarketList
        isArabic={isArabic}
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onRemove={removeItem}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
      />

      <div className={`strike_page_root container ${isArabic ? "rtl" : "ltr"}`}>
        <Header
          isArabic={isArabic}
          products={allProducts}
          cartCount={cartCount}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((v) => !v)}
          onToggleCart={() => setIsCartOpen((v) => !v)}
          onOpenSettings={() => setSettingsModalVisible(true)}
          onAddToCart={addToCart}
        />

        <HeroSection
          isArabic={isArabic}
          onShopNow={() => scrollToSection("short-sleeves")}
          onLearnMore={() => scrollToSection("target_box")}
        />

        <FeatureSection isArabic={isArabic} />

        {firebaseError && (
          <div className="error_banner">
            <p>{firebaseError}</p>
          </div>
        )}

        {loading ? (
          <div className="sliders_loading">
            <div className="loading_spinner"></div>
            <p>{isArabic ? "جاري تحميل المنتجات من قاعدة البيانات..." : "Loading Products from Database..."}</p>
          </div>
        ) : (
          <div className="sliders_wrapper">
            <ProductSlider
              title={isArabic ? "أكمام قصيره" : "Short Sleeves Compression"}
              products={shortSleevesProducts}
              scrollRef={shortSleevesScrollRef}
              sectionId="short-sleeves"
            />
            <ProductSlider
              title={isArabic ? "أكمام طويلة" : "Long Sleeves Compression"}
              products={longSleevesProducts}
              scrollRef={longSleevesScrollRef}
              sectionId="long-sleeves"
            />
            <ProductSlider
              title={isArabic ? "تانك توب" : "Tank Top"}
              products={tankTopProducts}
              scrollRef={tankTopScrollRef}
              sectionId="tank-top"
            />
          </div>
        )}
      </div>

      <footer className="main_footer">
        <div className="footer_wrapper">
          <div className="footer_bottom">
            <p className="footer_copyright">© 2026 STRIKE.</p>
          </div>
        </div>
      </footer>
    </>
  );
}  