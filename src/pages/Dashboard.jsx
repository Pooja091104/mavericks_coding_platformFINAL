import React, { useState } from "react";
import MetricsCard from "../analytics/components/MetricsCard";
import ScoreChart from "../analytics/components/ScoreChart";
import ProgressChart from "../analytics/components/ProgressChart";
import RecentActivityTable from "../analytics/components/RecentActivityTable";
import ChatBox from "../analytics/components/ChatBox";
import HackathonPanel from "../analytics/components/HackathonPanel";

import "../styles.css";

export default function Dashboard({ user }) {
  const [showHackathonPanel, setShowHackathonPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const toggleHackathonPanel = () => {
    setShowHackathonPanel(!showHackathonPanel);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Analytics Dashboard</h1>
      <p className="dashboard-subtitle">Welcome to your analytics dashboard.</p>

      {/* Concise metrics row */}
      <div className="metrics-row" style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '0 8px' }}>
        <MetricsCard title="Users" value="120" />
        <MetricsCard title="Assessments" value="75" />
        <MetricsCard title="Avg Score" value="82%" />
        <MetricsCard title="Courses" value="5" />
      </div>

      {/* Key charts in a single row */}
      <div className="metrics-row" style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1 }}><ScoreChart /></div>
        <div style={{ flex: 1 }}><ProgressChart /></div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <RecentActivityTable />
      </div>

      {/* Button to toggle Hackathon Panel */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={toggleHackathonPanel} className="toggle-button">
          {showHackathonPanel ? "Hide Hackathons" : "Show Hackathons"}
        </button>
      </div>

      {/* Conditionally render HackathonPanel */}
      {showHackathonPanel && (
        <div style={{ marginBottom: 32 }}>
          <HackathonPanel />
        </div>
      )}

      {/* Floating Chatbot Button and Overlay */}
      <button
        className="floating-chatbot-btn"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          fontSize: 22,
          cursor: 'pointer',
          display: showChat ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          transition: 'box-shadow 0.2s',
        }}
        onClick={() => setShowChat(true)}
        aria-label="Open Chatbot"
        title="Chat with AI Assistant"
      >
        <span style={{fontSize: 20, lineHeight: 1}}>💬</span>
      </button>

      {showChat && (
        <div
          className="chatbot-overlay"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1100,
            width: 320,
            maxWidth: '90vw',
            height: 400,
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 4 }}>
            <button
              style={{ background: 'none', border: 'none', fontSize: 18, color: '#6366f1', cursor: 'pointer', padding: 2 }}
              onClick={() => setShowChat(false)}
              aria-label="Close Chatbot"
              title="Close"
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatBox user={user} trackUserInteraction={true} />
          </div>
        </div>
      )}
    </div>
  );
}
