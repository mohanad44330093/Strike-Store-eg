// StrikeStoreHeader.jsx - Updated Version (accepts searchSlot prop)

"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const sourceimage = './images/StrikeWhiteLogo.png';

interface HeaderProps {
  onOpenSearch?: () => void;    // kept for backward compat, no longer used for modal
  onOpenSettings?: () => void;
  isArabic?: boolean;
  searchSlot?: ReactNode;       // NEW: renders SearchBarWithSuggestions inline
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

  /* ---- Update Cart Count ---- */
  const updateCartCount = () => {
    const savedCart = localStorage.getItem("strike_cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
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
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  /* ---- Toggle Menu ---- */
  const toggleMenu = () => setMenuOpen(!menuOpen);

  /* ---- Smooth Scroll to Section ---- */
  const handleMenuLink = (sectionId: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  return (
    <>
      <header className={isArabic ? "rtl" : "ltr"}>
        {/* LEFT: Hamburger + Logo */}
        <div className="Logo_box">
          <div
            className={`List_box ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <div className="top_line"></div>
            <div className="middle_line"></div>
            <div className="end_line"></div>
          </div>

          <div className="Logo" onClick={() => router.push("/StrikeStorePage")}>
            <h2 className="logo" style={{ cursor: "pointer", margin: 0 }}>
              <Image
                className="Strike_Logo_For_Header"
                src={sourceimage}
                alt="Strike Logo"
                width={205}
                height={105}
              />
            </h2>
          </div>
        </div>

        {/* CENTER: Smart Search (passed as slot from parent) */}
        {searchSlot ? (
          searchSlot
        ) : (
          /* Fallback: old plain search box if no slot passed */
          <div className="Search_box">
            <input
              type="text"
              placeholder={isArabic ? "ابحث عن منتج..." : "Search products..."}
              readOnly
              onClick={onOpenSearch}
            />
            <span
              className="material-symbols-outlined"
              onClick={onOpenSearch}
              style={{ cursor: "pointer" }}
            >
              search
            </span>
          </div>
        )}

        {/* RIGHT: Cart + Settings */}
        <div className="market_cart">
          <div
            ref={cartIconRef}
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => {
              const cartSidebar = document.querySelector(".market_list") as HTMLElement;
              if (cartSidebar) cartSidebar.style.right = "0";
            }}
          >
            <span className="material-symbols-outlined icon-2">shopping_cart</span>
            {cartCount > 0 && <div className="counter">{cartCount}</div>}
          </div>

          <button
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "50%",
              transition: "0.35s",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
            onClick={onOpenSettings}
            title={isArabic ? "الإعدادات" : "Settings"}
          >
            <span className="material-symbols-outlined icon">settings</span>
          </button>
        </div>
      </header>

      {/* Side Menu */}
      <div className={`List ${menuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <a
              href="#short-sleeves"
              className="object"
              onClick={(e) => { e.preventDefault(); handleMenuLink("short-sleeves"); }}
            >
              {isArabic ? "أكمام قصيرة" : "Short Sleeves"}
            </a>
          </li>
          <li>
            <a
              href="#long-sleeves"
              className="object"
              onClick={(e) => { e.preventDefault(); handleMenuLink("long-sleeves"); }}
            >
              {isArabic ? "أكمام طويلة" : "Long Sleeves"}
            </a>
          </li>
          <li>
            <a
              href="#tank-top"
              className="object"
              onClick={(e) => { e.preventDefault(); handleMenuLink("tank-top"); }}
            >
              {isArabic ? "توبات" : "Tank Tops"}
            </a>
          </li>
          <li>
            <Link href="/AboutUs" className="object">
              {isArabic ? "من نحن" : "About Us"}
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay to close menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 998,
            background: "rgba(0,0,0,0.3)",
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        header.rtl { direction: rtl; }
        header.ltr { direction: ltr; }

        .List {
          position: fixed;
          top: 85px;
          left: -100%;
          width: 300px;
          height: calc(100vh - 85px);
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(15px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          transition: 0.5s;
          z-index: 999;
        }
        .List.open { left: 0; }
        .List ul { list-style: none; margin: 0; padding: 10px 0; }
        .List li { width: 100%; }
        .List .object {
          display: flex;
          width: 100%;
          height: 70px;
          padding: 0 25px;
          color: #fff;
          text-decoration: none;
          align-items: center;
          transition: 0.3s;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 15px;
          letter-spacing: 0.5px;
        }
        .List .object:hover {
          background-color: rgba(255, 255, 255, 0.08);
          padding-left: 35px;
        }

      `}</style>
    </>
  );
}