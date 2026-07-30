import { NextResponse } from 'next/server';

async function uploadFileToGitHub(
  owner: string,
  repo: string,
  path: string,
  contentBase64: string,
  token: string
) {
  const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload image: ${path}`,
      content: contentBase64,
      branch: 'main',
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postType = formData.get('postType') as string || 'blog';
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub 설정이 필요합니다. 환경 변수를 확인하세요.' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString('base64');
    
    // Generate a unique filename using timestamp to avoid conflicts
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filename = `${timestamp}-${sanitizedName}`;
    
    const folder = postType === 'work' ? 'projects' : 'blog';
    const githubPath = `public/images/${folder}/${filename}`;
    const publicPath = `/images/${folder}/${filename}`;

    await uploadFileToGitHub(owner, repo, githubPath, base64Content, token);

    return NextResponse.json({
      success: true,
      url: publicPath,
      message: '이미지가 성공적으로 업로드되었습니다.',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
