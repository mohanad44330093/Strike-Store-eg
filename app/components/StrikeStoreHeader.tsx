"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const sourceimage = "./images/StrikeWhiteLogo.png";

interface HeaderProps {
  onOpenSettings?: () => void;
  isArabic?: boolean;
  searchSlot?: ReactNode;
}

export default function StrikeStoreHeader({
  onOpenSettings,
  isArabic = false,
  searchSlot,
}: HeaderProps) {

  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ✅ الحالة الأساسية
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cartIconRef = useRef<HTMLDivElement>(null);

  /* ================= CART ================= */
  const updateCartCount = () => {
    const savedCart = localStorage.getItem("strike_cart");

    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        const total = cart.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () =>
      window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  /* ================= MENU ================= */
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleMenuLink = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  /* ================= CART OPEN ================= */
  const openCart = () => {
    const cart = document.querySelector(".market_list") as HTMLElement;
    if (cart) {
      cart.classList.add("open");
      cart.style.right = "0";
    }
  };

  return (
    <>
      <header className="strike_header">

        {/* ================= TOP ================= */}
        <div className={`header_top ${mobileSearchOpen ? "search_mode" : ""}`}>

          {/* LEFT */}
          <div className="header_left">
            {!mobileSearchOpen && (
              <>
                <div
                  className={`List_box ${menuOpen ? "active" : ""}`}
                  onClick={toggleMenu}
                >
                  <div className="top_line"></div>
                  <div className="middle_line"></div>
                  <div className="end_line"></div>
                </div>

                <div
                  className="Logo"
                  onClick={() => router.push("/")}
                >
                  <Image
                    src={sourceimage}
                    alt="logo"
                    width={160}
                    height={60}
                  />
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="header_right">

            {!mobileSearchOpen && (
              <button
                className="mobile_search_toggle"
                onClick={() => setMobileSearchOpen(true)}
              >
                <span className="material-symbols-outlined">
                  search
                </span>
              </button>
            )}

            {!mobileSearchOpen && (
              <div className="market_cart">

                <div
                  className="cart_btn"
                  onClick={openCart}
                  ref={cartIconRef}
                >
                  <span className="material-symbols-outlined">
                    shopping_cart
                  </span>

                  {cartCount > 0 && (
                    <div className="counter">{cartCount}</div>
                  )}
                </div>

                <button
                  className="settings_btn"
                  onClick={onOpenSettings}
                >
                  <span className="material-symbols-outlined">
                    settings
                  </span>
                </button>

              </div>
            )}

          </div>
        </div>

        {/* ✅ MOBILE SEARCH */}
        {mobileSearchOpen && (
          <div className="mobile_search_inline">

            {searchSlot ? (
              searchSlot
            ) : (
              <div className="Search_box">

                <span className="material-symbols-outlined search_icon">
                  search
                </span>

                <input
                  type="text"
                  placeholder={
                    isArabic
                      ? "ابحث عن منتج..."
                      : "Search products..."
                  }
                  autoFocus
                />

                <button
                  className="close_mobile_search"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>

              </div>
            )}

          </div>
        )}

        {/* ✅ DESKTOP SEARCH */}
        <div className="desktop_search_wrapper">
          <div className="Search_box">
            <span className="material-symbols-outlined search_icon">
              search
            </span>

            <input
              type="text"
              placeholder={
                isArabic
                  ? "ابحث عن منتج..."
                  : "Search products..."
              }
            />
          </div>
        </div>

      </header>

      {/* ================= MENU ================= */}
      <div className={`List ${menuOpen ? "open" : ""}`}>
        <ul>

          <li>
            <a
              href="#short-sleeves"
              onClick={(e) => {
                e.preventDefault();
                handleMenuLink("short-sleeves");
              }}
            >
              SHORT SLEEVES
            </a>
          </li>

          <li>
            <Link href="/AboutUs" onClick={() => setMenuOpen(false)}>
              ABOUT US
            </Link>
          </li>

        </ul>
      </div>

      {menuOpen && (
        <div
          className="menu_overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}