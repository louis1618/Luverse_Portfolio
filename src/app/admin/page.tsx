'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Column, Row, Text, Input, Textarea, Flex, Spinner, Icon } from '@once-ui-system/core';
import { WysiwygEditor } from '@/components/WysiwygEditor';
import { useAdminDrafts, ManualDraft, AdminPostState } from '@/hooks/useAdminDrafts';
import { DraftListModal, DraftDiffModal } from '@/components/admin/DraftModals';

export interface PendingFile {
  name: string;
  file: File;
  objectUrl: string;
}

export default function AdminPage() {
  const router = useRouter();

  const [postType, setPostType] = useState('blog');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>('');
  
  const [isDraftListOpen, setIsDraftListOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<ManualDraft | null>(null);

  const currentState: AdminPostState = {
    postType, title, summary, slug, link, content
  };

  const handleRestore = (draft: AdminPostState) => {
    setPostType(draft.postType || 'blog');
    setTitle(draft.title || '');
    setSummary(draft.summary || '');
    setSlug(draft.slug || '');
    setLink(draft.link || '');
    setContent(draft.content || '');
  };

  const { lastSaved, drafts, saveManualDraft, restoreDraft, clearAutoSave, deleteDraft } = useAdminDrafts(currentState, handleRestore);

  const onSaveManualDraft = () => {
    saveManualDraft();
    alert('현재 내용이 임시 저장되었습니다.');
  };

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [coverImage, setCoverImage] = useState<PendingFile | null>(null);

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

  // Safely manage blob URLs lifecycle
  const pendingFilesRef = useRef<PendingFile[]>([]);
  const coverImageRef = useRef<PendingFile | null>(null);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
    coverImageRef.current = coverImage;
  }, [pendingFiles, coverImage]);

  useEffect(() => {
    // Only cleanup on unmount
    return () => {
      pendingFilesRef.current.forEach(pf => URL.revokeObjectURL(pf.objectUrl));
      if (coverImageRef.current) URL.revokeObjectURL(coverImageRef.current.objectUrl);
    };
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);

  const handleEditorChange = (markdown: string) => {
    setContent(markdown);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 첨부 가능합니다.');
      throw new Error('Invalid file type');
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('50MB 이하의 이미지만 업로드 가능합니다.');
      throw new Error('File too large');
    }

    const base64 = await fileToBase64(file);
    const objectUrl = `data:${file.type};base64,${base64}`;
    const newPending: PendingFile = { name: file.name, file, objectUrl };
    setPendingFiles(prev => [...prev, newPending]);
    return objectUrl;
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
    if (file.size > 50 * 1024 * 1024) {
      return alert('50MB 이하의 이미지만 업로드 가능합니다.');
    }

    const base64 = await fileToBase64(file);
    const objectUrl = `data:${file.type};base64,${base64}`;
    setCoverImage({ name: file.name, file, objectUrl });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleCoverFile(file);
    e.target.value = ''; // Reset input to allow selecting the same file again
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
    setPublishStatus('파일 및 이미지 변환 중...');

    try {
      // Filter out files that were deleted from the editor before uploading
      const activePendingFiles = pendingFiles.filter(pf => content.includes(pf.objectUrl));

      const allFiles = [...activePendingFiles];
      if (coverImage) allFiles.push(coverImage);

      const filesPayload = await Promise.all(
        allFiles.map(async (pf) => {
          const ext = pf.name.split('.').pop() || 'png';
          const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const githubPath = `/images/${postType}/${uniqueName}`;
          return {
            originalUrl: pf.objectUrl,
            githubPath,
            base64Content: await fileToBase64(pf.file)
          };
        })
      );

      setPublishStatus('GitHub에 원자성 커밋 업로드 중...');

      let finalContent = content;
      let finalCoverImagePath = '';

      filesPayload.forEach(fp => {
        // Replace in Markdown content
        finalContent = finalContent.split(fp.originalUrl).join(fp.githubPath);
        // Identify if it's the cover image
        if (coverImage && fp.originalUrl === coverImage.objectUrl) {
          finalCoverImagePath = fp.githubPath;
        }
      });

      const imageList = finalCoverImagePath ? [finalCoverImagePath] : [];

      const res = await fetch('/api/admin/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType,
          title,
          summary,
          slug: finalSlug,
          link,
          images: imageList,
          content: finalContent,
          files: filesPayload
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '포스트 생성 중 오류가 발생했습니다.');

      setPublishStatus('발행 완료!');
      setIsDirty(false);
      clearAutoSave();
      setPendingFiles([]);
      setCoverImage(null);
      setTimeout(() => {
        setIsPublishModalOpen(false);
        router.push(postType === 'blog' ? `/blog/${finalSlug}` : `/work/${finalSlug}`);
      }, 1500);

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
        <Row fillWidth horizontal="end" vertical="center" paddingBottom="16" gap="24">
          <Row gap="16" vertical="center">
            {pendingFiles.length > 0 && (
              <Text variant="label-default-s" onBackground="brand-strong">
                첨부 대기: {pendingFiles.length}건
              </Text>
            )}
          </Row>

          <Row gap="8" vertical="center">
            {lastSaved && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                자동 저장됨: {lastSaved.toLocaleTimeString()}
              </Text>
            )}
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
              임시 저장 보기 ({drafts.length})
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
          <WysiwygEditor
            initialContent=""
            onChange={handleEditorChange}
            onUploadImage={handleUploadImage}
          />
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
                  placeholder="자동 생성됩니다"
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
                        src={coverImage.objectUrl}
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
                      {coverImage.name}
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
                      <Text variant="body-default-xs" onBackground="neutral-weak">지원 형식: JPG, PNG, WEBP (최대 50MB)</Text>
                    </Column>
                  </div>
                )}
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  💡 본문에 삽입한 이미지는 별도 설정 없이 자동으로 함께 업로드됩니다.
                </Text>
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
                {isLoading ? <Spinner size="s" /> : '최종 발행하기'}
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
