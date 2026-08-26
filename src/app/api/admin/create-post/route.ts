import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { supabaseServer } from '@/utils/posts';

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createClient();
    const { data: { session } } = await supabaseAuth.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 접근입니다. 관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('permission_level')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.permission_level < 30) {
      return NextResponse.json({ error: '관리자 권한이 부족합니다. (permission_level < 30)' }, { status: 403 });
    }

    const body = await request.json();
    const {
      postType = 'blog',
      title,
      summary = '',
      slug,
      link = '',
      coverImage = null,
      images = [],
      team = null,
      content = '',
      publishedAt = getCurrentDate(),
      isPublished = true,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: '제목과 슬러그는 필수입니다.' }, { status: 400 });
    }

    const defaultTeam = [
      {
        name: 'Luverse',
        role: postType === 'work' ? 'Software Engineer' : 'Developer & Creator',
        avatar: '/images/avatar.png',
      },
    ];

    // Upsert into Supabase portfolio schema using upsert_post RPC
    const { data, error } = await supabaseServer
      .schema('portfolio')
      .rpc('upsert_post', {
        p_type: postType,
        p_slug: slug.trim(),
        p_title: title.trim(),
        p_summary: summary.trim(),
        p_content: content.trim(),
        p_cover_image: coverImage || (images && images.length > 0 ? images[0] : null),
        p_images: images || [],
        p_team: team || defaultTeam,
        p_link: link || null,
        p_tag: [],
        p_published_at: publishedAt || getCurrentDate(),
        p_is_published: isPublished !== false,
      });

    if (error) {
      console.error('Error saving post to Supabase:', error);
      return NextResponse.json(
        { error: `포스트 저장 실패: ${error.message}` },
        { status: 500 }
      );
    }

    // On-demand ISR revalidation for instant SSR updates
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/blog');
      revalidatePath('/work');
      revalidatePath(`/blog/${slug}`);
      revalidatePath(`/work/${slug}`);
    } catch (revalError) {
      console.warn('Revalidation error:', revalError);
    }

    return NextResponse.json({
      success: true,
      slug,
      url: `/${postType}/${slug}`,
      data,
      message: 'Supabase DB에 포스트가 성공적으로 저장되었습니다. (즉시 반영 완료)',
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
