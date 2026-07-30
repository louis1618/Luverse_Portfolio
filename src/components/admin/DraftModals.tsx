'use client';

import React, { useState } from 'react';
import { Column, Row, Text, Button, Flex } from '@once-ui-system/core';
import { diffWords, diffLines, Change } from 'diff';
import { ManualDraft, AdminPostState } from '@/hooks/useAdminDrafts';

interface DraftListModalProps {
  drafts: ManualDraft[];
  onClose: () => void;
  onSelectDraft: (draft: ManualDraft) => void;
  onDeleteDraft: (draftId: string) => void;
}

export function DraftListModal({ drafts, onClose, onSelectDraft, onDeleteDraft }: DraftListModalProps) {
  return (
    <div
      style={{
        position: 'fixed', zIndex: 200, top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--backdrop-surface, rgba(0, 0, 0, 0.4))', backdropFilter: 'blur(4px)'
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Column
        background="page"
        radius="l"
        padding="32"
        gap="24"
        shadow="xl"
        border="neutral-alpha-weak"
        style={{ width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <Row horizontal="between" vertical="center">
          <Text variant="heading-strong-l" onBackground="neutral-strong">임시 저장 목록</Text>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--neutral-on-background-weak)' }}
          >&times;</button>
        </Row>

        {drafts.length === 0 ? (
          <Flex fillWidth paddingY="64" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">저장된 임시 저장본이 없습니다.</Text>
          </Flex>
        ) : (
          <Column gap="8">
            {drafts.map(draft => (
              <Row 
                key={draft.id} 
                horizontal="between" 
                vertical="center" 
                padding="16"
                border="neutral-alpha-weak"
                radius="m"
                style={{ cursor: 'pointer', transition: 'background-color 0.2s', background: 'var(--neutral-alpha-weak)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-alpha-medium)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-alpha-weak)'}
                onClick={() => onSelectDraft(draft)}
              >
                <Column gap="4">
                  <Text variant="label-strong-m" onBackground="neutral-strong">
                    {draft.title || '제목 없음'}
                  </Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {new Date(draft.timestamp).toLocaleString()}
                  </Text>
                </Column>
                <Row gap="12" vertical="center">
                  <Text variant="body-default-s" onBackground="danger-medium" 
                    style={{ cursor: 'pointer', padding: '4px 8px' }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('이 임시 저장본을 삭제하시겠습니까?')) onDeleteDraft(draft.id);
                    }}>
                    삭제
                  </Text>
                  <Text variant="body-default-s" onBackground="brand-strong">비교하기</Text>
                </Row>
              </Row>
            ))}
          </Column>
        )}
      </Column>
    </div>
  );
}

interface DraftDiffModalProps {
  current: AdminPostState;
  draft: ManualDraft;
  onClose: () => void;
  onRestore: (draft: ManualDraft) => void;
}

const DiffView = ({ oldStr, newStr, useLines = false }: { oldStr: string, newStr: string, useLines?: boolean }) => {
  const changes = useLines 
    ? diffLines(oldStr || '', newStr || '') 
    : diffWords(oldStr || '', newStr || '');

  return (
    <div style={{
      padding: '16px', background: 'var(--neutral-alpha-weak)', borderRadius: '8px',
      fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      maxHeight: '300px', overflowY: 'auto'
    }}>
      {changes.map((part: Change, index: number) => {
        const color = part.added ? '#d4edda' : part.removed ? '#f8d7da' : 'transparent';
        const textDeco = part.removed ? 'line-through' : 'none';
        const textColor = part.added ? '#155724' : part.removed ? '#721c24' : 'var(--neutral-on-background-strong)';
        
        return (
          <span key={index} style={{ backgroundColor: color, textDecoration: textDeco, color: textColor, padding: part.added || part.removed ? '2px 0' : 0 }}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
};

export function DraftDiffModal({ current, draft, onClose, onRestore }: DraftDiffModalProps) {
  const handleRestore = () => {
    if (confirm("이 버전으로 복원하면 현재 작성 중인 내용은 모두 덮어써집니다. 계속하시겠습니까?")) {
      onRestore(draft);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed', zIndex: 300, top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--backdrop-surface, rgba(0, 0, 0, 0.4))', backdropFilter: 'blur(4px)'
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Column
        background="page"
        radius="l"
        padding="32"
        gap="24"
        shadow="xl"
        border="neutral-alpha-weak"
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Row horizontal="between" vertical="center">
          <Column gap="4">
            <Text variant="heading-strong-l" onBackground="neutral-strong">버전 비교</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              저장 일시: {new Date(draft.timestamp).toLocaleString()}
            </Text>
          </Column>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--neutral-on-background-weak)' }}
          >&times;</button>
        </Row>

        <Column gap="8">
          <Text variant="label-strong-m" onBackground="neutral-strong">제목 차이 (Title)</Text>
          <DiffView oldStr={draft.title} newStr={current.title} />
        </Column>

        <Column gap="8">
          <Text variant="label-strong-m" onBackground="neutral-strong">본문 차이 (Content)</Text>
          <DiffView oldStr={draft.content} newStr={current.content} useLines={true} />
        </Column>

        <Column gap="12" marginTop="16">
          <Button
            variant="primary"
            fillWidth
            size="l"
            onClick={handleRestore}
          >
            이 버전으로 복원하기
          </Button>
          <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
            복원 시 현재 에디터 내용이 이 버전으로 완전히 덮어써집니다. (빨간색 줄그어진 부분이 복원될 내용, 초록색이 사라질 현재 내용입니다)
          </Text>
        </Column>
      </Column>
    </div>
  );
}
