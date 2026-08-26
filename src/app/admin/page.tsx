'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Column, Row, Text, Input, Textarea, Flex, Spinner, Icon } from '@once-ui-system/core';
import dynamic from 'next/dynamic';

const WysiwygEditor = dynamic(() => import('@/components/WysiwygEditor').then(mod => mod.WysiwygEditor), { 
  ssr: false,
  loading: () => <Flex fillWidth fillHeight horizontal="center" vertical="center" padding="64"><Spinner /></Flex>
});
import { useAdminDrafts, ManualDraft, AdminPostState } from '@/hooks/useAdminDrafts';

const DraftListModal = dynamic(() => import('@/components/admin/DraftModals').then(mod => mod.DraftListModal), { ssr: false });
const DraftDiffModal = dynamic(() => import('@/components/admin/DraftModals').then(mod => mod.DraftDiffModal), { ssr: false });

interface SupabasePost {
  id: string;
  type: 'blog' | 'work';
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image: string | null;
  link: string | null;
  published_at: string;
  is_published: boolean;
}

export default function AdminPage() {
  const router = useRouter();

  const [postType, setPostType] = useState('blog');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>('');
  
  const [isDraftListOpen, setIsDraftListOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<ManualDraft | null>(null);

  // Supabase post management state
  const [isPostManagerOpen, setIsPostManagerOpen] = useState(false);
  const [supabasePosts, setSupabasePosts] = useState<SupabasePost[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  const currentState: AdminPostState = {
    postType, title, summary, slug, link, content, coverImage
  };

  const handleRestore = (draft: AdminPostState) => {
    setPostType(draft.postType || 'blog');
    setTitle(draft.title || '');
    setSummary(draft.summary || '');
    setSlug(draft.slug || '');
    setLink(draft.link || '');
    setContent(draft.content || '');
    setCoverImage(draft.coverImage || null);
    setEditorKey(prev => prev + 1);
  };

  const { isLoaded, lastSaved, drafts, saveManualDraft, restoreDraft, clearAutoSave, deleteDraft } = useAdminDrafts(currentState, handleRestore);

  const onSaveManualDraft = () => {
    saveManualDraft();
    alert('현재 내용이 브라우저 로컬 임시저장에 저장되었습니다.');
  };

  // Fetch Supabase posts for management
  const fetchSupabasePosts = async () => {
    setIsFetchingPosts(true);
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (res.ok && data.posts) {
        setSupabasePosts(data.posts);
      } else {
        alert(data.error || '포스트 목록을 불러오지 못했습니다.');
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const openPostManager = () => {
    setIsPostManagerOpen(true);
    fetchSupabasePosts();
  };

  const loadPostToEditor = (post: SupabasePost) => {
    if (title || content) {
      if (!confirm('현재 작성 중인 내용이 덮어씌워집니다. 계속하시겠습니까?')) {
        return;
      }
    }
    setPostType(post.type);
    setTitle(post.title);
    setSummary(post.summary || '');
    setSlug(post.slug);
    setLink(post.link || '');
    setContent(post.content || '');
    setCoverImage(post.cover_image || null);
    setEditorKey(prev => prev + 1);
    setIsPostManagerOpen(false);
    alert(`"${post.title}" 포스트를 에디터로 불러왔습니다.`);
  };

  const deleteSupabasePost = async (post: SupabasePost) => {
    if (!confirm(`정말로 "${post.title}" 포스트를 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/posts?slug=${post.slug}&type=${post.type}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert('포스트가 성공적으로 삭제되었습니다.');
        fetchSupabasePosts();
      } else {
        alert(data.error || '삭제 실패');
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    }
  };

  // Custom dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (title || content) setIsDirty(true);
  }, [title, content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);

  const handleEditorChange = (markdown: string) => {
    setContent(markdown);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 첨부 가능합니다.');
      throw new Error('Invalid file type');
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 이미지만 업로드 가능합니다.');
      throw new Error('File too large');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('postType', postType);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '이미지 업로드에 실패했습니다.');
      throw new Error(data.error);
    }
    
    return data.previewUrl;
  };

  // Dropdown Outside Click & Keyboard
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypeDropdownOpen]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsTypeDropdownOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsTypeDropdownOpen((prev) => !prev);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPostType('work');
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPostType('blog');
    }
  };

  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return alert('지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP 등 이미지 파일만 가능)');
    }
    if (file.size > 10 * 1024 * 1024) {
      return alert('10MB 이하의 이미지만 업로드 가능합니다.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('postType', postType);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (res.ok) {
      setCoverImage(data.previewUrl);
    } else {
      alert(data.error || '커버 이미지 업로드에 실패했습니다.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleCoverFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverFile(file);
  };

  const publishPost = async () => {
    if (!title) return alert('제목을 입력하세요.');

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '');

    setIsLoading(true);
    setPublishStatus('Supabase DB에 저장 중...');

    try {
      const imageList = coverImage ? [coverImage] : [];

      const res = await fetch('/api/admin/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType,
          title,
          summary,
          slug: finalSlug,
          link,
          coverImage,
          images: imageList,
          content: content,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '포스트 생성 중 오류가 발생했습니다.');

      setPublishStatus('발행 완료! (실시간 즉시 반영됨)');
      setIsDirty(false);
      clearAutoSave();
      setTimeout(() => {
        setIsPublishModalOpen(false);
        router.push(postType === 'blog' ? `/blog/${finalSlug}` : `/work/${finalSlug}`);
      }, 1000);

    } catch (error: any) {
      alert(`오류: ${error.message}`);
      setPublishStatus('발행 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .title-input::placeholder {
          color: var(--neutral-on-background-weak);
          opacity: 0.5;
        }
        ::selection {
          background-color: var(--brand-alpha-medium, rgba(0, 120, 255, 0.3));
          color: inherit;
        }
        
        /* Custom Dropdown Styles */
        .custom-select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          height: 48px;
          border: 1px solid var(--neutral-border-weak);
          border-radius: var(--radius-m, 12px);
          background: var(--neutral-alpha-weak);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          color: var(--neutral-on-background-strong);
        }
        .custom-select-trigger:hover {
          border-color: var(--neutral-border-weak);
          background: var(--neutral-alpha-medium);
        }
        .custom-select-trigger:focus, .custom-select-trigger.open {
          border-color: var(--brand-border-strong, #0078FF);
          box-shadow: 0 0 0 2px var(--brand-alpha-weak, rgba(0, 120, 255, 0.2));
          outline: none;
        }
        .custom-select-trigger .chevron-icon {
          transition: transform 0.2s ease;
        }
        .custom-select-trigger.open .chevron-icon {
          transform: rotate(180deg);
        }
        .custom-select-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 100%;
          background: var(--page-background, #fff);
          border: 1px solid var(--neutral-border-weak);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          overflow: hidden;
        }
        .custom-select-option {
          padding: 12px 16px;
          cursor: pointer;
          color: var(--neutral-on-background-strong);
          transition: background 0.15s ease;
        }
        .custom-select-option:hover {
          background: var(--neutral-alpha-weak);
        }
        .custom-select-option.selected {
          background: var(--brand-alpha-weak, rgba(0, 120, 255, 0.1));
          font-weight: 600;
          color: var(--brand-strong, #0056b3);
        }

        /* Dropzone Styles */
        .cover-dropzone {
          position: relative;
          width: 100%;
          height: 140px;
          border: 1px solid var(--neutral-border-medium);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--neutral-alpha-weak);
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 8px;
        }
        .cover-dropzone:hover, .cover-dropzone.drag-over {
          border-color: var(--brand-border-strong, #0078FF);
          background-color: var(--brand-alpha-weak, rgba(0, 120, 255, 0.05));
        }
      `}</style>
      <Column fillWidth horizontal="center" paddingY="32" style={{ maxWidth: '840px', width: '100%', margin: '0 auto' }}>

        {/* Action Bar */}
        <Row fillWidth horizontal="end" vertical="center" paddingBottom="16" gap="16">
          <Row gap="8" vertical="center">
            {lastSaved && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                자동 저장됨: {lastSaved.toLocaleTimeString()}
              </Text>
            )}
            <Button
              variant="tertiary"
              size="m"
              onClick={openPostManager}
            >
              DB 글 목록 관리
            </Button>
            <Button
              variant="secondary"
              size="m"
              onClick={onSaveManualDraft}
            >
              임시 저장
            </Button>
            <Button
              variant="tertiary"
              size="m"
              onClick={() => setIsDraftListOpen(true)}
            >
              임시 저장함 ({drafts.length})
            </Button>
            <Button
              variant="primary"
              size="m"
              onClick={() => setIsPublishModalOpen(true)}
              disabled={!title}
            >
              발행 설정
            </Button>
          </Row>
        </Row>

        {/* Document Area */}
        <Column
          fillWidth
          background="surface"
          border="neutral-alpha-weak"
          shadow="m"
          radius="l"
          padding="40"
          s={{ padding: '24' }}
          gap="24"
        >
          <input
            className="title-input"
            value={title}
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              border: 'none',
              background: 'transparent',
              color: 'var(--neutral-on-background-strong)',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          />
          {isLoaded && (
            <WysiwygEditor
              key={`editor-${editorKey}`}
              initialContent={content}
              onChange={handleEditorChange}
              onUploadImage={handleUploadImage}
            />
          )}
        </Column>

      </Column>

      {/* Publish Modal Overlay */}
      {isPublishModalOpen && (
        <div
          style={{
            position: 'fixed', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--backdrop-surface, rgba(0, 0, 0, 0.4))', backdropFilter: 'blur(4px)'
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsPublishModalOpen(false);
          }}
        >
          <Column
            background="page"
            radius="l"
            padding="32"
            gap="24"
            shadow="xl"
            border="neutral-alpha-weak"
            style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <Row horizontal="between" vertical="center">
              <Text variant="heading-strong-l" onBackground="neutral-strong">발행 설정</Text>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--neutral-on-background-weak)' }}
              >&times;</button>
            </Row>

            <Column gap="16" className="publish-modal-container">
              <Column gap="8" ref={dropdownRef} style={{ position: 'relative' }}>
                <Text variant="label-strong-m" onBackground="neutral-strong">포스트 타입</Text>
                <div
                  className={`custom-select-trigger ${isTypeDropdownOpen ? 'open' : ''}`}
                  tabIndex={0}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  onKeyDown={handleDropdownKeyDown}
                >
                  <Text variant="body-default-m" onBackground="neutral-strong">
                    {postType === 'blog' ? 'Blog (블로그)' : 'Work (포트폴리오)'}
                  </Text>
                  <Icon name="chevronDown" size="m" className="chevron-icon" />
                </div>
                {isTypeDropdownOpen && (
                  <div className="custom-select-menu">
                    <div
                      className={`custom-select-option ${postType === 'blog' ? 'selected' : ''}`}
                      onClick={() => { setPostType('blog'); setIsTypeDropdownOpen(false); }}
                    >
                      Blog (블로그)
                    </div>
                    <div
                      className={`custom-select-option ${postType === 'work' ? 'selected' : ''}`}
                      onClick={() => { setPostType('work'); setIsTypeDropdownOpen(false); }}
                    >
                      Work (포트폴리오)
                    </div>
                  </div>
                )}
              </Column>

              <Column gap="8">
                <Text variant="label-strong-m" onBackground="neutral-strong">URL 슬러그</Text>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="자동 생성됩니다 (예: my-post-title)"
                />
              </Column>

              <Column gap="8">
                <Text variant="label-strong-m" onBackground="neutral-strong">요약 (Summary)</Text>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="목록에 표시될 짧은 요약을 작성하세요."
                />
              </Column>

              {postType === 'work' && (
                <Column gap="8">
                  <Text variant="label-strong-m" onBackground="neutral-strong">프로젝트 링크</Text>
                  <Input
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </Column>
              )}

              <Column gap="8">
                <Text variant="label-strong-m" onBackground="neutral-strong">대표 이미지 업로드</Text>
                {coverImage ? (
                  <Column gap="8">
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--neutral-border-weak)' }}>
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                          <Button variant="secondary" size="s">교체</Button>
                          <input
                            type="file" accept="image/*" onChange={handleCoverUpload}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                        </div>
                        <Button variant="secondary" size="s" onClick={() => setCoverImage(null)}>삭제</Button>
                      </div>
                    </div>
                    <Text variant="body-default-xs" onBackground="neutral-weak" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {coverImage}
                    </Text>
                  </Column>
                ) : (
                  <div
                    className={`cover-dropzone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                    />
                    <Icon name="upload" size="l" onBackground="neutral-weak" />
                    <Column align="center" gap="4">
                      <Text variant="body-default-m" onBackground="neutral-strong" weight="strong">클릭하거나 이미지를 드롭하세요</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">Supabase Storage로 즉시 업로드 (최대 10MB)</Text>
                    </Column>
                  </div>
                )}
              </Column>
            </Column>

            <Column gap="12" marginTop="16">
              <Button
                variant="primary"
                fillWidth
                size="l"
                onClick={publishPost}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="s" /> : 'Supabase에 저장 및 발행'}
              </Button>
              {publishStatus && (
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  {publishStatus}
                </Text>
              )}
            </Column>

          </Column>
        </div>
      )}

      {/* Supabase Post Manager Modal */}
      {isPostManagerOpen && (
        <div
          style={{
            position: 'fixed', zIndex: 100, top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--backdrop-surface, rgba(0, 0, 0, 0.4))', backdropFilter: 'blur(4px)'
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsPostManagerOpen(false);
          }}
        >
          <Column
            background="page"
            radius="l"
            padding="32"
            gap="24"
            shadow="xl"
            border="neutral-alpha-weak"
            style={{ width: '100%', maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <Row horizontal="between" vertical="center">
              <Text variant="heading-strong-l" onBackground="neutral-strong">Supabase DB 글 관리</Text>
              <button
                onClick={() => setIsPostManagerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--neutral-on-background-weak)' }}
              >&times;</button>
            </Row>

            {isFetchingPosts ? (
              <Flex fillWidth horizontal="center" padding="32">
                <Spinner size="m" />
              </Flex>
            ) : supabasePosts.length === 0 ? (
              <Text variant="body-default-m" onBackground="neutral-weak" align="center" padding="32">
                등록된 포스트가 없습니다.
              </Text>
            ) : (
              <Column gap="12">
                {supabasePosts.map((post) => (
                  <Row
                    key={post.id}
                    horizontal="between"
                    vertical="center"
                    padding="16"
                    radius="m"
                    border="neutral-alpha-weak"
                    background="surface"
                    gap="16"
                  >
                    <Column flex={1} gap="4">
                      <Row gap="8" vertical="center">
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: post.type === 'blog' ? 'rgba(0, 120, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: post.type === 'blog' ? '#0078FF' : '#10B981',
                        }}>
                          {post.type.toUpperCase()}
                        </span>
                        <Text variant="label-strong-m" onBackground="neutral-strong">
                          {post.title}
                        </Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        /{post.type}/{post.slug} &bull; {post.published_at}
                      </Text>
                    </Column>
                    <Row gap="8">
                      <Button
                        variant="secondary"
                        size="s"
                        onClick={() => loadPostToEditor(post)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="tertiary"
                        size="s"
                        onClick={() => deleteSupabasePost(post)}
                      >
                        삭제
                      </Button>
                    </Row>
                  </Row>
                ))}
              </Column>
            )}
          </Column>
        </div>
      )}

      {isDraftListOpen && !selectedDraft && (
        <DraftListModal 
          drafts={drafts} 
          onClose={() => setIsDraftListOpen(false)}
          onSelectDraft={(draft) => setSelectedDraft(draft)}
          onDeleteDraft={deleteDraft}
        />
      )}
      {selectedDraft && (
        <DraftDiffModal
          current={currentState}
          draft={selectedDraft}
          onClose={() => setSelectedDraft(null)}
          onRestore={(draft) => {
            restoreDraft(draft);
            setIsDraftListOpen(false);
          }}
        />
      )}
    </>
  );
}
