import React, { useState, useEffect } from 'react';
import { Sword, Users, Trophy, Clock, ShieldAlert } from "lucide-react";

// --- VERSION & DEBUG ---
// Manually update this every time you commit a change to the frontend
const FRONTEND_VERSION = "2024-07-31-v1.1"; 

// --- Helper Functions (no changes needed) ---
const formatTimeRemaining = (endTimeString) => { /* ... */ };
const processAttacks = (war) => { /* ... */ };

// --- COMPONENT ---
export default function CurrentWar() {
  const [warData, setWarData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Announce the version we are running in the browser console
    console.log(`--- Chimera Frontend Running ---`);
    console.log(`--- VERSION: ${FRONTEND_VERSION} ---`);
    console.log(`--------------------------------`);

    const fetchWarData = async () => {
        const API_URL = process.env.NODE_ENV === 'production'
          ? 'https://chimera-clan-sight.onrender.com'
          : 'http://localhost:3001';
        
        // Log the URL we are about to fetch. This is the most important debug line.
        console.log(`[FETCH] Attempting to fetch from: ${API_URL}/api/current-war`);

        try {
            const response = await fetch(`${API_URL}/api/current-war`);
            
            // Check if the response itself is okay
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }

            const result = await response.json();
            console.log("[FETCH] Successfully received data:", result);

            if (result.error) {
                throw new Error(result.error);
            }
            if (result.data.state === 'notInWar') {
                throw new Error("The clan is not currently in a war.");
            }

            setWarData(result.data);
        } catch (err: any) {
            // Log the full error
            console.error("[FETCH] An error occurred:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchWarData();
  }, []);

  // ... (Your loading and error JSX remains the same) ...
  if (isLoading) { /* ... */ }
  if (error || !warData) { /* ... */ }

  const warStatus = warData.state.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const attacks = processAttacks(warData);

  return (
    <div className="min-h-screen pt-24 px-6">
      {/* VISIBLE VERSION NUMBER for easy checking */}
      <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/50">
        v{FRONTEND_VERSION}
      </div>

      {/* ... (The rest of your JSX for the page remains the same) ... */}
    </div>
  );
}
