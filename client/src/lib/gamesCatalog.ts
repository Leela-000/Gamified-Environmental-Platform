export type GameDef = {
  id: string;
  name: string;
  category: 'recycling' | 'climate' | 'habits' | 'wildlife' | 'fun';
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  icon?: string;
};

export const GAMES: GameDef[] = [
  // Recycling
  { id: 'waste-segregation', name: 'Waste Segregation', category: 'recycling', description: 'Drag items into the correct bins.', difficulty: 'Easy', points: 5, icon: '♻️' },
  { id: 'recycling-factory', name: 'Recycling Factory Puzzle', category: 'recycling', description: 'Reorder the factory line correctly.', difficulty: 'Medium', points: 20, icon: '🏭' },
  { id: 'ocean-cleanup', name: 'Ocean Cleanup', category: 'recycling', description: 'Collect plastic, avoid fish.', difficulty: 'Easy', points: 10, icon: '🚤' },
  // Climate & Pollution
  { id: 'air-catcher', name: 'Air Pollution Catcher', category: 'climate', description: 'Catch clean air, avoid smoke.', difficulty: 'Easy', points: 10, icon: '🌬️' },
  { id: 'carbon-choices', name: 'Carbon Footprint Choices', category: 'climate', description: 'Pick eco-friendly options.', difficulty: 'Medium', points: 10, icon: '🌍' },
  { id: 'flood-defender', name: 'Flood Defender', category: 'climate', description: 'Protect the city for 3 rounds.', difficulty: 'Hard', points: 30, icon: '�' },
  // Daily Habits
  { id: 'eco-home', name: 'Eco-Home Challenge', category: 'habits', description: 'Fix bad habits in a room.', difficulty: 'Easy', points: 8, icon: '🏡' },
  { id: 'eco-shopping', name: 'Eco-Shopping', category: 'habits', description: 'Choose sustainable products.', difficulty: 'Medium', points: 15, icon: '🛒' },
  { id: 'energy-quiz', name: 'Energy Saver Quiz Race', category: 'habits', description: 'Timed energy-saving questions.', difficulty: 'Medium', points: 15, icon: '⚡' },
  // Plant & Wildlife
  { id: 'tree-planting', name: 'Tree Planting Simulator', category: 'wildlife', description: 'Grow a tree step by step.', difficulty: 'Easy', points: 20, icon: '🌱' },
  { id: 'wildlife-rescue', name: 'Wildlife Rescue Adventure', category: 'wildlife', description: 'Guide animals to safety.', difficulty: 'Medium', points: 15, icon: '🦊' },
  { id: 'pollinator-garden', name: 'Pollinator Garden Builder', category: 'wildlife', description: 'Build a bee-friendly garden.', difficulty: 'Medium', points: 20, icon: '🐝' },
  // Fun / Mixed
  { id: 'eco-crossword', name: 'Eco-Crossword', category: 'fun', description: 'Solve sustainability words.', difficulty: 'Medium', points: 15, icon: '🧩' },
  { id: 'trivia-wheel', name: 'Sustainability Trivia Wheel', category: 'fun', description: 'Spin and answer!', difficulty: 'Hard', points: 20, icon: '🎡' },
  { id: 'eco-runner', name: 'Eco-Runner', category: 'fun', description: 'Endless runner: collect eco-items.', difficulty: 'Medium', points: 10, icon: '🏃‍♂️' },
];

export function getGameById(id: string) {
  return GAMES.find(g => g.id === id);
}
