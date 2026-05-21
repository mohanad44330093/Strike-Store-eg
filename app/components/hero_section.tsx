"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
const sourceimage = './images/StrikeWhiteLogo.png';

function HeroSection() {
    const [isArabic, setIsArabic] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("UserLanguage");

        if (savedLanguage === "Arabic") {
            setIsArabic(true);
        } else {
            setIsArabic(false);
        }
    }, []);

    function scrollToSection(sectionId: string) {
        const el = document.getElementById(sectionId);

        if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } else {
            const helper = (window as any).__strikeScrollTo;

            if (!helper) return;

            if (sectionId === "short-sleeves") helper.short();
            if (sectionId === "long-sleeves") helper.long();
            if (sectionId === "tank-top") helper.tank();
        }
    }

    return (
        <>
            <section
                className={`hero_section ${isArabic ? "rtl" : "ltr"}`}
            >
                <div className="hero_content">

                    <span className="hero_badge">
                        {isArabic
                            ? "ملابس كومبريشن فاخرة"
                            : "PREMIUM COMPRESSION WEAR"}
                    </span>

                    <Image className="Strike_Logo_for_hero_section" src={sourceimage} alt="Strike Logo" width={405} height={215}/>

                    <p className="hero_description">
                        {isArabic
                            ? "ملابس كومبريشن عالية الجودة مصممة للرياضيين، وعشاق الجيم، ولكل من يبحث عن الأداء، الراحة، والأناقة في كل حركة."
                            : "High quality compression wear engineered for athletes, gym enthusiasts, and those who demand performance, comfort, and style in every movement."}
                    </p>

                    <div className="hero_buttons">

                            <a
                                href="#short-sleeves"
                                className="object object-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection("short-sleeves");
                                }}
                                style={{
                                    color: "#000",
                                    textDecoration: "none",
                                }}
                            >
                        <button className="shop_btn">
                                {isArabic ? "تسوق الآن" : "Shop Now"}
                        </button>
                            </a>

                            <a
                                href="#target_box"
                                className="object object-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection("target_box");
                                }}
                                style={{
                                    color: "#fff",
                                    textDecoration: "none",
                                }}
                            >
                        <button className="learn_btn">
                                {isArabic ? "اعرف المزيد" : "Learn More"}
                        </button>
                            </a>

                    </div>
                </div>
            </section>

            <style jsx>{`
                .rtl {
                    direction: rtl;
                    text-align: right;
                }

                .ltr {
                    direction: ltr;
                    text-align: left;
                }
            `}</style>
        </>
    );
}

export default HeroSection;

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |