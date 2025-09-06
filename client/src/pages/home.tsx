import { Globe3D } from "@/components/Globe3D";
import { TopicCards } from "@/components/TopicCards";
import { SocialSidebar } from "@/components/SocialSidebar";
import { Button } from "@/components/ui/button";
import { Play, Check } from "lucide-react";

export default function Home() {
  const handleWatchVideo = () => {
    // TODO: Implement video player or navigation
    console.log("Watch video clicked");
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-earth-orange rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
          <nav className="flex space-x-8">
            <a 
              href="#" 
              className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium"
              data-testid="link-about"
            >
              About
            </a>
            <a 
              href="#" 
              className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium"
              data-testid="link-contact"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Social Sidebar */}
      <SocialSidebar />

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-between px-20 py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 items-center">
          
          {/* Hero Text */}
          <div className="col-span-4 space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white leading-tight">
                Save the<br />
                <span className="text-earth-cyan">earth</span>
              </h1>
              <p className="text-earth-muted text-lg leading-relaxed max-w-md">
                Join the fight in a race to protect and preserve our planet. From global warming to the protection of endangered wildlife, we cover all topics.
              </p>
            </div>
            <Button 
              onClick={handleWatchVideo}
              className="bg-earth-orange hover:bg-earth-orange-hover px-8 py-4 text-white font-semibold rounded-lg flex items-center space-x-3 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-orange"
              data-testid="button-watch-video"
            >
              <Play className="h-4 w-4" />
              <span>WATCH VIDEO</span>
            </Button>
          </div>

          {/* 3D Globe */}
          <div className="col-span-4 flex justify-center">
            <div className="globe-container floating">
              <Globe3D />
            </div>
          </div>

          {/* Topic Cards */}
          <div className="col-span-4">
            <TopicCards />
          </div>
          
        </div>
      </main>
    </div>
  );
}
