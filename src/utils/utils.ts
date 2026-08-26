export * from './posts';
export type { TeamMember, PostMetadata, PostItem } from '@/types/post';

import { getPosts as getPostsFromSupabase, getPostBySlug as getPostBySlugFromSupabase } from './posts';

/**
 * Legacy compatibility wrapper for getPosts
 */
export async function getPosts(customPathOrType?: string[] | 'blog' | 'work') {
  let type: 'blog' | 'work' | undefined = undefined;

  if (Array.isArray(customPathOrType)) {
    if (customPathOrType.includes('work')) {
      type = 'work';
    } else if (customPathOrType.includes('blog')) {
      type = 'blog';
    }
  } else if (customPathOrType === 'blog' || customPathOrType === 'work') {
    type = customPathOrType;
  }

  return getPostsFromSupabase(type);
}
