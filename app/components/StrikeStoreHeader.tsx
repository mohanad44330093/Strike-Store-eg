"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const sourceimage = "./images/StrikeWhiteLogo.png";

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  isArabic?: boolean;
  searchSlot?: ReactNode;
}

export default function StrikeStoreHeader({
  onOpenSearch,
  onOpenSettings,
  isArabic = false,
  searchSlot,
}: HeaderProps) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const cartIconRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     UPDATE CART COUNT
  ========================================================= */

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

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  /* =========================================================
     MENU
  ========================================================= */

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuLink = (sectionId: string) => {
    setMenuOpen(false);

    setTimeout(() => {
      const el = document.getElementById(sectionId);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  /* =========================================================
     OPEN CART
  ========================================================= */

  const openCart = () => {
    const cartSidebar = document.querySelector(
      ".market_list"
    ) as HTMLElement;

    if (cartSidebar) {
      cartSidebar.classList.add("open");
      cartSidebar.style.right = "0";
    }
  };

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className={`strike_header ${isArabic ? "rtl" : "ltr"}`}>
        {/* ================= TOP ================= */}

        <div className="header_top">
          {/* LEFT */}
          <div className="header_left">
            {/* MENU BUTTON */}
            <div
              className={`List_box ${menuOpen ? "active" : ""}`}
              onClick={toggleMenu}
            >
              <div className="top_line"></div>
              <div className="middle_line"></div>
              <div className="end_line"></div>
            </div>

            {/* LOGO */}
            <div
              className="Logo"
              onClick={() => router.push("/StrikeStorePage")}
            >
              <Image
                className="Strike_Logo_For_Header"
                src={sourceimage}
                alt="Strike Logo"
                width={220}
                height={100}
                priority
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="header_right">
            <div className="market_cart">
              {/* CART */}
              <div
                ref={cartIconRef}
                className="cart_btn"
                onClick={openCart}
              >
                <span className="material-symbols-outlined">
                  shopping_cart
                </span>

                {cartCount > 0 && (
                  <div className="counter">{cartCount}</div>
                )}
              </div>

              {/* SETTINGS */}
              <button
                className="settings_btn"
                onClick={onOpenSettings}
                title={isArabic ? "الإعدادات" : "Settings"}
              >
                <span className="material-symbols-outlined">
                  settings
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        <div className="header_search">
          {searchSlot ? (
            searchSlot
          ) : (
            <div className="Search_box">
              <span
                className="material-symbols-outlined search_icon"
                onClick={onOpenSearch}
              >
                search
              </span>

              <input
                type="text"
                placeholder={
                  isArabic
                    ? "ابحث عن منتج..."
                    : "Search products..."
                }
                readOnly
                onClick={onOpenSearch}
              />
            </div>
          )}
        </div>
      </header>

      {/* =========================================================
          SIDE MENU
      ========================================================= */}

      <div className={`List ${menuOpen ? "open" : ""}`}>
        {/* MENU LINKS */}
        <ul>
          <li>
            <a
              href="#short-sleeves"
              className="object"
              onClick={(e) => {
                e.preventDefault();
                handleMenuLink("short-sleeves");
              }}
            >
              {isArabic ? "أكمام قصيرة" : "SHORT SLEEVES"}
            </a>
          </li>

          <li>
            <a
              href="#long-sleeves"
              className="object"
              onClick={(e) => {
                e.preventDefault();
                handleMenuLink("long-sleeves");
              }}
            >
              {isArabic ? "أكمام طويلة" : "LONG SLEEVES"}
            </a>
          </li>

          <li>
            <a
              href="#tank-top"
              className="object"
              onClick={(e) => {
                e.preventDefault();
                handleMenuLink("tank-top");
              }}
            >
              {isArabic ? "توبات" : "TANK TOPS"}
            </a>
          </li>

          <li>
            <Link
              href="/AboutUs"
              className="object"
              onClick={() => setMenuOpen(false)}
            >
              {isArabic ? "من نحن" : "ABOUT US"}
            </Link>
          </li>
        </ul>
        <div className="menu_bottom_logo">N</div>
      </div>

      {/* =========================================================
          OVERLAY
      ========================================================= */}

      {menuOpen && (
        <div
          className="menu_overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |