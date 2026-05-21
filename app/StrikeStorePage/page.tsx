"use client";

import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";

const aboutUsPath = "../AboutUs/";
const AboutUs = lazy(() => import(aboutUsPath).catch(() => ({
  default: () => (
    <Link href={aboutUsPath}></Link>
  )
})));
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query } from "firebase/firestore";
import "./page.css";
import Link from "next/link";

/* ================= FIREBASE CONFIG ================= */

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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/* ================= TYPES ================= */

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  discount?: number;
  images?: string[];
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
    <div className="product_image_wrapper">
      {validImages.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`${title} - ${i + 1}`}
          className={`product_image ${i === currentIndex ? "slide_active" : ""}`}
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
                  className="suggestion_add_btn"
                  onClick={() => { onAddToCart(product); setQueryVal(""); setFocused(false); }}
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
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
          {isArabic ? "ملابس رياضية احترافية" : "PREMIUM COMPRESSION WEAR"}
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
    { icon: "bolt", title: "أداء أقصى", description: "خامة ضاغطة مصممة لدعم العضلات أثناء الحركات المتفجرة." },
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

/* ================= SIDE MENU (fixed: opens below header) ================= */

function SideMenu({ isArabic, isOpen, onClose, onNavigate }: {
  isArabic: boolean; isOpen: boolean; onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const links = isArabic ? [
    { id: "short-sleeves", label: "أكمام قصيرة", icon: "fitness_center" },
    { id: "long-sleeves", label: "أكمام طويلة", icon: "sports_gymnastics" },
    { id: "tank-top", label: "تانك توب", icon: "self_improvement" },
    { id: "target_box", label: "المميزات", icon: "star" },
    { id: "about-us", label: "من نحن", icon: "info" },
  ] : [
    { id: "short-sleeves", label: "Short Sleeves", icon: "fitness_center" },
    { id: "long-sleeves", label: "Long Sleeves", icon: "sports_gymnastics" },
    { id: "tank-top", label: "Tank Tops", icon: "self_improvement" },
    { id: "target_box", label: "Features", icon: "star" },
    { id: "about-us", label: "About Us", icon: "info" },
  ];

  return (
    <nav className={`List ${isOpen ? "open" : ""} ${isArabic ? "rtl" : "ltr"}`}>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a
  href={link.id === "about-us" ? "../AboutUs/" : `#${link.id}`}
  className="object"
  onClick={(e) => {
    if (link.id === "about-us") {
      onClose();
      return;
    }

    e.preventDefault();
    onNavigate(link.id);
    onClose();
  }}
>
              <span className="material-symbols-outlined object_icon">{link.icon}</span>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ================= MARKET LIST / CART (fixed: closes properly) ================= */

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

/* ================= HEADER (with settings/cart ABOVE search bar) ================= */

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
  const isArabic = language === "ar";

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const shortSleevesScrollRef = useRef<HTMLDivElement>(null);
  const longSleevesScrollRef = useRef<HTMLDivElement>(null);
  const tankTopScrollRef = useRef<HTMLDivElement>(null);

  const shortSleevesProducts = allProducts.filter((p) => p.category === "Short Sleeves Compression");
  const longSleevesProducts = allProducts.filter((p) => p.category === "Long Sleeves Compression");
  const tankTopProducts = allProducts.filter((p) => p.category === "Top Tank Compression");

  useEffect(() => {
    if (!sessionStorage.getItem("reloaded")) {
      sessionStorage.setItem("reloaded", "true");
      window.location.reload();
    }
  }, []);

  /* ---- Firebase dynamic fetch ---- */
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
        });
      });
      setAllProducts(allProds);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("UserLanguage");
    if (saved === "Arabic") setLanguage("ar");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("strike_cart");
    if (saved) {
      try { setCartItems(JSON.parse(saved)); } catch { setCartItems([]); }
    }
  }, []);

  useEffect(() => {
    if (isCartOpen || isMenuOpen) document.body.classList.add("no_scroll");
    else document.body.classList.remove("no_scroll");
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
        <div className="slider_controls">
          <button className="slider_arrow" onClick={() => scroll(scrollRef, "left")}>‹</button>
          <button className="slider_arrow" onClick={() => scroll(scrollRef, "right")}>›</button>
        </div>
      </div>
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
                <button className="add_to_cart_btn" onClick={() => addToCart(product)}>
                  <span className="material-symbols-outlined">shopping_bag</span>
                  {isArabic ? "أضف للسلة" : "Add To Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />

      <Toast message={toastMessage} visible={toastVisible} />

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

      <div className={`container ${isArabic ? "rtl" : "ltr"}`}>
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
              title={isArabic ? "تانك توب" : "Tank Top Compression"}
              products={tankTopProducts}
              scrollRef={tankTopScrollRef}
              sectionId="tank-top"
            />
          </div>
        )}

        {/* ===== ABOUT US SECTION (Next.js Dynamic Component Rendered here) ===== */}
        <section className="about_us_section" id="about-us">
          <Suspense fallback={<div className="sliders_loading"><div className="loading_spinner"></div></div>}>
            <AboutUs />
          </Suspense>
        </section>
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

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |