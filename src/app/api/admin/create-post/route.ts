import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function githubFetch(url: string, token: string, options: RequestInit = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`GitHub API Error (${res.status}): ${error.message}`);
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 접근입니다. 관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('permission_level')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.permission_level < 30) {
      return NextResponse.json({ error: '관리자 권한이 부족합니다. (permission_level < 30)' }, { status: 403 });
    }

    const body = await request.json();
    const { postType, title, summary, slug, link, images, content, files } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: '제목과 슬러그는 필수입니다.' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: 'GitHub 설정이 필요합니다. 환경 변수를 확인하세요.' }, { status: 500 });
    }

    const folder = postType === 'work' ? 'projects' : 'posts';
    const filePath = `src/app/${postType}/${folder}/${slug}.mdx`;

    // 1. Build MDX Content
    let mdxContent = `---
title: "${title}"
publishedAt: "${getCurrentDate()}"
summary: "${summary || '포스트 요약을 입력하세요.'}"`;

    if (images && images.length > 0 && postType === 'work') {
      mdxContent += `\nimages:`;
      images.forEach((img: string) => {
        if (img) mdxContent += `\n  - "${img}"`;
      });
    }

    mdxContent += `
team:
  - name: "Luverse"
    role: "${postType === 'work' ? 'Software Engineer' : 'Developer & Creator'}"
    avatar: "/images/avatar.png"`;

    if (link) {
      mdxContent += `\nlink: "${link}"`;
    }

    mdxContent += `\n---\n\n${content || '## 소개\n\n여기에 내용을 작성하세요.'}\n`;

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // 2. Check if file already exists
    try {
      await githubFetch(`${baseUrl}/contents/${filePath}`, token);
      return NextResponse.json({ error: '같은 슬러그의 포스트가 이미 존재합니다.' }, { status: 400 });
    } catch (e: any) {
      if (!e.message.includes('404')) {
        throw e;
      }
    }

    // 3. Get latest commit & tree
    const refRes = await githubFetch(`${baseUrl}/git/refs/heads/main`, token).catch(() => 
      githubFetch(`${baseUrl}/git/refs/heads/master`, token)
    );
    const commitSha = refRes.object.sha;
    
    const commitRes = await githubFetch(`${baseUrl}/git/commits/${commitSha}`, token);
    const baseTreeSha = commitRes.tree.sha;

    // 4. Create blobs for all files
    const treeItems: Array<{ path: string, mode: string, type: string, sha: string }> = [];

    // Markdown blob
    const mdxBlob = await githubFetch(`${baseUrl}/git/blobs`, token, {
      method: 'POST',
      body: JSON.stringify({ content: mdxContent, encoding: 'utf-8' })
    });
    treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: mdxBlob.sha });

    // Attachment blobs
    if (files && Array.isArray(files)) {
      for (const file of files) {
        // Remove leading slash and prefix with public/ for static assets
        const cleanPath = file.githubPath.replace(/^\//, ''); // e.g. images/blog/name.png
        const fullPath = `public/${cleanPath}`;
        
        const fileBlob = await githubFetch(`${baseUrl}/git/blobs`, token, {
          method: 'POST',
          body: JSON.stringify({ content: file.base64Content, encoding: 'base64' })
        });
        treeItems.push({ path: fullPath, mode: '100644', type: 'blob', sha: fileBlob.sha });
      }
    }

    // 5. Create new tree
    const newTree = await githubFetch(`${baseUrl}/git/trees`, token, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
    });

    // 6. Create new commit
    const newCommit = await githubFetch(`${baseUrl}/git/commits`, token, {
      method: 'POST',
      body: JSON.stringify({
        message: `Add new post: ${filePath} with ${treeItems.length - 1} attachments`,
        tree: newTree.sha,
        parents: [commitSha]
      })
    });

    // 7. Update branch reference
    const refName = refRes.ref.replace('refs/', '');
    await githubFetch(`${baseUrl}/git/refs/${refName}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha })
    });

    return NextResponse.json({
      success: true,
      slug,
      path: filePath,
      url: `/${postType}/${slug}`,
      message: 'GitHub에 성공적으로 원자성 커밋(Atomic Commit) 되었습니다.',
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
