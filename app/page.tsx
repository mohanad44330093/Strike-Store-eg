"use client";

import { useEffect, useState } from "react";
import "./page.css";
import "./globals.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [savedLanguage, setSavedLanguage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const router = useRouter();

  useEffect(() => {
    const lang = localStorage.getItem("UserLanguage");

    setTimeout(() => {
      if (lang) {
        setSavedLanguage(lang);
      }

      setLoading(false);
    }, 1800);
  }, []);

  useEffect(() => {

    if (savedLanguage === "English") {
      router.replace("/StrikeStorePage");
    }

    if (savedLanguage === "Arabic") {
      router.replace("/StrikeStorePage");
    }

  }, [savedLanguage, router]);

  const handleStart = () => {
    localStorage.setItem("UserLanguage", selectedLanguage);
    setSavedLanguage(selectedLanguage);
  };

  /* ================= LOADING SCREEN ================= */

  if (loading) {
    return (
      <div className="loading_container">
        <div className="loading_content">
          <Image
            src="/images/StrikeWhiteLogo.png"
            alt="Strike Logo"
            width={180}
            height={180}
            className="loading_logo"
          />

          <div className="loading_spinner"></div>

          <h2 className="loading_text">
            Loading Experience...
          </h2>
        </div>
      </div>
    );
  }

  /* ================= SETTINGS PAGE ================= */

  const isArabic = selectedLanguage === "Arabic";

  return (
    <div className="container">
      <div className="content">
        <div className="contnt_image">
          <Image
            src="/images/StrikeWhiteLogo.png"
            alt="Strike Logo"
            width={800}
            height={1000}
            className="SLogo"
          />
        </div>

        <div className="content_details">
          <h1>{isArabic ? "اضف الاعدادات الخاصه بك" : "Set Your Settings"}</h1>

          <div className="options">
            <div className="option">
              <h2>
                {isArabic
                  ? "اختر لغتك ثم اضغط ابدأ"
                  : "Choose Your Language Then Click Start"}
              </h2>

              <div className="btns">
                <button
                  className={selectedLanguage === "English" ? "active" : ""}
                  onClick={() => setSelectedLanguage("English")}
                >
                  English
                </button>

                <button
                  className={selectedLanguage === "Arabic" ? "active" : ""}
                  onClick={() => setSelectedLanguage("Arabic")}
                >
                  العربيه
                </button>
              </div>

              <button className="startbtn" onClick={handleStart}>
                {isArabic ? <Link href={"./StrikeStorePage"} className="link">ابدأ</Link> : <Link href={"./StrikeStorePage"} className="link">Start</Link>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |