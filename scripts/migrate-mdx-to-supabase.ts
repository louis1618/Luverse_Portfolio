import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgnamudeficjossbqxyq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmFtdWRlZmljam9zc2JxeHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDM1NzgsImV4cCI6MjA3NzgxOTU3OH0.saikzgwSC6LlvWv4hiT3ePpLTcsznn91qrHxj0Ld2s0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface MdxFilePost {
  type: 'blog' | 'work';
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image?: string | null;
  images?: string[];
  team?: any[];
  link?: string | null;
  tag?: string[];
  published_at: string;
}

function parseMdxFiles(dir: string, type: 'blog' | 'work'): MdxFilePost[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  
  return files.map(file => {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = path.basename(file, '.mdx');

    return {
      type,
      slug,
      title: data.title || slug,
      summary: data.summary || '',
      content: content.trim(),
      cover_image: data.image || (data.images && data.images.length > 0 ? data.images[0] : null),
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
      team: data.team || [{ name: 'Luverse', role: type === 'work' ? 'Software Engineer' : 'Developer & Creator', avatar: '/images/avatar.png' }],
      link: data.link || null,
      tag: Array.isArray(data.tag) ? data.tag : (data.tag ? [data.tag] : []),
      published_at: data.publishedAt || new Date().toISOString().split('T')[0],
    };
  });
}

async function migrate() {
  console.log('🚀 Starting MDX migration to Supabase (schema: portfolio)...');

  const blogDir = path.join(process.cwd(), 'src', 'app', 'blog', 'posts');
  const workDir = path.join(process.cwd(), 'src', 'app', 'work', 'projects');

  const blogPosts = parseMdxFiles(blogDir, 'blog');
  const workProjects = parseMdxFiles(workDir, 'work');

  const allItems = [...blogPosts, ...workProjects];
  console.log(`Found ${blogPosts.length} blog posts and ${workProjects.length} work projects.`);

  for (const item of allItems) {
    console.log(`Migrating [${item.type}] ${item.slug}: "${item.title}"...`);
    
    const { data, error } = await supabase
      .schema('portfolio')
      .rpc('upsert_post', {
        p_type: item.type,
        p_slug: item.slug,
        p_title: item.title,
        p_summary: item.summary,
        p_content: item.content,
        p_cover_image: item.cover_image || null,
        p_images: item.images || [],
        p_team: item.team || [],
        p_link: item.link || null,
        p_tag: item.tag || [],
        p_published_at: item.published_at,
        p_is_published: true,
      });

    if (error) {
      console.error(`❌ Failed to migrate ${item.slug}:`, error);
    } else {
      console.log(`✅ Successfully migrated ${item.slug}`);
    }
  }

  console.log('🎉 Migration completed!');
}

migrate().catch(console.error);
