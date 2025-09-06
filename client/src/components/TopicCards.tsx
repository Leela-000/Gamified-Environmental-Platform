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
  }
];

export function TopicCards() {
  const handleTopicClick = (topicId: string) => {
    console.log(`Navigate to topic: ${topicId}`);
    // TODO: Implement navigation to topic page
  };

  return (
    <div className="space-y-4">
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
  );
}
