import { useState, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopicCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  alt: string;
}

const topics: TopicCard[] = [
  {
    id: 'ocean',
    title: 'Save the',
    subtitle: 'Ocean',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Ocean conservation - coral reef ecosystem'
  },
  {
    id: 'climate',
    title: 'Climate',
    subtitle: 'Change',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Climate change effects - extreme weather patterns'
  },
  {
    id: 'arctic',
    title: 'Arctic is',
    subtitle: 'Calling',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Arctic ice conservation - polar ice caps and wildlife'
  },
  {
    id: 'water',
    title: 'Quench the',
    subtitle: 'Thirsty',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Water conservation - clean water access and preservation'
  },
  {
    id: 'forest',
    title: 'Save the',
    subtitle: 'Forests',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Forest conservation - protecting trees and biodiversity'
  },
  {
    id: 'wildlife',
    title: 'Protect',
    subtitle: 'Wildlife',
    imageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Wildlife protection - endangered species conservation'
  },
  {
    id: 'renewable',
    title: 'Renewable',
    subtitle: 'Energy',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Renewable energy - solar and wind power solutions'
  },
  {
    id: 'pollution',
    title: 'Stop',
    subtitle: 'Pollution',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
    alt: 'Pollution reduction - clean air and water initiatives'
  }
];

export function TopicCards() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const handleTopicClick = (topicId: string) => {
    console.log(`Navigate to topic: ${topicId}`);
    // TODO: Implement navigation to topic page
  };

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -120, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 120, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
    }
  };

  return (
    <div className="relative">
      {/* Scroll Up Button */}
      <Button
        onClick={scrollUp}
        disabled={!canScrollUp}
        className="absolute -top-2 right-4 z-10 w-8 h-8 p-0 bg-earth-card hover:bg-earth-cyan border border-earth-border rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-scroll-up"
      >
        <ChevronUp className="h-4 w-4 text-white" />
      </Button>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="space-y-4 max-h-[480px] overflow-y-auto scrollbar-hide pr-2"
        data-testid="scroll-container-topics"
      >
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => handleTopicClick(topic.id)}
            className="topic-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:translate-x-[-8px] hover:scale-[1.02]"
            data-testid={`card-topic-${topic.id}`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={topic.imageUrl} 
                  alt={topic.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {topic.title}<br />
                  {topic.subtitle}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Down Button */}
      <Button
        onClick={scrollDown}
        disabled={!canScrollDown}
        className="absolute -bottom-2 right-4 z-10 w-8 h-8 p-0 bg-earth-card hover:bg-earth-cyan border border-earth-border rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-scroll-down"
      >
        <ChevronDown className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}
