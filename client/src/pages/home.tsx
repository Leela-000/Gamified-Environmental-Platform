import { Globe3D } from "@/components/Globe3D";
import { TopicCards } from "@/components/TopicCards";
import { SocialSidebar } from "@/components/SocialSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Play, Menu } from "lucide-react";

export default function Home() {
  const handleWatchVideo = () => {
    // TODO: Implement video player or navigation
    console.log("Watch video clicked");
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Left hamburger launcher for the slide-out panel */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Open integrations panel"
                  className="w-9 h-9 bg-earth-orange hover:bg-earth-orange-hover rounded-lg flex items-center justify-center shadow-orange transition-colors"
                >
                  <Menu className="h-5 w-5 text-white" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="bg-[var(--earth-card)] border-[var(--earth-border)] text-white">
                <SheetHeader>
                  <SheetTitle>Side Panel</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <p className="text-earth-muted text-sm">
                    This panel will host elements from the other website. Tell me what to add and where.
                  </p>
                  <div className="grid gap-3">
                    <Button className="bg-earth-orange hover:bg-earth-orange-hover justify-start">Sample action</Button>
                    <Button variant="secondary" className="justify-start">Placeholder item</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="flex space-x-6 md:space-x-8">
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
      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-between pl-20 md:pl-24 lg:pl-28 pr-4 md:pr-8 lg:pr-12 xl:pr-16 py-20">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6 text-center lg:text-left pl-12 lg:pl-0 relative z-30">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Save the<br />
                <span className="text-earth-cyan">earth</span>
              </h1>
              <p className="text-earth-muted text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
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
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center order-first lg:order-none relative z-0">
            <div className="globe-container floating lg:-ml-8 xl:-ml-14 2xl:-ml-20 lg:-mt-4 xl:-mt-6 relative z-0">
              <Globe3D />
            </div>
          </div>

          {/* Topic Cards */}
          <div className="lg:col-span-3 xl:col-span-3 w-full max-w-[420px] xl:max-w-[470px] ml-auto lg:mr-2 xl:mr-4 relative z-30">
            <TopicCards />
          </div>
          
        </div>
      </main>
    </div>
  );
}
