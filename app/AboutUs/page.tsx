"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import './page.css'

function AboutUsPage() {

    const [isArabic, setIsArabic] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedLanguage = localStorage.getItem("UserLanguage");

        if (savedLanguage === "Arabic") {
            setIsArabic(true);
        } else {
            setIsArabic(false);
        }
    }, []);

    const handleGoBack = () => {
        router.push("/StrikeStorePage");
    };

    return (
        <>

            <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"/>

            <div className={`about_container ${isArabic ? "rtl" : "ltr"}`}>

                {/* BACK BUTTON */}
                <div className="back_button_wrapper">
                    <button 
                        className="back_button" 
                        onClick={handleGoBack}
                        title={isArabic ? "العودة للمتجر" : "Back to Store"}
                    >
                        <span className="material-symbols-outlined">
                            {isArabic ? "arrow_forward" : "arrow_back"}
                        </span>
                        <span className="back_button_text">
                            {isArabic ? "العودة للمتجر" : "Back to Store"}
                        </span>
                    </button>
                </div>

                {/* HERO */}
                <section className="about_hero">

                    <div className="about_glow"></div>

                    <div className="about_content">

                        <span className="about_badge">
                            {isArabic
                                ? "عن STRIKE"
                                : "ABOUT STRIKE"}
                        </span>

                        <h1 className="about_title">
                            {isArabic
                                ? "مصمم للأداء"
                                : "Built For Performance"}
                        </h1>

                        <p className="about_description">
                            {isArabic
                                ? "في STRIKE نحن نصمم ملابس كومبريشن تجمع بين الأداء الرياضي، الراحة، والتصميم العصري لتمنحك أفضل تجربة داخل الجيم وخارجه."
                                : "At STRIKE, we create premium compression wear that combines athletic performance, comfort, and modern aesthetics for people who demand more from every workout."}
                        </p>

                    </div>

                </section>

                {/* STORY */}
                <section className="about_story">

                    <div className="story_left">

                        <span className="section_tag">
                            {isArabic
                                ? "قصتنا"
                                : "OUR STORY"}
                        </span>

                        <h2>
                            {isArabic
                                ? "بدأت الفكرة من شغف بالرياضة"
                                : "Driven By Passion"}
                        </h2>

                        <p>
                            {isArabic
                                ? "بدأت STRIKE بهدف بسيط: تصميم ملابس رياضية تمنح الرياضيين الثقة والراحة أثناء التدريب. نحن نؤمن أن الأداء الحقيقي يبدأ عندما تشعر بالقوة والراحة في كل حركة."
                                : "STRIKE started with one goal in mind: creating athletic wear that empowers athletes with confidence, comfort, and elite performance. Every product is designed to move naturally with your body."}
                        </p>

                    </div>

                    <div className="story_right">

                        <div className="story_card">
                            <span className="material-symbols-outlined">
                                military_tech
                            </span>

                            <h3>
                                {isArabic
                                    ? "جودة احترافية"
                                    : "Elite Quality"}
                            </h3>

                            <p>
                                {isArabic
                                    ? "خامات قوية وتشطيبات فاخرة مصممة لتدوم."
                                    : "Premium fabrics and luxury finishes made to last."}
                            </p>
                        </div>

                        <div className="story_card">
                            <span className="material-symbols-outlined">
                                exercise
                            </span>

                            <h3>
                                {isArabic
                                    ? "حرية الحركة"
                                    : "Freedom Of Movement"}
                            </h3>

                            <p>
                                {isArabic
                                    ? "تصميم مرن يدعم جسمك أثناء التمارين."
                                    : "Flexible fits engineered for intense training sessions."}
                            </p>
                        </div>

                    </div>

                </section>

                {/* VALUES */}
                <section className="values_section">

                    <div className="values_header">

                        <span className="section_tag">
                            {isArabic
                                ? "قيمنا"
                                : "OUR VALUES"}
                        </span>

                        <h2>
                            {isArabic
                                ? "لماذا STRIKE ؟"
                                : "Why STRIKE ?"}
                        </h2>

                    </div>

                    <div className="values_grid">

                        <div className="value_box"> 
                            <ul>
                                <li><p>{isArabic ? "جوده عاليه بسعر مناسب" : "Perfect Quality With a good Price" }</p></li>
                                <li><p>{isArabic ? "مصمم لتحسين الراحة والدعم أثناء التمرين." : "Engineered to support athletes during every movement." }</p></li>
                                <li><p>{isArabic ? "ستايل عصري يجمع بين البساطة والفخامة." : "Minimal modern aesthetics with luxury finishing." }</p></li>
                                <li><p>{isArabic ? "خامات مريحة تسمح بتهوية ممتازة طوال اليوم." : "Breathable materials for maximum comfort all day." }</p></li>
                            </ul>
                        </div>

                    </div>

                </section>

            </div>
        </>
    );
}

export default AboutUsPage;