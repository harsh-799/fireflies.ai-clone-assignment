export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  name: string;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker_name: string;
  timestamp_seconds: number;
  text: string;
  is_highlighted: boolean;
  comment: string | null;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview_text: string;
  key_topics: string[];
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee: string;
  is_completed: boolean;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  duration: number; // in seconds
  owner_id: number;
  created_at: string;
  updated_at: string;
  participants?: Participant[];
}

export interface MeetingDetail extends Meeting {
  participants: Participant[];
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  action_items: ActionItem[];
}
