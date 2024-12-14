"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import './globals.css';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    router.push("/Home");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {isLoading && (
        <div className="spinner">
          <style jsx>{`
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
