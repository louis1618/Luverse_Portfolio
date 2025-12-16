'use client';

import { useState } from 'react';

// GitHub 설정 (여기만 수정하세요)
const GITHUB_CONFIG = {
  owner: 'louis1618', // GitHub 사용자명
  repo: 'Luverse_Portfolio', // 리포지토리 이름
  branch: 'main', // 브랜치 이름 (main 또는 master)
};

export default function AdminPage() {
  const [postType, setPostType] = useState('blog');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [link, setLink] = useState('');
  const [images, setImages] = useState('');
  const [content, setContent] = useState('');

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(slugify(value));
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateMDX = () => {
    const imageList = images.split(',').map(img => img.trim()).filter(Boolean);

    let mdxContent = `---
title: "${title}"
publishedAt: "${getCurrentDate()}"
summary: "${summary || '포스트 요약을 입력하세요.'}"`;

    if (imageList.length > 0) {
      mdxContent += `\nimages:`;
      imageList.forEach(img => {
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

${content || '## 소개\n\n여기에 내용을 작성하세요.'}
`;

    return mdxContent;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('제목을 입력하세요.');
      return;
    }

    const finalSlug = slug || slugify(title);
    const folder = postType === 'work' ? 'projects' : 'posts';
    const filePath = `src/app/${postType}/${folder}/${finalSlug}.mdx`;
    const mdxContent = generateMDX();

    // 커밋 메시지 자동 생성
    const commitMessage = `Add ${postType} post: ${title}`;

    // GitHub 새 파일 생성 URL (커밋 메시지 포함)
    const githubUrl = `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/new/${GITHUB_CONFIG.branch}?filename=${encodeURIComponent(filePath)}&value=${encodeURIComponent(mdxContent)}&message=${encodeURIComponent(commitMessage)}`;

    // GitHub로 이동
    window.open(githubUrl, '_blank');
  };

  const handleImageUpload = () => {
    // 이미지 업로드 페이지로 이동
    const imageFolder = postType === 'work' ? 'projects/project-01' : 'blog';
    const uploadUrl = `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/upload/${GITHUB_CONFIG.branch}/public/images/${imageFolder}`;
    window.open(uploadUrl, '_blank');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--neutral-border-weak)',
    backgroundColor: 'var(--neutral-background-medium)',
    color: 'var(--neutral-on-background-strong)',
    fontFamily: 'inherit',
    fontSize: '14px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--neutral-on-background-medium)',
  };

  return (
    <div style={{
      width: '100%',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '32px',
          color: 'var(--neutral-on-background-strong)'
        }}>
          📝 새 포스트 작성
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 포스트 타입 */}
            <div>
              <label style={labelStyle}>포스트 타입</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                style={inputStyle}
              >
                <option value="blog">Blog</option>
                <option value="work">Work</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label style={labelStyle}>제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="포스트 제목을 입력하세요"
                required
                style={inputStyle}
              />
            </div>

            {/* 슬러그 */}
            <div>
              <label style={labelStyle}>슬러그</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="자동 생성됩니다"
                style={inputStyle}
              />
            </div>

            {/* 요약 */}
            <div>
              <label style={labelStyle}>요약</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="포스트 요약을 입력하세요"
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 이미지 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>이미지 경로 (쉼표로 구분, 선택)</label>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--neutral-border-weak)',
                    backgroundColor: 'var(--neutral-background-medium)',
                    color: 'var(--brand-on-background-strong)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand-background-weak)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-background-medium)';
                  }}
                >
                  📤 이미지 업로드
                </button>
              </div>
              <input
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="/images/{postType}/image1.png, /images/{postType}/image2.png"
                style={inputStyle}
              />
              <p style={{
                fontSize: '12px',
                color: 'var(--neutral-on-background-weak)',
                margin: '4px 0 0 0'
              }}>
                💡 버튼을 클릭하면 GitHub 이미지 업로드 페이지가 열립니다. 이미지를 업로드한 후 경로를 복사하여 입력하세요.
              </p>
            </div>

            {/* 링크 */}
            <div>
              <label style={labelStyle}>링크 (선택)</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </div>

            {/* 내용 */}
            <div>
              <label style={labelStyle}>내용 (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="## 소개&#10;&#10;여기에 내용을 작성하세요."
                rows={15}
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 버튼 */}
            <button
              type="submit"
              disabled={!title}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: title ? 'var(--brand-background-strong)' : 'var(--neutral-background-medium)',
                color: title ? 'var(--brand-on-background-strong)' : 'var(--neutral-on-background-weak)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: title ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              GitHub에서 작성하기
            </button>

            <p style={{
              fontSize: '13px',
              color: 'var(--neutral-on-background-weak)',
              margin: 0,
              textAlign: 'center'
            }}>
              💡 버튼을 클릭하면 GitHub 에디터가 열립니다. 내용을 확인하고 커밋하세요.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
