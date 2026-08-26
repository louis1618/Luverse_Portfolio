import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { supabaseServer } from '@/utils/posts';

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = await createClient();
    const { data: { session } } = await supabaseAuth.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('permission_level')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.permission_level < 30) {
      return NextResponse.json({ error: '관리자 권한이 부족합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const postType = searchParams.get('type');

    let query = supabaseServer
      .schema('portfolio')
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (postType) {
      query = query.eq('type', postType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAuth = await createClient();
    const { data: { session } } = await supabaseAuth.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('permission_level')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.permission_level < 30) {
      return NextResponse.json({ error: '관리자 권한이 부족합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const postType = searchParams.get('type') || 'blog';

    if (!slug) {
      return NextResponse.json({ error: '삭제할 포스트 slug가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .schema('portfolio')
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate paths
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/blog');
      revalidatePath('/work');
      revalidatePath(`/${postType}/${slug}`);
    } catch (e) {
      console.warn('Revalidate error:', e);
    }

    return NextResponse.json({ success: true, message: '포스트가 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
