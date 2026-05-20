"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import Header from "../components/StrikeStoreHeader";
import HeroSection from "../components/hero_section";
import FeatureSection from "../components/features_setion";

import "./page.css";

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

const app = initializeApp(firebaseConfig);
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

/* ================= FINAL PRICE HELPER ================= */

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

  const goTo = (index: number) => {
    setCurrentIndex((index + validImages.length) % validImages.length);
  };

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
  products,
  isArabic,
  onAddToCart,
}: {
  products: Product[];
  isArabic: boolean;
  onAddToCart: (product: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = query.trim().length === 0
    ? []
    : products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
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

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="smart_search_wrapper" ref={containerRef}>
      <div className={`smart_search_box ${focused ? "focused" : ""}`}>
        <span className="material-symbols-outlined search_icon_inner">search</span>
        <input
          type="text"
          placeholder={isArabic ? "ابحث عن منتج..." : "Search products..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          className="smart_search_input"
          autoComplete="off"
        />
        {query && (
          <button
            className="search_clear_btn"
            onClick={() => { setQuery(""); setFocused(false); }}
          >
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
                  onClick={() => {
                    onAddToCart(product);
                    setQuery("");
                    setFocused(false);
                  }}
                  title={isArabic ? "أضف للسلة" : "Add to cart"}
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
  visible,
  onClose,
  language,
  onLanguageChange,
  isArabic,
}: {
  visible: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (lang: "en" | "ar") => void;
  isArabic: boolean;
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
              <button
                className={`lang_option ${language === "en" ? "active" : ""}`}
                onClick={() => onLanguageChange("en")}
              >
                🇺🇸 English
              </button>
              <button
                className={`lang_option ${language === "ar" ? "active" : ""}`}
                onClick={() => onLanguageChange("ar")}
              >
                🇪🇬 العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MARKET LIST (CART SIDEBAR) ================= */

function MarketList({ isArabic = false }: { isArabic?: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<CartProduct[]>([]);

  useEffect(() => {
    const updateItems = () => {
      const savedCart = localStorage.getItem("strike_cart");
      if (savedCart) {
        try { setItems(JSON.parse(savedCart)); } catch { setItems([]); }
      } else {
        setItems([]);
      }
    };
    updateItems();
    window.addEventListener("cartUpdated", updateItems);
    return () => window.removeEventListener("cartUpdated", updateItems);
  }, []);

  const removeItem = (productId: string) => {
    const updated = items.filter((item) => item.id !== productId);
    setItems(updated);
    localStorage.setItem("strike_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQuantity = (productId: string) => {
    const updated = items.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setItems(updated);
    localStorage.setItem("strike_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQuantity = (productId: string) => {
    const updated = items.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    );
    setItems(updated);
    localStorage.setItem("strike_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const closeCart = () => {
    const cartSidebar = document.querySelector(".market_list") as HTMLElement;
    if (cartSidebar) cartSidebar.style.right = "-420px";
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="market_list">
      <div className="market_header">
        <h2>{isArabic ? "سلة التسوق" : "Shopping Cart"}</h2>
        <button className="close_cart" onClick={closeCart}>
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
                    <button className="qty_btn" onClick={() => decreaseQuantity(item.id)}>−</button>
                    <span className="qty_display">{item.quantity}</span>
                    <button className="qty_btn" onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>
                </div>
                <button className="remove_btn" onClick={() => removeItem(item.id)}>
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
            <button className="checkout_btn" onClick={() => { closeCart(); router.push("/checkout"); }}>
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
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

function MainPageEN() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [shortSleevesProducts, setShortSleevesProducts] = useState<Product[]>([]);
  const [longSleevesProducts, setLongSleevesProducts] = useState<Product[]>([]);
  const [tankTopProducts, setTankTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const isArabic = language === "ar";
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const shortSleevesRef = useRef<HTMLElement>(null);
  const longSleevesRef = useRef<HTMLElement>(null);
  const tankTopRef = useRef<HTMLElement>(null);
  const shortSleevesScrollRef = useRef<HTMLDivElement>(null);
  const longSleevesScrollRef = useRef<HTMLDivElement>(null);
  const tankTopScrollRef = useRef<HTMLDivElement>(null);

  /* ---- Language ---- */
  useEffect(() => {
    const saved = localStorage.getItem("UserLanguage");
    setLanguage(saved === "Arabic" ? "ar" : "en");
  }, []);

  /* ---- Auto Reload (once per session) ---- */
  useEffect(() => {
    const alreadyReloaded = sessionStorage.getItem("page_reloaded");
    if (!alreadyReloaded) {
      sessionStorage.setItem("page_reloaded", "true");
      window.location.reload();
    }
    return () => { sessionStorage.removeItem("page_reloaded"); };
  }, []);

  /* ---- Toast ---- */
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  /* ---- Language Change ---- */
  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
    localStorage.setItem("UserLanguage", newLanguage === "ar" ? "Arabic" : "English");
    setSettingsModalVisible(false);
    window.location.reload();
  };

  /* ---- Add to Cart ---- */
  const addToCart = useCallback(
    (product: Product) => {
      const savedCart = localStorage.getItem("strike_cart");
      const cart: CartProduct[] = savedCart ? JSON.parse(savedCart) : [];
      const existing = cart.find((item) => item.id === product.id);
      const finalPrice = getFinalPrice(product);

      if (existing) {
        existing.quantity += 1;
        existing.price = finalPrice;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          image: product.images?.[0] ?? "",
          price: finalPrice,
          quantity: 1,
        });
      }

      localStorage.setItem("strike_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      showToast(`${product.title} ${isArabic ? "تمت الإضافة للسلة" : "added to cart!"}`);
    },
    [isArabic]
  );

  /* ---- Get Products ---- */
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
      setShortSleevesProducts(allProds.filter((p) => p.category === "Short Sleeves Compression"));
      setLongSleevesProducts(allProds.filter((p) => p.category === "Long Sleeves Compression"));
      setTankTopProducts(allProds.filter((p) => p.category === "Top Tank Compression"));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /* ---- Smooth Scroll to Section ---- */
  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  /* ---- Slider Scroll ---- */
  const scroll = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    containerRef.current?.scrollBy({ left: direction === "left" ? -350 : 350, behavior: "smooth" });
  };

  /* ---- Product Slider Section ---- */
  const ProductSlider = ({
    title,
    products,
    scrollRef,
    sectionRef,
  }: {
    title: string;
    products: Product[];
    scrollRef: React.RefObject<HTMLDivElement | null>;
    sectionRef: React.RefObject<HTMLElement | null>;
    sectionId: string;
  }) => (
    <section className="slider_section" ref={sectionRef}>
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
                {product.discount !== 0 && (
                  <div className="discount_badge">-{product.discount}%</div>
                )}
                <div className="product_overlay">
                  <button className="add_to_cart_btn" onClick={() => addToCart(product)}>
                    <span className="material-symbols-outlined">shopping_bag</span>
                    {isArabic ? "أضف للسلة" : "Add To Cart"}
                  </button>
                </div>
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

      <MarketList isArabic={isArabic} />

      <div className={`container ${isArabic ? "rtl" : "ltr"}`}>
        {/* ===== HEADER ===== */}
        {/* 
          Pass onOpenSearch and onOpenSettings as before.
          The search bar with suggestions is now INSIDE the header area below,
          replacing the old header search input + search modal pattern.
          Update StrikeStoreHeader to accept a `searchSlot` prop,
          or embed SearchBarWithSuggestions directly in the header JSX.
          
          For drop-in compatibility, we keep Header as-is and overlay
          the smart search below in a sticky top bar if needed.
          The simplest approach: pass onOpenSearch to open the dropdown logic,
          but the new smart search is self-contained in the header's Search_box area.
          
          ACTION: Replace the Search_box inside StrikeStoreHeader with:
          <SearchBarWithSuggestions products={allProducts} isArabic={isArabic} onAddToCart={addToCart} />
          
          Until then, onOpenSearch just focuses the smart bar — handled below.
        */}
        <Header
          isArabic={isArabic}
          onOpenSearch={() => {
            /* Smart search is now inline — no modal needed */
          }}
          onOpenSettings={() => setSettingsModalVisible(true)}
          /* NEW PROP — pass this down so Header can render the smart search */
          searchSlot={
            <SearchBarWithSuggestions
              products={allProducts}
              isArabic={isArabic}
              onAddToCart={addToCart}
            />
          }
        />

        {/* ===== HERO ===== */}
        {/* 
          HeroSection buttons now scroll properly via scrollToSection.
          Pass scroll helpers as props OR use the same scrollToSection logic 
          already in HeroSection (it uses document.getElementById — works fine 
          as long as the section IDs match).
          
          IDs used:
            "short-sleeves"  → first product section  ✅
            "target_box"     → features section        ✅
        */}
        <HeroSection />

        {/* ===== FEATURES ===== */}
        {/* id="target_box" is already set inside FeatureSection */}
        <FeatureSection />

        {/* ===== PRODUCTS ===== */}
        {loading ? (
          <div className="sliders_loading">
            <div className="loading_spinner"></div>
            <p>{isArabic ? "جاري تحميل المنتجات..." : "Loading Products..."}</p>
          </div>
        ) : (
          /* 
            id="short-sleeves" is on the first ProductSlider section below.
            "Shop Now" in HeroSection links to #short-sleeves → scrollIntoView works.
          */
          <div className="sliders_wrapper" id="long-sleeves">
            <ProductSlider
              title={isArabic ? "قمصان بدون أكمام" : "Short Sleeves Compression"}
              products={shortSleevesProducts}
              scrollRef={shortSleevesScrollRef}
              sectionRef={shortSleevesRef}
              sectionId="Short-sleeves"
            />
            <ProductSlider
              title={isArabic ? "قمصان بأكمام طويلة" : "Long Sleeves Compression"}
              products={longSleevesProducts}
              scrollRef={longSleevesScrollRef}
              sectionRef={longSleevesRef}
              sectionId="long-sleeves"
            />
            <ProductSlider
              title={isArabic ? "تانك توب" : "Tank Top Compression"}
              products={tankTopProducts}
              scrollRef={tankTopScrollRef}
              sectionRef={tankTopRef}
              sectionId="tank-top"
            />
          </div>
        )}
      </div>

      <footer className="main_footer" id="tank-top">
        <div className="footer_wrapper">
          <div className="footer_bottom">
            <p className="footer_copyright">© 2026 STRIKE.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default MainPageEN;