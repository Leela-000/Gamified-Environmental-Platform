import { useAuth } from "@/lib/auth";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, BarChart3, User, Share2, Copy, CheckCircle2, TrendingUp, Trophy, GamepadIcon, BookOpen, Target, Award } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "wouter";

const tabs = [
  "Profile",
  "Progress",
];

export default function StudentAppShell() {
  const { role, username, clear } = useAuth();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profileSharing, setProfileSharing] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  
  // Mock user object - in real app this would come from useAuth or API
  const user = {
    username: username,
    email: `${username}@example.com` // This would come from your auth system
  };

  const initialTab = useMemo(() => {
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const q = new URLSearchParams(search);
      const t = (q.get('tab') || '').toLowerCase();
      if (!t) return 0;
      const idx = tabs.findIndex(x => x.toLowerCase() === t);
      return idx >= 0 ? idx : 0;
    } catch {
      return 0;
    }
  }, []);
  const [tab, setTab] = useState(initialTab);

  // Generate shareable link when profile sharing is enabled
  useEffect(() => {
    if (profileSharing && username) {
      const baseUrl = window.location.origin;
      const profileId = btoa(username); // Simple encoding
      setShareableLink(`${baseUrl}/profile/${profileId}`);
    } else {
      setShareableLink("");
    }
  }, [profileSharing, username]);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/nature-319.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white/90">Student Portal</h1>
            <div className="flex gap-2 items-center">
              <NotificationsBell />
              <Button 
                variant="secondary" 
                onClick={clear}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
            {tabs.map((tabName, index) => (
              <button
                key={tabName}
                onClick={() => setTab(index)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  tab === index
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tabName === 'Profile' && <User className="inline w-4 h-4 mr-2" />}
                {tabName === 'Progress' && <BarChart3 className="inline w-4 h-4 mr-2" />}
                {tabName}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {tab === 0 && (
          /* Profile Tab */
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white/90 mb-4">Student Profile</h2>
            
            {user && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm">Name</label>
                      <p className="text-white text-lg font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm">Email</label>
                      <p className="text-white text-lg">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm">Account Type</label>
                      <Badge className="bg-blue-500/20 text-blue-200 border-blue-300/30">
                        Student
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Profile Sharing Controls */}
                  <div className="space-y-4">
                    <div className="border border-white/20 rounded-lg p-4">
                      <h3 className="text-white/90 font-semibold mb-3 flex items-center">
                        <Share2 className="w-4 h-4 mr-2" />
                        Profile Sharing
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Make profile public</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileSharing}
                              onChange={(e) => setProfileSharing(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </div>
                        
                        {profileSharing && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <label className="text-white/70 text-sm">Shareable Link</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={shareableLink}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={copyToClipboard}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-white/60 text-xs">
                              Others can view your progress and achievements using this link
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Cards for Profile Tab */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/videos">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                        </svg>
                        <h3 className="text-white font-semibold">View Videos</h3>
                      </div>
                      <p className="text-white/70 text-sm">Watch educational content about sustainability</p>
                    </div>
                  </Link>
                  
                  <Link href="/games">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6 hover:from-green-500/30 hover:to-emerald-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <h3 className="text-white font-semibold">Play Games</h3>
                      </div>
                      <p className="text-white/70 text-sm">Learn through interactive environmental games</p>
                    </div>
                  </Link>
                  
                  <Link href="/tasks">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 hover:from-purple-500/30 hover:to-pink-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-white font-semibold">Complete Tasks</h3>
                      </div>
                      <p className="text-white/70 text-sm">Take on eco-friendly challenges and assignments</p>
                    </div>
                  </Link>
                  
                  <Link href="/quizzes">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 hover:from-orange-500/30 hover:to-red-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-orange-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-white font-semibold">Take Quizzes</h3>
                      </div>
                      <p className="text-white/70 text-sm">Test your environmental knowledge</p>
                    </div>
                  </Link>
                  
                  <Link href="/assignments">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-xl p-6 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-white font-semibold">View Assignments</h3>
                      </div>
                      <p className="text-white/70 text-sm">Check your homework and projects</p>
                    </div>
                  </Link>
                  
                  <Link href="/leaderboard">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-6 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h3 className="text-white font-semibold">Leaderboard</h3>
                      </div>
                      <p className="text-white/70 text-sm">See how you rank among your peers</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          /* Progress Tab */
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Progress Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-6">
                    <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-green-300 text-sm">Achievements Earned</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-6">
                    <GamepadIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">8</p>
                    <p className="text-blue-300 text-sm">Games Completed</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-6">
                    <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">15</p>
                    <p className="text-purple-300 text-sm">Tasks Completed</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/30 rounded-xl p-6">
                    <svg className="w-8 h-8 text-orange-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-2xl font-bold text-white">6</p>
                    <p className="text-orange-300 text-sm">Quizzes Completed</p>
                  </div>
                </div>
              </div>

              {/* Second Row - Assignments and Videos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/30 rounded-xl p-6">
                    <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-2xl font-bold text-white">4</p>
                    <p className="text-indigo-300 text-sm">Assignments Submitted</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-400/30 rounded-xl p-6">
                    <svg className="w-8 h-8 text-pink-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-pink-300 text-sm">Videos Watched</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Recent Achievements
              </h3>
              
              <div className="space-y-3">
                {[
                  { title: "Eco Warrior", description: "Completed 10 environmental tasks", icon: "🌱", time: "2 days ago" },
                  { title: "Quiz Master", description: "Perfect score on Climate Change quiz", icon: "🧠", time: "3 days ago" },
                  { title: "Assignment Ace", description: "Submitted Water Conservation project", icon: "📋", time: "5 days ago" },
                  { title: "Waste Master", description: "Perfect score in waste segregation game", icon: "♻️", time: "1 week ago" },
                  { title: "Energy Saver", description: "Completed energy conservation quiz", icon: "⚡", time: "2 weeks ago" },
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{achievement.title}</h4>
                      <p className="text-white/70 text-sm">{achievement.description}</p>
                    </div>
                    <div className="text-white/60 text-xs">{achievement.time}</div>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
                <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Current Goals
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Monthly Tasks</span>
                      <span className="text-white">15/20</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Game Challenges</span>
                      <span className="text-white">8/12</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Quizzes</span>
                      <span className="text-white">6/10</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Assignments</span>
                      <span className="text-white">4/6</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Video Lessons</span>
                      <span className="text-white">12/18</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
                <h3 className="text-xl font-bold text-white/90 mb-4">Activity Streak</h3>
                
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-white mb-2">7</div>
                  <p className="text-white/70">Days Active</p>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, index) => (
                    <div
                      key={index}
                      className={`h-8 rounded ${
                        index < 7 ? 'bg-green-500/70' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-center text-white/60 text-sm mt-3">
                  Keep up the great work! 🔥
                </p>
              </div>
            </div>
          </div>
        )}

        {!showProfileEditor ? <StudentProfileView /> : <StudentProfileEditor onClose={() => setShowProfileEditor(false)} />}

        {/* Bottom bar */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-full border border-white/30 bg-white/20 backdrop-blur-xl shadow-lg px-2 py-1">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={()=>setShowProfileEditor(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-white/90">{title}</h2>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">{children}</div>
    </section>
  );
}

function StudentProfileView() {
  const { username } = useAuth();
  const [profile, setProfile] = useState<any | null>(null); // /api/student/profile
  const [me, setMe] = useState<any | null>(null); // /api/me/profile (for avatar/schoolId)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, m, s] = await Promise.all([
          fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setProfile(p);
        setMe(m);
        setSchools(Array.isArray(s) ? s : []);
        // Trigger a small celebration if any achievement unlocked
        if ((p?.achievements || []).some((a: any) => a.unlocked)) {
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const togglePrivacy = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch('/api/student/profile/privacy', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ allowExternalView: !profile.allowExternalView }) });
      const p = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setProfile(p);
    } finally {
      setSaving(false);
    }
  };

  const schoolName = useMemo(() => {
    if (!me?.schoolId) return '';
    const f = schools.find(s => s.id === me.schoolId);
    return f?.name || me.schoolId || '';
  }, [me?.schoolId, schools]);

  const stageEmoji = profile?.ecoTreeStage === 'Big Tree' ? '🌳' : profile?.ecoTreeStage === 'Small Tree' ? '🌲' : '🌱';
  const ecoPoints = Number(profile?.ecoPoints || 0);
  const progress = (() => {
    if (ecoPoints >= 500) return 100;
    const prev = ecoPoints >= 100 ? 100 : 0;
    const next = ecoPoints >= 100 ? 500 : 100;
    return Math.max(0, Math.min(100, Math.round(((ecoPoints - prev) / (next - prev)) * 100)));
  })();

  return (
    <div className="space-y-6">
      {!profile ? (
        <div className="text-earth-muted">Loading…</div>
      ) : (
        <>
          {/* Header card */}
          <div className="relative p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] flex items-center gap-4 overflow-hidden">
            {me?.photoDataUrl ? (
              <img src={me.photoDataUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[var(--earth-border)] flex items-center justify-center text-2xl">👩‍🎓</div>
            )}
            <div className="flex-1">
              <div className="text-lg font-semibold">{me?.name || 'Student'} <span className="text-earth-muted font-normal">(@{username})</span></div>
              <div className="text-sm text-earth-muted">{schoolName || '—'}</div>
              {/* Profile completion */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-earth-muted mb-1">
                  <span>Profile {Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))}% complete</span>
                  <span>Next goal: {ecoPoints >= 500 ? 'Maxed!' : ecoPoints >= 100 ? `${500 - ecoPoints} pts → Big Tree` : `${100 - ecoPoints} pts → Small Tree`}</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))} />
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200 text-xs">Eco-Points: {ecoPoints}</span>
              <span className="px-3 py-1 rounded-full bg-indigo-700/30 border border-indigo-600 text-indigo-200 text-xs">Global #{profile.ranks?.global || '-'}</span>
              <span className="px-3 py-1 rounded-full bg-amber-700/30 border border-amber-600 text-amber-200 text-xs">School #{profile.ranks?.school || '-'}</span>
            </div>
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🎉</div>
            )}
          </div>

          {/* Main grid: left content + right sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              {/* Eco-Tree progress */}
              <Section title="My Eco-Tree">
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-pulse" aria-hidden>{stageEmoji}</div>
                  <div className="flex-1">
                    <div className="text-sm text-earth-muted mb-1">{profile.ecoTreeStage}</div>
                    <div className="h-3 bg-[var(--earth-border)] rounded-full overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-green-500 to-green-300" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-xs text-earth-muted mt-1">{ecoPoints >= 500 ? 'Max stage' : ecoPoints >= 100 ? `${ecoPoints - 100} / 400 to Big Tree` : `${ecoPoints} / 100 to Small Tree`}</div>
                  </div>
                </div>
              </Section>

              {/* Achievements */}
              <Section title="Achievements">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {profile.achievements?.map((a: any) => {
                    const emoji = a.key === 'first_task' ? '🥇' : a.key === 'top10_school' ? '🏅' : '🧠';
                    return (
                      <div key={a.key} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${a.unlocked ? 'bg-emerald-600/40' : 'bg-[var(--earth-border)]'}`}>{emoji}</div>
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-earth-muted">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Timeline */}
              <Section title="Contribution Timeline">
                <div className="space-y-3">
                  {(!profile.timeline || profile.timeline.length === 0) && (
                    <p className="text-earth-muted text-sm">No contributions yet. Complete a task to begin your journey.</p>
                  )}
                  {profile.timeline?.map((t: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-2 top-2 h-full w-px bg-[var(--earth-border)]" />
                      <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-emerald-500" />
                      <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                        <div className="text-xs text-earth-muted">{new Date(t.when).toLocaleString()}</div>
                        <div className="font-medium">
                          {t.kind === 'quiz' ? `Quiz attempted: ${t.title}` : t.kind === 'game' ? `Played game: ${t.title}` : t.title}
                        </div>
                        {t.photoDataUrl && <img src={t.photoDataUrl} alt="Proof" className="mt-2 h-24 w-24 object-cover rounded" />}
                        {typeof t.scorePercent === 'number' && (
                          <div className="text-xs text-amber-200 mt-1">Score: {t.scorePercent}%</div>
                        )}
                        {typeof t.points === 'number' && t.kind !== 'game' && (
                          <div className="text-xs text-emerald-200 mt-1">Points: {t.points}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Tracker */}
              <Section title="Streak Tracker">
                <WeeklyStreak days={profile.week?.days || []} start={profile.week?.start} />
              </Section>

              {/* Friends/Schoolmates Leaderboard */}
              <Section title="Friends / Schoolmates Leaderboard">
                <div>
                  <div className="text-sm">You're <span className="font-semibold">#{profile.ranks?.school || '-'}</span> in your school</div>
                  {profile.leaderboardNext ? (
                    <div className="text-xs text-earth-muted mt-1">Next to beat <span className="text-white">@{profile.leaderboardNext.username}</span> with {profile.leaderboardNext.points} pts</div>
                  ) : (
                    <div className="text-xs text-earth-muted mt-1">You're at the top! 🎉</div>
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* Privacy */}
          <Section title="Privacy">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Allow other schools to view my profile</div>
                <div className="text-xs text-earth-muted">Toggle visibility outside your school.</div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-emerald-500" checked={!!profile.allowExternalView} onChange={togglePrivacy} disabled={saving} />
                <span className="text-sm">{profile.allowExternalView ? 'On' : 'Off'}</span>
              </label>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function StudentProfileEditor({ onClose }: { onClose: () => void }) {
  const { username } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const [p, s] = await Promise.all([
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setData(p || {});
        setSchools(Array.isArray(s) ? s : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [username]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((d:any) => ({ ...d, photoDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({
        name: data.name || '',
        email: data.email || '',
        schoolId: data.schoolId || '',
        photoDataUrl: data.photoDataUrl || '',
        studentId: data.studentId || '',
        rollNumber: data.rollNumber || '',
        className: data.className || '',
        section: data.section || '',
      }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to save profile');
        return;
      }
      const p = await res.json();
      setData(p);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Profile">
      {loading ? (
        <div className="text-earth-muted">Loading…</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              {data.photoDataUrl ? (
                <img src={data.photoDataUrl} alt="Profile" className="h-20 w-20 object-cover rounded-full" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[var(--earth-border)] flex items-center justify-center text-earth-muted">No Photo</div>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={onPhoto} className="text-[var(--foreground)] bg-white rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Username</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={`@${data.username || username}`}
                readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Role</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.role || 'student'} readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Full Name</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Email</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">School</span>
              <select className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.schoolId || ''} onChange={e => setData({ ...data, schoolId: e.target.value })}>
                <option value="">Select school…</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Student ID</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.studentId || ''} onChange={e => setData({ ...data, studentId: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Roll Number</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.rollNumber || ''} onChange={e => setData({ ...data, rollNumber: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Class</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.className || ''} onChange={e => setData({ ...data, className: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Section</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.section || ''} onChange={e => setData({ ...data, section: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
          <p className="text-xs text-earth-muted">Update your details. Changes will reflect in your profile header and timeline context.</p>
        </div>
      )}
    </Section>
  );
}

function WeeklyStreak({ days, start }: { days: boolean[]; start?: number }) {
  const labels = ['M','T','W','T','F','S','S'];
  return (
    <div>
      <div className="flex gap-2">
        {labels.map((l, i) => (
          <div key={i} className={`flex flex-col items-center text-xs ${days[i] ? 'text-white' : 'text-earth-muted'}`}>
            <div className={`h-6 w-6 rounded-full border flex items-center justify-center mb-1 ${days[i] ? 'bg-emerald-500/60 border-emerald-400' : 'border-[var(--earth-border)]'}`}>{l}</div>
          </div>
        ))}
      </div>
      {start && <div className="text-[10px] text-earth-muted mt-2">Week of {new Date(start).toLocaleDateString()}</div>}
    </div>
  );
}

function NotificationsBell() {
  const { username } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prof = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        setUnread(Number(prof?.unreadNotifications || 0));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [username]);

  const load = async () => {
    try {
      const list = await fetch('/api/notifications', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setItems([]);
    }
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const next = !open;
    setOpen(next);
    
    if (next && buttonRef.current) {
      // Calculate position relative to button
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
      
      await load();
      try {
        await fetch('/api/notifications/read', { method: 'POST', headers: { 'X-Username': username || '' } });
        setUnread(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  };

  const closeNotifications = () => {
    setOpen(false);
  };

  const notificationPanel = open && (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={closeNotifications}
        aria-hidden="true"
      />
      
      {/* Notification Panel */}
      <div 
        className="fixed w-80 max-h-96 overflow-hidden rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl z-[9999]"
        style={{
          top: position.top,
          right: position.right
        }}
      >
        <div className="p-3 text-sm font-medium text-white/90 border-b border-white/20">
          Notifications
          {unread > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unread} new</span>}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-white/60 text-sm">📭</div>
              <div className="text-white/70 text-sm mt-1">No notifications yet</div>
              <div className="text-white/50 text-xs mt-1">We'll notify you about important updates</div>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {items.map((n, i) => (
                <div key={i} className="p-3 hover:bg-white/10 transition-colors">
                  <div className="text-sm text-white/90">{n.message}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-2 border-t border-white/20">
            <button 
              onClick={closeNotifications}
              className="w-full text-xs text-white/70 hover:text-white/90 py-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggle} 
        className="relative h-9 w-9 grid place-items-center rounded-md border border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
        aria-label="Toggle notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] grid place-items-center font-medium">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      
      {/* Render notification panel in portal */}
      {typeof window !== 'undefined' && notificationPanel && createPortal(notificationPanel, document.body)}
    </>
  );
}
