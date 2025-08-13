import React, { useEffect, useState } from "react";

const CLAN_TAG = "#YOUR_CLAN_TAG"; // Replace with your clan tag
const API_URL =
  process.env.REACT_APP_API_URL || "https://chimera-clan-sight.onrender.com";

const CWL = () => {
  const [cwlData, setCwlData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCwlPageData = async () => {
      try {
        const [groupResponse, warLogResponse] = await Promise.all([
          fetch(`${API_URL}/api/cwl`),
          fetch(`${API_URL}/api/war-log-stats`),
        ]);

        if (!groupResponse.ok || !warLogResponse.ok) {
          throw new Error("Failed to fetch CWL data from server.");
        }

        const groupResult = await groupResponse.json();
        const warLogResult = await warLogResponse.json();

        // If backend returned an error message
        if (groupResult.error || warLogResult.error) {
          throw new Error(groupResult.error || warLogResult.error);
        }

        // Validate structure
        if (
          !groupResult.data ||
          !Array.isArray(groupResult.data.clans) ||
          groupResult.data.clans.length === 0
        ) {
          throw new Error("CWL group data is missing or incomplete.");
        }

        // If not in CWL season
        if (groupResult.data.state === "notInWar") {
          throw new Error("The clan is not currently in a Clan War League.");
        }

        // Process and save CWL data
        const processedData = processCwlData(
          groupResult.data,
          warLogResult.data
        );
        setCwlData(processedData);
      } catch (err) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCwlPageData();
  }, []);

  // Function to process CWL data safely
  const processCwlData = (groupData, warLogData) => {
    if (!groupData || !Array.isArray(groupData.clans)) {
      throw new Error("Invalid CWL data format.");
    }

    const ourClan = groupData.clans.find((c) => c.tag === CLAN_TAG);
    if (!ourClan) {
      throw new Error("Our clan not found in CWL group data.");
    }

    // Example processing: get war count and stars
    return {
      name: ourClan.name,
      tag: ourClan.tag,
      stars: ourClan.stars || 0,
      wars: warLogData?.length || 0,
    };
  };

  // Render loading state
  if (isLoading) {
    return <p>Loading CWL data...</p>;
  }

  // Render error state
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // Render CWL data
  return (
    <div>
      <h2>CWL Overview</h2>
      {cwlData ? (
        <div>
          <p>
            <strong>Clan:</strong> {cwlData.name} ({cwlData.tag})
          </p>
          <p>
            <strong>Stars:</strong> {cwlData.stars}
          </p>
          <p>
            <strong>Wars Recorded:</strong> {cwlData.wars}
          </p>
        </div>
      ) : (
        <p>No CWL data available.</p>
      )}
    </div>
  );
};

export default CWL;
