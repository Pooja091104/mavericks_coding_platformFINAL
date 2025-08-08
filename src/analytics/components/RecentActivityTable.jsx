import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const RecentActivityTable = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Try to fetch real activities from Firestore
      const activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('date', 'desc'),
        limit(10)
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      if (!activitiesSnapshot.empty) {
        const fetchedActivities = [];
        activitiesSnapshot.forEach(doc => {
          fetchedActivities.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setActivities(fetchedActivities);
      } else {
        // If no real data exists, use demo data
        setActivities([
          {
            id: 1,
            user: "John Doe",
            email: "john.doe@example.com",
            action: "Completed JavaScript Assessment",
            date: "25-07-2025",
            skills: ["JavaScript", "React", "Node.js"],
            assessmentScore: 85,
            status: "completed",
            progress: {
              profileLoaded: {
                completed: true,
                timestamp: "2025-01-20T10:00:00Z",
                details: "Profile created successfully",
              },
              assessmentCompleted: {
                completed: true,
                timestamp: "2025-01-21T14:30:00Z",
                details: "Assessment took 45 minutes, Score: 85%",
              },
              skillsEvaluated: {
                completed: true,
                timestamp: "2025-01-21T15:00:00Z",
                details: "Skills evaluated: JavaScript, React, Node.js",
              },
              learningPathGenerated: {
                completed: true,
                timestamp: "2025-01-22T09:00:00Z",
                details: "5 modules recommended",
              },
            },
          },
          {
            id: 2,
            user: "Jane Smith",
            email: "jane.smith@example.com",
            action: "Enrolled in React Course",
            date: "22-07-2025",
            skills: ["Python", "Django", "Machine Learning"],
            assessmentScore: 92,
            status: "completed",
            progress: {
              profileLoaded: {
                completed: true,
                timestamp: "2025-01-21T11:00:00Z",
                details: "Profile created successfully",
              },
              assessmentCompleted: {
                completed: true,
                timestamp: "2025-01-22T13:15:00Z",
                details: "Assessment took 38 minutes, Score: 92%",
              },
              skillsEvaluated: {
                completed: true,
                timestamp: "2025-01-22T13:45:00Z",
                details: "Skills evaluated: Python, Django, ML",
              },
              learningPathGenerated: {
                completed: true,
                timestamp: "2025-01-23T09:30:00Z",
                details: "3 modules recommended",
              },
            },
          },
          {
            id: 3,
            user: "Mike Ross",
            email: "mike.ross@example.com",
            action: "Completed HTML & CSS Test",
            date: "24-07-2025",
            skills: ["HTML", "CSS", "JavaScript"],
            assessmentScore: 78,
            status: "in-progress",
            progress: {
              profileLoaded: {
                completed: true,
                timestamp: "2025-01-23T10:00:00Z",
                details: "Profile created successfully",
              },
              assessmentCompleted: {
                completed: true,
                timestamp: "2025-01-24T16:20:00Z",
                details: "Assessment took 52 minutes, Score: 78%",
              },
              skillsEvaluated: {
                completed: false,
                timestamp: null,
                details: "Skills evaluation in progress",
              },
              learningPathGenerated: {
                completed: false,
                timestamp: null,
                details: "Pending skills evaluation",
              },
            },
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity data');
      // Fall back to demo data if fetch fails
      setActivities([
        {
          id: 1,
          user: "John Doe",
          email: "john.doe@example.com",
          action: "Completed JavaScript Assessment",
          date: "25-07-2025",
          skills: ["JavaScript", "React", "Node.js"],
          assessmentScore: 85,
          status: "completed",
          progress: {
            profileLoaded: {
              completed: true,
              timestamp: "2025-01-20T10:00:00Z",
              details: "Profile created successfully",
            },
            assessmentCompleted: {
              completed: true,
              timestamp: "2025-01-21T14:30:00Z",
              details: "Assessment took 45 minutes, Score: 85%",
            },
            skillsEvaluated: {
              completed: true,
              timestamp: "2025-01-21T15:00:00Z",
              details: "Skills evaluated: JavaScript, React, Node.js",
            },
            learningPathGenerated: {
              completed: true,
              timestamp: "2025-01-22T09:00:00Z",
              details: "5 modules recommended",
            },
          },
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action, userId) => {
    switch (action) {
      case "viewDetails":
        alert(`Viewing details for user ${userId}`);
        break;
      case "sendMessage":
        alert(`Sending message to user ${userId}`);
        break;
      case "updateProfile":
        alert(`Profile update initiated for user ${userId}`);
        break;
      case "generateReport":
        alert(`Report generation initiated for user ${userId}`);
        break;
      default:
        break;
    }
  };

  const getStatusBadge = (status) => {
    let className = "status-badge";
    if (status === "completed") {
      className += " status-completed";
    } else if (status === "in-progress") {
      className += " status-in-progress";
    } else if (status === "pending") {
      className += " status-pending";
    }

    return <span className={className}>{status.replace("-", " ")}</span>;
  };

  const ProgressBar = ({ progress }) => {
    const steps = [
      { key: "profileLoaded", label: "Profile Loaded", icon: "👤" },
      { key: "assessmentCompleted", label: "Assessment Completed", icon: "📝" },
      { key: "skillsEvaluated", label: "Skills Evaluated", icon: "🎯" },
      {
        key: "learningPathGenerated",
        label: "Learning Path Generated",
        icon: "🛤️",
      },
    ];

    return (
      <div className="progress-container">
        <div className="progress-steps">
          {steps.map((step, index) => {
            const stepData = progress[step.key];
            const isCompleted = stepData?.completed;
            const isActive = !isCompleted && index === 0; // Simplified logic

            return (
              <div
                key={step.key}
                className={`progress-step ${
                  isCompleted ? "completed" : isActive ? "active" : "pending"
                }`}
                title={stepData?.details || step.label}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-label">{step.label}</div>
                {stepData?.timestamp && (
                  <div className="step-timestamp">
                    {new Date(stepData.timestamp).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="metrics-card">
        <h3 className="metrics-title">Recent User Activity</h3>
        <div className="loading-spinner">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-card">
        <h3 className="metrics-title">Recent User Activity</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="metrics-card">
      <h3 className="metrics-title">Recent User Activity</h3>
      <p className="metrics-subtitle">
        Track user progress and engagement across the platform.
      </p>

      <div className="activity-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Date</th>
              <th>Skills</th>
              <th>Score</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="activity-row">
                <td className="user-cell">
                  <div className="user-info">
                    <div className="user-name">{activity.user}</div>
                    <div className="user-email">{activity.email}</div>
                  </div>
                </td>
                <td className="action-cell">{activity.action}</td>
                <td className="date-cell">{activity.date}</td>
                <td className="skills-cell">
                  <div className="skills-list">
                    {activity.skills.slice(0, 2).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {activity.skills.length > 2 && (
                      <span className="skill-tag more">
                        +{activity.skills.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="score-cell">
                  <div className="score-badge">{activity.assessmentScore}%</div>
                </td>
                <td className="status-cell">
                  {getStatusBadge(activity.status)}
                </td>
                <td className="progress-cell">
                  <ProgressBar progress={activity.progress} />
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleAction("viewDetails", activity.id)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn message"
                      onClick={() => handleAction("sendMessage", activity.id)}
                      title="Send Message"
                    >
                      💬
                    </button>
                    <button
                      className="action-btn update"
                      onClick={() => handleAction("updateProfile", activity.id)}
                      title="Update Profile"
                    >
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activities.length === 0 && (
        <div className="empty-state">
          <p>No recent activity found.</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityTable;
