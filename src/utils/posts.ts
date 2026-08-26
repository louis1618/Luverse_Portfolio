import { createClient } from '@supabase/supabase-js';
import { PostItem, PostMetadata } from '@/types/post';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgnamudeficjossbqxyq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmFtdWRlZmljam9zc2JxeHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDM1NzgsImV4cCI6MjA3NzgxOTU3OH0.saikzgwSC6LlvWv4hiT3ePpLTcsznn91qrHxj0Ld2s0';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'portfolio',
  },
});

function formatPostRow(row: any): PostItem {
  const metadata: PostMetadata = {
    title: row.title || '',
    publishedAt: row.published_at || '',
    summary: row.summary || '',
    image: row.cover_image || (Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : ''),
    images: Array.isArray(row.images) ? row.images : (row.cover_image ? [row.cover_image] : []),
    tag: Array.isArray(row.tag) ? row.tag : [],
    team: Array.isArray(row.team) && row.team.length > 0 ? row.team : [
      { name: 'Luverse', role: row.type === 'work' ? 'Software Engineer' : 'Developer & Creator', avatar: '/images/avatar.png' }
    ],
    link: row.link || '',
  };

  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    metadata,
    content: row.content || '',
    published_at: row.published_at,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getPosts(type?: 'blog' | 'work'): Promise<PostItem[]> {
  try {
    let query = supabaseServer
      .schema('portfolio')
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts from Supabase:', error);
      return [];
    }

    return (data || []).map(formatPostRow);
  } catch (err) {
    console.error('Failed to getPosts:', err);
    return [];
  }
}

export async function getPostBySlug(type: 'blog' | 'work', slug: string): Promise<PostItem | null> {
  try {
    const { data, error } = await supabaseServer
      .schema('portfolio')
      .from('posts')
      .select('*')
      .eq('type', type)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching post ${type}/${slug}:`, error);
      return null;
    }

    if (!data) return null;
    return formatPostRow(data);
  } catch (err) {
    console.error(`Failed to getPostBySlug ${type}/${slug}:`, err);
    return null;
  }
}
