import { NextResponse } from 'next/server';

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function createFileInGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  token: string
) {
  // 파일이 존재하는지 확인
  const checkUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const checkResponse = await fetch(checkUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (checkResponse.ok) {
    throw new Error('같은 슬러그의 포스트가 이미 존재합니다.');
  }

  // 파일 생성
  const createUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(createUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add new post: ${path}`,
      content: Buffer.from(content).toString('base64'),
      branch: 'main', // 또는 'master'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API Error: ${error.message}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postType, title, summary, slug, link, images, content } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: '제목과 슬러그는 필수입니다.' },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub 설정이 필요합니다. 환경 변수를 확인하세요.' },
        { status: 500 }
      );
    }

    // 폴더 경로 결정
    const folder = postType === 'work' ? 'projects' : 'posts';
    const filePath = `src/app/${postType}/${folder}/${slug}.mdx`;

    // MDX 콘텐츠 생성
    let mdxContent = `---
title: "${title}"
publishedAt: "${getCurrentDate()}"
summary: "${summary || '포스트 요약을 입력하세요.'}"`;

    // 이미지 추가 (work인 경우)
    if (images && images.length > 0 && postType === 'work') {
      mdxContent += `\nimages:`;
      images.forEach((img: string) => {
        if (img) {
          mdxContent += `\n  - "${img}"`;
        }
      });
    }

    // 팀 정보 추가
    mdxContent += `
team:
  - name: "Luverse"
    role: "${postType === 'work' ? 'Software Engineer' : 'Developer & Creator'}"
    avatar: "/images/avatar.png"`;

    // 링크 추가 (선택사항)
    if (link) {
      mdxContent += `
link: "${link}"`;
    }

    mdxContent += `
---

${content || '## 소개\n\n여기에 내용을 작성하세요.'}
`;

    // GitHub에 파일 생성
    await createFileInGitHub(owner, repo, filePath, mdxContent, token);

    return NextResponse.json({
      success: true,
      slug,
      path: filePath,
      url: `/${postType}/${slug}`,
      message: 'GitHub에 커밋되었습니다. Vercel이 자동으로 배포합니다.',
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || '포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
