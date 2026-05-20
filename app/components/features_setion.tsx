"use client";

import { useEffect, useState } from "react";

function FeatureSection() {
    const [isArabic, setIsArabic] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("UserLanguage");

        if (savedLanguage === "Arabic") {
            setIsArabic(true);
        } else {
            setIsArabic(false);
        }
    }, []);

    return (
        <>
            <section
                className={`features_section ${isArabic ? "rtl" : "ltr"}`}
                id="target_box"
            >

                <div className="feature_box">
                    <span className="material-symbols-outlined">
                        exercise
                    </span>

                    <h2>
                        {isArabic
                            ? "أداء رياضي مثالي"
                            : "Performance Fit"}
                    </h2>

                    <p>
                        {isArabic
                            ? "مصمم لدعم الحركة وتوفير أقصى درجات الراحة أثناء التمارين المكثفة."
                            : "Designed to support movement and maximize comfort during intense workouts."}
                    </p>
                </div>

                <div className="feature_box">
                    <span className="material-symbols-outlined">
                        humidity_percentage
                    </span>

                    <h2>
                        {isArabic
                            ? "خامات قابلة للتنفس"
                            : "Breathable Fabric"}
                    </h2>

                    <p>
                        {isArabic
                            ? "خامات عالية الجودة تحافظ على جسمك باردًا وجافًا طوال التمرين."
                            : "Premium materials that keep your body cool and dry throughout your training."}
                    </p>
                </div>

                <div className="feature_box short-sleeves" id="short-sleeves">
                    <span className="material-symbols-outlined">
                        workspace_premium
                    </span>

                    <h2>
                        {isArabic
                            ? "جودة فاخرة"
                            : "Premium Quality"}
                    </h2>

                    <p>
                        {isArabic
                            ? "خياطة متينة وتشطيبات فاخرة مصممة للاستخدام الطويل والمظهر الاحترافي."
                            : "Durable stitching and luxury finishes built for long-term use and elite style."}
                    </p>
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

export default FeatureSection;