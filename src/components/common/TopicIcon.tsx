import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface TopicIconProps {
  iconName: string;
  className?: string;
}

export default function TopicIcon({ iconName, className = 'h-6 w-6' }: TopicIconProps) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName] || Icons.BookOpen;
  
  return <IconComponent className={className} />;
}
