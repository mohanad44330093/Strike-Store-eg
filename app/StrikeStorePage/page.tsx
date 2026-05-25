"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
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
    return Number(
      (product.price * (1 - product.discount / 100)).toFixed(2)
    );
  }
  return product.price;
};

/* ================= PRODUCT IMAGE SLIDER ================= */

function ProductImageSlider({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="product_image_wrapper no_image">
        <span className="material-symbols-outlined">
          image_not_supported
        </span>
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
          className={`product_image ${
            i === currentIndex ? "slide_active" : ""
          }`}
        />
      ))}

      {validImages.length > 1 && (
        <>
          <button
            className="slide_arrow slide_arrow_left"
            onClick={(e) => {
              e.stopPropagation();
              goTo(currentIndex - 1);
            }}
          >
            ‹
          </button>

          <button
            className="slide_arrow slide_arrow_right"
            onClick={(e) => {
              e.stopPropagation();
              goTo(currentIndex + 1);
            }}
          >
            ›
          </button>

          <div className="slide_dots">
            {validImages.map((_, i) => (
              <button
                key={i}
                className={`slide_dot ${
                  i === currentIndex ? "slide_dot_active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= TOAST ================= */

function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div
      className={`toast_notification ${
        visible ? "toast_visible" : ""
      }`}
    >
      <span className="material-symbols-outlined">check_circle</span>
      {message}
    </div>
  );
}

/* ================= SEARCH BAR ================= */

function SearchBarWithSuggestions({
  products,
  isArabic,
  onAddToCart,
}: {
  products: Product[];
  isArabic: boolean;
  onAddToCart: (p: Product) => void;
}) {
  const [queryVal, setQueryVal] = useState("");
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    queryVal.trim().length === 0
      ? []
      : products
          .filter(
            (p) =>
              p.title
                .toLowerCase()
                .includes(queryVal.toLowerCase()) ||
              p.description
                .toLowerCase()
                .includes(queryVal.toLowerCase())
          )
          .slice(0, 6);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown =
    focused && queryVal.trim().length > 0;

  return (
    <div className="smart_search_wrapper" ref={containerRef}>
      <div
        className={`smart_search_box ${
          focused ? "focused" : ""
        }`}
      >
        <span className="material-symbols-outlined search_icon_inner">
          search
        </span>

        <input
          type="text"
          placeholder={
            isArabic
              ? "ابحث عن منتج..."
              : "Search products..."
          }
          value={queryVal}
          onChange={(e) => setQueryVal(e.target.value)}
          onFocus={() => setFocused(true)}
          className="smart_search_input"
          autoComplete="off"
        />

        {queryVal && (
          <button
            className="search_clear_btn"
            onClick={() => {
              setQueryVal("");
              setFocused(false);
            }}
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search_dropdown">
          {suggestions.length === 0 ? (
            <div className="search_no_results_inline">
              <span className="material-symbols-outlined">
                search_off
              </span>

              <span>
                {isArabic
                  ? "لا توجد نتائج"
                  : "No results found"}
              </span>
            </div>
          ) : (
            suggestions.map((product) => (
              <div
                key={product.id}
                className="search_suggestion_item"
              >
                <div className="suggestion_image">
                  <img
                    src={product.images?.[0] ?? ""}
                    alt={product.title}
                  />
                </div>

                <div className="suggestion_info">
                  <p className="suggestion_title">
                    {product.title}
                  </p>

                  <div className="suggestion_price">
                    {product.discount &&
                    product.discount > 0 ? (
                      <>
                        <span className="suggestion_original">
                          {product.price} EGP
                        </span>

                        <span className="suggestion_discounted">
                          {getFinalPrice(product).toFixed(2)} EGP
                        </span>
                      </>
                    ) : (
                      <span className="suggestion_final">
                        {product.price} EGP
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="suggestion_add_btn"
                  onClick={() => {
                    onAddToCart(product);
                    setQueryVal("");
                    setFocused(false);
                  }}
                >
                  <span className="material-symbols-outlined">
                    shopping_bag
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

/* ================= MAIN PAGE ================= */

export default function MainPageEN() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [language, setLanguage] =
    useState<"en" | "ar">("en");

  const [isHydrated, setIsHydrated] =
    useState(false);

  const isArabic = language === "ar";

  const [cartItems, setCartItems] = useState<CartProduct[]>(
    []
  );

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastVisible, setToastVisible] =
    useState(false);

  const [firebaseError, setFirebaseError] =
    useState<string | null>(null);

  const shortSleevesScrollRef =
    useRef<HTMLDivElement>(null);

  const longSleevesScrollRef =
    useRef<HTMLDivElement>(null);

  const tankTopScrollRef =
    useRef<HTMLDivElement>(null);

  const shortSleevesProducts = allProducts.filter(
    (p) =>
      p.category === "Short Sleeves Compression"
  );

  const longSleevesProducts = allProducts.filter(
    (p) =>
      p.category === "Long Sleeves Compression"
  );

  const tankTopProducts = allProducts.filter(
    (p) => p.category === "Top Tank Compression"
  );

  /* ================= FIREBASE ================= */

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
              images: Array.isArray(data.images)
                ? data.images
                : [],
            });
          });

          setAllProducts(allProds);
          setLoading(false);
          setFirebaseError(null);
        },

        (error) => {
          console.error(
            "Firebase Snapshot Error:",
            error
          );

          setFirebaseError(
            "Failed to load products."
          );

          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error(
        "Firebase initialization error:",
        error
      );

      setFirebaseError(
        "Failed to initialize Firebase."
      );

      setLoading(false);
    }
  }, []);

  /* ================= HYDRATION ================= */

  useEffect(() => {
    setIsHydrated(true);

    const saved =
      localStorage.getItem("UserLanguage");

    if (saved === "Arabic") {
      setLanguage("ar");
    }
  }, []);

  /* ================= CART ================= */

  useEffect(() => {
    if (isHydrated) {
      const saved =
        localStorage.getItem("strike_cart");

      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch {
          setCartItems([]);
        }
      }
    }
  }, [isHydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  const addToCart = useCallback(
    (product: Product) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.id === product.id
        );

        const finalPrice =
          getFinalPrice(product);

        const updated = existing
          ? prev.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    price: finalPrice,
                  }
                : item
            )
          : [
              ...prev,
              {
                id: product.id,
                title: product.title,
                image:
                  product.images?.[0] ?? "",
                price: finalPrice,
                quantity: 1,
              },
            ];

        localStorage.setItem(
          "strike_cart",
          JSON.stringify(updated)
        );

        return updated;
      });

      showToast(
        `${product.title} ${
          isArabic
            ? "تمت الإضافة للسلة"
            : "added to cart!"
        }`
      );
    },
    [isArabic]
  );

  if (!isHydrated) {
    return (
      <div className="sliders_loading">
        <div className="loading_spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toastMessage}
        visible={toastVisible}
      />

      <div
        className={`strike_page_root container ${
          isArabic ? "rtl" : "ltr"
        }`}
      >
        <div className="header_bottom_row">
          <SearchBarWithSuggestions
            products={allProducts}
            isArabic={isArabic}
            onAddToCart={addToCart}
          />
        </div>

        {firebaseError && (
          <div className="error_banner">
            <p>{firebaseError}</p>
          </div>
        )}

        {loading ? (
          <div className="sliders_loading">
            <div className="loading_spinner"></div>

            <p>
              {isArabic
                ? "جاري تحميل المنتجات..."
                : "Loading Products..."}
            </p>
          </div>
        ) : (
          <div className="sliders_wrapper">
            <section
              className="slider_section"
              id="short-sleeves"
            >
              <h2 className="slider_title">
                Short Sleeves Compression
              </h2>

              <div
                className="slider_container"
                ref={shortSleevesScrollRef}
              >
                {shortSleevesProducts.map(
                  (product) => (
                    <div
                      className="product_card"
                      key={product.id}
                    >
                      <ProductImageSlider
                        images={
                          product.images ?? []
                        }
                        title={product.title}
                      />

                      <div className="product_info">
                        <h3 className="product_title">
                          {product.title}
                        </h3>

                        <p className="product_description">
                          {product.description}
                        </p>

                        <div className="product_price_section">
                          {product.discount &&
                          product.discount > 0 ? (
                            <>
                              <span className="original_price">
                                {product.price} EGP
                              </span>

                              <span className="discounted_price">
                                {getFinalPrice(
                                  product
                                ).toFixed(2)}{" "}
                                EGP
                              </span>
                            </>
                          ) : (
                            <span className="product_price">
                              {product.price} EGP
                            </span>
                          )}
                        </div>

                        <button
                          className="add_to_cart_btn"
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          <span className="material-symbols-outlined">
                            shopping_bag
                          </span>

                          {isArabic
                            ? "أضف للسلة"
                            : "Add To Cart"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}