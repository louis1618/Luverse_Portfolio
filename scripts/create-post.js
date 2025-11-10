#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-가-힣]+/g, '')
    .replace(/\-\-+/g, '-');
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function createPost() {
  console.log('\n📝 새 포스트 생성하기\n');

  // 1. 타입 선택
  const type = await question('포스트 타입을 선택하세요 (1: blog, 2: work): ');
  const postType = type === '2' ? 'work' : 'blog';
  const folder = postType === 'work' ? 'projects' : 'posts';

  // 2. 제목 입력
  const title = await question('제목: ');
  if (!title.trim()) {
    console.error('❌ 제목을 입력해주세요.');
    rl.close();
    return;
  }

  // 3. 요약 입력
  const summary = await question('요약 (선택): ');

  // 4. 슬러그 생성
  const defaultSlug = slugify(title);
  const slugInput = await question(`슬러그 (기본값: ${defaultSlug}): `);
  const slug = slugInput.trim() || defaultSlug;

  // 5. 링크 입력 (선택)
  const link = await question('프로젝트 링크 (선택): ');

  // 6. 이미지 입력 (work만)
  let images = [];
  if (postType === 'work') {
    const imageInput = await question('이미지 경로 (선택, 쉼표로 구분): ');
    if (imageInput.trim()) {
      images = imageInput.split(',').map(img => img.trim());
    }
  }

  // 7. MDX 파일 생성
  const date = getCurrentDate();
  const filePath = path.join(
    process.cwd(),
    'src',
    'app',
    postType,
    folder,
    `${slug}.mdx`
  );

  // MDX 템플릿 생성
  let mdxContent = `---
title: "${title}"
publishedAt: "${date}"
summary: "${summary || '포스트 요약을 입력하세요.'}"`;

  if (images.length > 0) {
    mdxContent += `\nimages:`;
    images.forEach(img => {
      mdxContent += `\n  - "${img}"`;
    });
  }

  mdxContent += `
team:
  - name: "Luverse"
    role: "${postType === 'work' ? 'Software Engineer' : 'Developer & Creator'}"
    avatar: "/images/avatar.png"`;

  if (link) {
    mdxContent += `
link: "${link}"`;
  }

  mdxContent += `
---

## 소개

여기에 내용을 작성하세요.

## 내용

자세한 내용을 추가하세요.
`;

  // 파일 저장
  try {
    fs.writeFileSync(filePath, mdxContent, 'utf8');
    console.log(`\n✅ 포스트가 생성되었습니다!`);
    console.log(`📁 경로: ${filePath}`);
    console.log(`🔗 URL: /${postType}/${slug}\n`);
  } catch (error) {
    console.error('❌ 파일 생성 중 오류 발생:', error.message);
  }

  rl.close();
}

createPost().catch(console.error);
