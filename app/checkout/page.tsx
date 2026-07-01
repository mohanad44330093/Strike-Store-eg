"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

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

interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  sizes?: Record<string, boolean>;
}

interface ExpandedCartItem extends CartItem {
  uniqueKey: string;
}

/* ================= SIZES ================= */

const SIZES = [
  {
    value: "S",
    label: "S",
    weight: "50KG - 65KG",
    height: "45CM - 60CM",
    width: "30CM - 40CM",
  },
  {
    value: "M",
    label: "M",
    weight: "65KG - 75KG",
    height: "45CM - 60CM",
    width: "30CM - 40CM",
  },
  {
    value: "L",
    label: "L",
    weight: "75KG - 85KG",
    height: "45CM - 60CM",
    width: "30CM - 40CM",
  },
  {
    value: "XL",
    label: "XL",
    weight: "85 - 100",
    height: "45cm - 60cm",
    width: "30cm - 40cm",
  },
  {
    value: "2XL",
    label: "2XL",
    weight: "100 - 115",
    height: "45cm - 60cm",
    width: "30cm - 40cm",
  },
];

/* ================= TRANSLATIONS ================= */

const translations = {
  en: {
    pageTitle: "Checkout",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shippingFee: "Shipping Fee",
    total: "Total",
    customerInfo: "Customer Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Delivery Address",
    confirmOrder: "Confirm Order",
    processing: "Processing...",
    size: "Size",
    productOptions: "Product Options",
    toastMessage: "Order placed successfully. Please Confirm Your Order On Your Email Before 15 Minutes",
    piece: "Piece",
  },
  ar: {
    pageTitle: "الدفع",
    orderSummary: "ملخص الطلب",
    subtotal: "الإجمالي",
    shippingFee: "الشحن",
    total: "المجموع",
    customerInfo: "بيانات العميل",
    fullName: "الاسم بالكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "العنوان",
    confirmOrder: "تأكيد الطلب",
    processing: "جاري المعالجة...",
    size: "المقاس",
    productOptions: "خيارات المنتجات",
    toastMessage: "تم ارسال الطلب بنجاح، يرجي تأكيد الطلب عن طريق البريد الإلكتروني الخاص بك خلال 15 دقيقة",
    piece: "قطعة",
  },
};

/* ================= MAIN ================= */

export default function CheckoutPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [cartItems, setCartItems] = useState<ExpandedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const [itemOptions, setItemOptions] = useState<
    Record<string, { size: string }>
  >({});

  // sizes per product id: { [productId]: { S: true, M: false, ... } }
  const [productSizes, setProductSizes] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    governorate: "",
    address: "",
  });

  const t = translations[language];
  const isArabic = language === "ar";

  /* ================= TOAST ================= */

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    const init = async () => {
      const savedLang = localStorage.getItem("UserLanguage");
      setLanguage(savedLang === "Arabic" ? "ar" : "en");

      const savedCart = localStorage.getItem("strike_cart");
      if (savedCart) {
        const parsed: CartItem[] = JSON.parse(savedCart);

        const expanded: ExpandedCartItem[] = [];
        parsed.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            expanded.push({ ...item, quantity: 1, uniqueKey: `${item.id}_${i}` });
          }
        });

        setCartItems(expanded);

        const initOptions: Record<string, { size: string }> = {};
        expanded.forEach((item) => {
          initOptions[item.uniqueKey] = { size: "" };
        });
        setItemOptions(initOptions);

        // Fetch sizes for each unique product
        const uniqueIds = [...new Set(parsed.map((i: CartItem) => i.id))];
        const sizesMap: Record<string, Record<string, boolean>> = {};
        await Promise.all(
          uniqueIds.map(async (pid: string) => {
            try {
              const snap = await getDoc(doc(db, "products", pid));
              if (snap.exists()) {
                sizesMap[pid] = (snap.data().sizes as Record<string, boolean>) || {};
              }
            } catch {}
          })
        );
        setProductSizes(sizesMap);
      }

      setLoading(false);
    };

    init();
  }, []);

  /* ================= HANDLERS ================= */

  const handleInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= PHONE VALIDATION ================= */

  const isValidEgyptianPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const validPrefixes = ["010", "011", "012", "015"];
    const hasValidPrefix = validPrefixes.some((prefix) =>
      cleaned.startsWith(prefix)
    );
    return cleaned.length === 11 && hasValidPrefix;
  };

  const setSize = (uniqueKey: string, size: string) => {
    setItemOptions((prev) => ({
      ...prev,
      [uniqueKey]: { ...prev[uniqueKey], size },
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    /* ================= VALIDATION ================= */

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.governorate ||
      !formData.address
    ) {
      alert(isArabic ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    if (!isValidEgyptianPhone(formData.phone)) {
      alert(isArabic ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      return;
    }

    /* ================= VALIDATE SIZE لكل قطعة ================= */

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const options = itemOptions[item.uniqueKey];
      const pieceLabel = `${t.piece} ${i + 1} — ${item.title}`;

      if (!options?.size) {
        alert(
          isArabic
            ? `يرجى اختيار مقاس لـ: ${pieceLabel}`
            : `Please select a size for: ${pieceLabel}`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
      const total = subtotal + 50;

      const itemsWithOptions = cartItems.map((item) => ({
        ...item,
        selectedSize: itemOptions[item.uniqueKey]?.size,
      }));

      /* ================= SAVE ORDER TO FIRESTORE ================= */

      const orderRef = await addDoc(collection(db, "orders"), {
        customerName:        formData.fullName,
        customerPhone:       formData.phone,
        customerEmail:       formData.email,
        customerGovernorate: formData.governorate,
        customerAddress:     formData.address,
        items:               itemsWithOptions,
        subtotal,
        shippingFee:         50,
        total,
        status:              "pending",
        paymentMethod:       "Cash On Delivery",
        createdAt:           serverTimestamp(),
        expiresAt:           new Date(Date.now() + 15 * 60 * 1000),
      });

      const orderId = orderRef.id;

      const confirmLink = `https://strike-store-eg-ss55.vercel.app/confirm-order?id=${orderId}`;
      const cancelLink  = `https://strike-store-eg-ss55.vercel.app/cancel-order?id=${orderId}`;

      const itemsSummary = itemsWithOptions
        .map((item) =>
          `• ${item.title} — ${item.price.toFixed(0)} EGP` +
          (item.selectedSize ? ` | Size: ${item.selectedSize}` : "")
        )
        .join("\n");

      await emailjs.send(
        "service_bxrt7vl",
        "template_8eqr6gq",
        {
          customer_name:        formData.fullName,
          customer_email:       formData.email,
          customer_phone:       formData.phone,
          customer_governorate: formData.governorate,
          customer_address:     formData.address,
          items_summary:        itemsSummary,
          subtotal:             `${subtotal.toFixed(0)} EGP`,
          shipping:             "50 EGP",
          total:                `${total.toFixed(0)} EGP`,
          confirm_link:         confirmLink,
          cancel_link:          cancelLink,
        },
        "MPJAksf58hU6Lodho"
      );

      await emailjs.send(
        "service_bxrt7vl",
        "template_68aq71f",
        {
          customer_name:        formData.fullName,
          customer_email:       formData.email,
          customer_phone:       formData.phone,
          customer_governorate: formData.governorate,
          customer_address:     formData.address,
          items_summary:        itemsSummary,
          subtotal:             `${subtotal.toFixed(0)} EGP`,
          shipping:             "50 EGP",
          total:                `${total.toFixed(0)} EGP`,
          confirm_link:         confirmLink,
          cancel_link:          cancelLink,
        },
        "MPJAksf58hU6Lodho"
      );

      /* ================= DONE ================= */

      localStorage.removeItem("strike_cart");
      showToast();
      setTimeout(() => router.push("/"), 4000);

    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= TOTALS ================= */

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  /* ================= RENDER ================= */

  return (
    <>
      <div className={`checkout_page ${isArabic ? "rtl" : "ltr"}`}>

        {/* TOAST */}
        <div className={`custom_toast ${toastVisible ? "custom_toast_show" : ""}`}>
          {t.toastMessage}
        </div>

        <header className="checkout_header">
          <h1>{t.pageTitle}</h1>
        </header>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="checkout_layout">

            {/* PRODUCT OPTIONS */}
            <div className="checkout_section">
              <div className="options_header">
                <h2>{t.productOptions}</h2>
              </div>

              {cartItems.map((item, index) => {
                const options = itemOptions[item.uniqueKey];

                const sameProductCount = cartItems.filter(
                  (c) => c.id === item.id
                ).length;
                const pieceIndex =
                  cartItems
                    .filter((c) => c.id === item.id)
                    .findIndex((c) => c.uniqueKey === item.uniqueKey) + 1;

                const pieceLabel =
                  sameProductCount > 1
                    ? isArabic
                      ? `${item.title} — قطعة ${pieceIndex}`
                      : `${item.title} — ${t.piece} ${pieceIndex}`
                    : item.title;

                return (
                  <div key={item.uniqueKey} className="product_options">
                    <div className="product_header">
                      <img src={item.image} alt={item.title} />
                      <div>
                        <h3>{pieceLabel}</h3>
                        <p>{item.price.toFixed(0)} EGP</p>
                      </div>
                    </div>

                    {/* SIZE */}
                    <div className="co_field">
                      <label>{t.size}</label>
                      <div className="co_size_grid">
                        {SIZES.map((sz) => {
                          const sizesForProduct = productSizes[item.id] ?? {};
                          // If sizes object is empty (old product), all are enabled
                          const hasAnyConfig = Object.keys(sizesForProduct).length > 0;
                          const isAvailable = !hasAnyConfig || sizesForProduct[sz.value] === true;
                          return (
                            <button
                              key={sz.value}
                              type="button"
                              disabled={!isAvailable}
                              className={`co_size_btn ${options?.size === sz.value ? "co_size_active" : ""} ${!isAvailable ? "co_size_disabled" : ""}`}
                              onClick={() => isAvailable && setSize(item.uniqueKey, sz.value)}
                            >
                              {sz.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LEFT */}
            <div className="checkout_form">
              <div className="checkout_section">
                <h2>{t.customerInfo}</h2>

                <input
                  type="text"
                  name="fullName"
                  placeholder={t.fullName}
                  value={formData.fullName}
                  onChange={handleInput}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder={t.phone}
                  value={formData.phone}
                  onChange={handleInput}
                />

                <input
                  type="email"
                  name="email"
                  placeholder={t.email}
                  value={formData.email}
                  onChange={handleInput}
                />

                <select
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleInput}
                  className="governorate_select"
                >
                  <option value="">
                    {isArabic ? "اختر المحافظة" : "Select Governorate"}
                  </option>
                  <option value="Cairo">{isArabic ? "القاهرة" : "Cairo"}</option>
                  <option value="Giza">{isArabic ? "الجيزة" : "Giza"}</option>
                </select>

                <br /><br />

                <textarea
                  name="address"
                  placeholder={t.address}
                  value={formData.address}
                  onChange={handleInput}
                />
              </div>
            </div>

            {/* RIGHT — SUMMARY */}
            <div className="summary_card">
              <h2>{t.orderSummary}</h2>

              {cartItems.map((item) => {
                const sameProductCount = cartItems.filter(
                  (c) => c.id === item.id
                ).length;
                const pieceIndex =
                  cartItems
                    .filter((c) => c.id === item.id)
                    .findIndex((c) => c.uniqueKey === item.uniqueKey) + 1;

                const label =
                  sameProductCount > 1
                    ? isArabic
                      ? `${item.title} — قطعة ${pieceIndex}`
                      : `${item.title} — ${t.piece} ${pieceIndex}`
                    : item.title;

                return (
                  <div key={item.uniqueKey} className="summary_item">
                    <span>{label}</span>
                    <span>{item.price.toFixed(0)} EGP</span>
                  </div>
                );
              })}

              <div className="summary_total">
                <span>{t.subtotal}</span>
                <span>{subtotal.toFixed(0)} EGP</span>
              </div>

              <div className="summary_total">
                <span>{t.shippingFee}</span>
                <span>{shipping} EGP</span>
              </div>

              <div className="summary_total final_total">
                <span>{t.total}</span>
                <span>{total.toFixed(0)} EGP</span>
              </div>
            </div>

            {/* BUTTON */}
            <button
              className="confirm_btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t.processing : t.confirmOrder}
            </button>

          </div>
        )}
      </div>
    </>
  );
}

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |
