"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";

/* ================= FIREBASE ================= */

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

/* ================= INNER PAGE ================= */

function CancelOrderContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("جارى إلغاء الطلب...");

  useEffect(() => {
    const cancelOrder = async () => {
      try {
        const orderId = searchParams.get("id");

        if (!orderId) {
          setMessage("لم يتم العثور على رقم الطلب");
          setLoading(false);
          return;
        }

        const orderRef = doc(db, "orders", orderId);

        await updateDoc(orderRef, {
          status: "cancelled",
          expiresAt: null,
        });

        setMessage("تم إلغاء الاوردر بنجاح ❌");
      } catch (error) {
        console.log(error);
        setMessage("حدث خطأ أثناء إلغاء الاوردر");
      } finally {
        setLoading(false);
      }
    };

    cancelOrder();
  }, [searchParams]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f",
        color: "white",
        fontSize: "28px",
        fontWeight: "bold",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {loading ? "جارى الإلغاء..." : message}
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function CancelOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelOrderContent />
    </Suspense>
  );
}