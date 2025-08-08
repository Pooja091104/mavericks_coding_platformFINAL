import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const HackathonPanel = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    // Real-time Firestore listener for hackathons
    const hackathonsQuery = query(
      collection(db, 'hackathons'),
      orderBy('date', 'asc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(hackathonsQuery, (snapshot) => {
      const fetchedHackathons = [];
      snapshot.forEach(doc => {
        fetchedHackathons.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setHackathons(fetchedHackathons);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching hackathons:', err);
      setError('Failed to load hackathon data');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <div className="metrics-card">
      <h3 className="metrics-title">Hackathon Management</h3>
      <p className="metrics-subtitle">
        Overview of active, upcoming, and completed hackathons.
      </p>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          <span className="ml-2 text-gray-600">Loading hackathons...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchHackathons} 
            className="ml-4 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="hackathon-list">
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className="hackathon-item">
              <div className="hackathon-info">
                <span className="hackathon-name">{hackathon.name}</span>
                <span className="hackathon-date">{hackathon.date}</span>
              </div>
              <div className="hackathon-status-participants">
                <span
                  className={`hackathon-status status-${hackathon.status.toLowerCase()}`}
                >
                  {hackathon.status}
                </span>
                <span className="hackathon-participants">
                  {hackathon.participants} Participants
                </span>
              </div>
              <div className="hackathon-actions">
                {hackathon.status === "Active" && (
                  <button className="hackathon-action-btn join-btn">Join</button>
                )}
                {hackathon.status === "Upcoming" && (
                  <button className="hackathon-action-btn view-details-btn">
                    View Details
                  </button>
                )}
                {hackathon.status === "Completed" && (
                  <button className="hackathon-action-btn view-results-btn">
                    View Results
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HackathonPanel;