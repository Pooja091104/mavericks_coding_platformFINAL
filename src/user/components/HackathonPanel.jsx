import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function HackathonPanel({ user }) {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Real-time Firestore listener for hackathons
    setLoading(true);
    const hackathonsQuery = query(
      collection(db, 'hackathons'),
      orderBy('startDate', 'asc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(
      hackathonsQuery,
      (snapshot) => {
        const fetchedHackathons = [];
        snapshot.forEach((doc) => {
          fetchedHackathons.push({ id: doc.id, ...doc.data() });
        });
        setHackathons(fetchedHackathons);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching hackathons:', err);
        setLoading(false);
      }
    );

    loadUserSubmissions();
    loadMockHackathons();

    return () => unsubscribe();
  }, []);

  const loadUserSubmissions = () => {
    // Mock user submissions data
    const mockSubmissions = [
      {
        id: 's1',
        hackathonId: '3',
        submittedAt: '2024-01-10T14:30:00Z',
        status: 'submitted',
        score: 85,
        feedback:
          'Great implementation of the core features. Consider adding more error handling.',
        repoUrl: 'https://github.com/user/weather-app',
        demoUrl: 'https://weather-app-demo.netlify.app',
      },
      {
        id: 's2',
        hackathonId: '4',
        submittedAt: '2023-12-05T09:15:00Z',
        status: 'evaluated',
        score: 92,
        feedback:
          'Excellent work! Your solution was innovative and well-documented.',
        repoUrl: 'https://github.com/user/portfolio-generator',
        demoUrl: 'https://portfolio-gen-demo.netlify.app',
      },
    ];
    setUserSubmissions(mockSubmissions);
  };

  const loadMockHackathons = () => {
    try {
      const mockHackathons = [
        {
          id: '2',
          title: 'AI Chatbot Challenge',
          description: 'Build an intelligent chatbot using OpenAI API',
          prize: '$1000',
          deadline: '2024-02-20',
          participants: 18,
          difficulty: 'Advanced',
          status: 'active',
          startDate: '2024-01-20T00:00:00Z',
          endDate: '2024-02-20T23:59:59Z',
          tags: ['Python', 'OpenAI', 'Flask'],
          requirements: [
            'Natural language processing',
            'Context awareness',
            'Multi-platform support',
            'Analytics dashboard',
          ],
          timeRemaining: '20 days',
          registrationStatus: 'open',
          userStatus: 'not-registered',
        },
        {
          id: '6',
          title: 'E-commerce Platform',
          description: 'Create a complete e-commerce solution',
          prize: '$750',
          deadline: '2024-01-30',
          participants: 32,
          difficulty: 'Advanced',
          status: 'completed',
          startDate: '2023-12-01T00:00:00Z',
          endDate: '2024-01-30T23:59:59Z',
          tags: ['React', 'Express', 'PostgreSQL'],
          requirements: [
            'Product catalog',
            'Shopping cart',
            'Payment integration',
            'Admin dashboard',
          ],
          timeRemaining: '0 days',
          registrationStatus: 'closed',
          userStatus: 'not-participated',
        },
      ];

      setHackathons((prev) => [...prev, ...mockHackathons]);
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error loading hackathons:', error);
      setLoading(false);
    }
  };

  const handleJoinHackathon = (hackathonId) => {
    setHackathons((prev) =>
      prev.map((h) =>
        h.id === hackathonId
          ? { ...h, participants: h.participants + 1, userStatus: 'registered' }
          : h
      )
    );
  };

  const handleSubmitSolution = (hackathonId) => {
    alert('Solution submitted successfully! Good luck! 🚀');
    setHackathons((prev) =>
      prev.map((h) =>
        h.id === hackathonId ? { ...h, userStatus: 'submitted' } : h
      )
    );
  };

  const handleViewDetails = (hackathon) => {
    setSelectedHackathon(hackathon);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedHackathon(null);
  };

  const filteredHackathons = hackathons
    .filter((h) => activeTab === 'all' || h.status === activeTab)
    .filter((h) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'registered') return h.userStatus === 'registered';
      if (statusFilter === 'submitted') return h.userStatus === 'submitted';
      if (statusFilter === 'winner') return h.userStatus === 'winner';
      return true;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Keep your existing big return JSX here unchanged
  // ...
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🏆 Hackathon Challenges</h2>
        <p className="text-purple-100 text-lg">
          Join exciting coding challenges, showcase your skills, and win amazing prizes!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-lg font-semibold text-gray-800">Active Challenges</h3>
          <p className="text-2xl font-bold text-purple-600">
            {hackathons.filter(h => h.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-800">Total Participants</h3>
          <p className="text-2xl font-bold text-blue-600">
            {hackathons.reduce((sum, h) => sum + h.participants, 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-gray-800">Total Prize Pool</h3>
          <p className="text-2xl font-bold text-green-600">$2,250</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔍 All Challenges
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚀 Active Challenges
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✅ Completed
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📅 Upcoming
              </button>
            </nav>
            
            <div className="flex items-center">
              <select 
                className="border border-gray-300 rounded-md text-sm py-1 px-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="submitted">Submitted</option>
                <option value="winner">Winners</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredHackathons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No {activeTab} hackathons
              </h3>
              <p className="text-gray-600">
                {activeTab === 'active' 
                  ? 'Check back soon for new challenges!' 
                  : 'Complete challenges to see them here.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredHackathons.map((hackathon) => (
                <div key={hackathon.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {hackathon.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{hackathon.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {hackathon.prize}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hackathon.difficulty === 'Advanced' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hackathon.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hackathon.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {hackathon.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-1">👥</span>
                      {hackathon.participants} participants
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">⏰</span>
                      Deadline: {new Date(hackathon.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {hackathon.status === 'active' && (
                      <>
                        {hackathon.userStatus === 'registered' || hackathon.userStatus === 'submitted' ? (
                          <button
                            onClick={() => handleSubmitSolution(hackathon.id)}
                            className={`flex-1 py-2 px-4 rounded transition-colors ${hackathon.userStatus === 'submitted' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            disabled={hackathon.userStatus === 'submitted'}
                          >
                            {hackathon.userStatus === 'submitted' ? 'Solution Submitted' : 'Submit Solution'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinHackathon(hackathon.id)}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                          >
                            Join Challenge
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewDetails(hackathon)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                      </>
                    )}
                    
                    {hackathon.status === 'completed' && (
                      <div className="flex w-full gap-3">
                        <div className="flex-1 text-center py-2 bg-gray-100 text-gray-600 rounded">
                          {hackathon.userStatus === 'winner' ? '🏆 Winner!' : 
                           hackathon.userStatus === 'submitted' ? '✅ Submitted' : 
                           'Challenge Completed'}
                        </div>
                        <button 
                          onClick={() => handleViewDetails(hackathon)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                    
                    {hackathon.status === 'upcoming' && (
                      <div className="flex w-full gap-3">
                        <button
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                          onClick={() => handleViewDetails(hackathon)}
                        >
                          Get Notified
                        </button>
                        <button 
                          onClick={() => handleViewDetails(hackathon)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How to Participate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Participate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-2">Join a Challenge</h4>
            <p className="text-sm text-gray-600">
              Browse available hackathons and join the ones that interest you
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-2">Build Your Solution</h4>
            <p className="text-sm text-gray-600">
              Use your skills to create an innovative solution within the deadline
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-2">Submit & Win</h4>
            <p className="text-sm text-gray-600">
              Submit your solution and compete for prizes and recognition
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon Detail Modal */}
      {showDetailModal && selectedHackathon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedHackathon.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedHackathon.description}</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedHackathon.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedHackathon.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedHackathon.status === 'active' ? 'Active' :
                       selectedHackathon.status === 'completed' ? 'Completed' :
                       'Upcoming'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedHackathon.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      selectedHackathon.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedHackathon.difficulty}
                    </span>
                    {selectedHackathon.userStatus === 'winner' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        🏆 Winner
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHackathon.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Requirements</h3>
                    <ul className="text-gray-600 space-y-2">
                      {selectedHackathon.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submission Section - Only show if user has submitted */}
                  {selectedHackathon.userStatus === 'submitted' || selectedHackathon.userStatus === 'winner' ? (
                    <div className="border-t pt-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">Your Submission</h3>
                      {userSubmissions.filter(s => s.hackathonId === selectedHackathon.id).map(submission => (
                        <div key={submission.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'evaluated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status === 'evaluated' ? 'Evaluated' : 'Pending Review'}
                            </span>
                          </div>
                          
                          {submission.score && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Score: </span>
                              <span className="text-sm font-bold text-purple-600">{submission.score}/100</span>
                            </div>
                          )}
                          
                          {submission.feedback && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">Feedback: </span>
                              <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                            </div>
                          )}
                          
                          <div className="flex space-x-3">
                            {submission.repoUrl && (
                              <a 
                                href={submission.repoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Repository
                              </a>
                            )}
                            {submission.demoUrl && (
                              <a 
                                href={submission.demoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Right Column - Stats & Actions */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Challenge Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Prize:</span>
                        <div className="text-xl font-bold text-green-600">{selectedHackathon.prize}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Deadline:</span>
                        <div className="font-medium">{new Date(selectedHackathon.deadline).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Participants:</span>
                        <div className="font-medium">{selectedHackathon.participants}</div>
                      </div>
                      {selectedHackathon.timeRemaining && (
                        <div>
                          <span className="text-sm text-gray-500">Time Remaining:</span>
                          <div className="font-medium">{selectedHackathon.timeRemaining}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Registration:</span>
                        <div className="font-medium capitalize">{selectedHackathon.registrationStatus}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {selectedHackathon.status === 'active' && (
                      <>
                        {selectedHackathon.userStatus === 'registered' ? (
                          <button
                            onClick={() => {
                              handleSubmitSolution(selectedHackathon.id);
                              handleCloseModal();
                            }}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                          >
                            Submit Solution
                          </button>
                        ) : selectedHackathon.userStatus === 'submitted' ? (
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
                          >
                            Solution Submitted
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleJoinHackathon(selectedHackathon.id);
                              handleCloseModal();
                            }}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                          >
                            Join Challenge
                          </button>
                        )}
                      </>
                    )}
                    
                    {selectedHackathon.status === 'upcoming' && (
                      <button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                      >
                        Get Notified
                      </button>
                    )}
                    
                    <button
                      onClick={handleCloseModal}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
