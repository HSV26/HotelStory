import React from 'react';
import {
  CalendarClock,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';

interface FollowUpTypeIconProps {
  type: string | null | undefined;
  className?: string;
}

export const FollowUpTypeIcon: React.FC<FollowUpTypeIconProps> = ({
  type,
  className = 'w-3.5 h-3.5',
}) => {
  switch (type) {
    case 'Call':
      return <Phone className={className} />;
    case 'WhatsApp':
      return <MessageCircle className={className} />;
    case 'Meeting':
      return <Users className={className} />;
    case 'Email':
      return <Mail className={className} />;
    case 'Note':
      return <FileText className={className} />;
    case 'Status Change':
      return <RefreshCw className={className} />;
    case 'Created':
      return <Sparkles className={className} />;
    default:
      return <CalendarClock className={className} />;
  }
};
