import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseServer } from '@/utils/posts';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postType = (formData.get('postType') as string) || 'blog';

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const extension = file.name.split('.').pop() || 'png';
    const filePath = `${postType}/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage 'portfolio' bucket
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('portfolio')
      .upload(filePath, buffer, {
        contentType: file.type || `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: `이미지 업로드 실패: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from('portfolio')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      previewUrl: publicUrl,
      message: 'Supabase Storage에 이미지가 성공적으로 업로드되었습니다.',
    });
  } catch (error: any) {
    console.error('Error in upload-image API:', error);
    return NextResponse.json(
      { error: error.message || '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
