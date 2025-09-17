import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, GamepadIcon, BookOpen, Target, Award, CheckCircle2, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface PublicProfileData {
  username: string;
  achievements: number;
  gamesCompleted: number;
  tasksCompleted: number;
  quizzesCompleted: number;
  assignmentsSubmitted: number;
  videosWatched: number;
  recentAchievements: Array<{
    title: string;
    description: string;
    icon: string;
    time: string;
  }>;
  activityStreak: number;
  monthlyProgress: {
    tasks: { completed: number; total: number; };
    games: { completed: number; total: number; };
    quizzes: { completed: number; total: number; };
    assignments: { completed: number; total: number; };
    videos: { completed: number; total: number; };
  };
}

export default function PublicProfilePage() {
  const [, params] = useRoute("/profile/:profileId");
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("PublicProfilePage - params:", params);

  useEffect(() => {
    console.log("PublicProfilePage useEffect - params:", params);
    if (params?.profileId) {
      try {
        // Decode the profile ID to get username
        const username = atob(params.profileId);
        console.log("Decoded username:", username);
        
        // Mock data - in a real app this would come from an API
        const mockData: PublicProfileData = {
          username: username,
          achievements: 12,
          gamesCompleted: 8,
          tasksCompleted: 15,
          quizzesCompleted: 6,
          assignmentsSubmitted: 4,
          videosWatched: 12,
          recentAchievements: [
            { title: "Eco Warrior", description: "Completed 10 environmental tasks", icon: "🌱", time: "2 days ago" },
            { title: "Quiz Master", description: "Perfect score on Climate Change quiz", icon: "🧠", time: "3 days ago" },
            { title: "Assignment Ace", description: "Submitted Water Conservation project", icon: "📋", time: "5 days ago" },
            { title: "Waste Master", description: "Perfect score in waste segregation game", icon: "♻️", time: "1 week ago" },
            { title: "Energy Saver", description: "Completed energy conservation quiz", icon: "⚡", time: "2 weeks ago" },
          ],
          activityStreak: 7,
          monthlyProgress: {
            tasks: { completed: 15, total: 20 },
            games: { completed: 8, total: 12 },
            quizzes: { completed: 6, total: 10 },
            assignments: { completed: 4, total: 6 },
            videos: { completed: 12, total: 18 }
          }
        };
        
        setProfileData(mockData);
        setLoading(false);
      } catch (err) {
        setError("Invalid profile ID");
        setLoading(false);
      }
    }
  }, [params?.profileId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div 
        className="min-h-screen text-white p-6 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/api/image/nature-319.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-white/70 mb-6">{error || "The requested profile could not be found."}</p>
          <Link href="/">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white p-6"
      style={{
        backgroundImage: 'url(/api/image/nature-319.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-300/30">
              Public Profile
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-white/90 mb-2">{profileData.username}'s Profile</h1>
          <p className="text-white/70">Environmental Learning Progress</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Progress Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-6">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{profileData.achievements}</p>
                <p className="text-green-300 text-sm">Achievements Earned</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-6">
                <GamepadIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{profileData.gamesCompleted}</p>
                <p className="text-blue-300 text-sm">Games Completed</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-6">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{profileData.tasksCompleted}</p>
                <p className="text-purple-300 text-sm">Tasks Completed</p>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/30 rounded-xl p-6">
                <svg className="w-8 h-8 text-orange-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-2xl font-bold text-white">{profileData.quizzesCompleted}</p>
                <p className="text-orange-300 text-sm">Quizzes Completed</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/30 rounded-xl p-6">
                <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-2xl font-bold text-white">{profileData.assignmentsSubmitted}</p>
                <p className="text-indigo-300 text-sm">Assignments Submitted</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-400/30 rounded-xl p-6">
                <svg className="w-8 h-8 text-pink-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
                <p className="text-2xl font-bold text-white">{profileData.videosWatched}</p>
                <p className="text-pink-300 text-sm">Videos Watched</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Recent Achievements
          </h3>
          
          <div className="space-y-3">
            {profileData.recentAchievements.map((achievement, index) => (
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
              Monthly Goals
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Tasks</span>
                  <span className="text-white">{profileData.monthlyProgress.tasks.completed}/{profileData.monthlyProgress.tasks.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                    style={{width: `${(profileData.monthlyProgress.tasks.completed / profileData.monthlyProgress.tasks.total) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Games</span>
                  <span className="text-white">{profileData.monthlyProgress.games.completed}/{profileData.monthlyProgress.games.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
                    style={{width: `${(profileData.monthlyProgress.games.completed / profileData.monthlyProgress.games.total) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Quizzes</span>
                  <span className="text-white">{profileData.monthlyProgress.quizzes.completed}/{profileData.monthlyProgress.quizzes.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" 
                    style={{width: `${(profileData.monthlyProgress.quizzes.completed / profileData.monthlyProgress.quizzes.total) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Assignments</span>
                  <span className="text-white">{profileData.monthlyProgress.assignments.completed}/{profileData.monthlyProgress.assignments.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                    style={{width: `${(profileData.monthlyProgress.assignments.completed / profileData.monthlyProgress.assignments.total) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Videos</span>
                  <span className="text-white">{profileData.monthlyProgress.videos.completed}/{profileData.monthlyProgress.videos.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full" 
                    style={{width: `${(profileData.monthlyProgress.videos.completed / profileData.monthlyProgress.videos.total) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
            <h3 className="text-xl font-bold text-white/90 mb-4">Activity Streak</h3>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-white mb-2">{profileData.activityStreak}</div>
              <p className="text-white/70">Days Active</p>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className={`h-8 rounded ${
                    index < profileData.activityStreak ? 'bg-green-500/70' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-center text-white/60 text-sm mt-3">
              {profileData.activityStreak >= 7 ? "Amazing streak! 🔥" : "Keep going! 💪"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}