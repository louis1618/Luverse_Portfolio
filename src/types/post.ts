export type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  linkedIn?: string;
};

export type PostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string[];
  team: TeamMember[];
  link?: string;
};

export type PostItem = {
  id: string;
  type: 'blog' | 'work';
  slug: string;
  metadata: PostMetadata;
  content: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
