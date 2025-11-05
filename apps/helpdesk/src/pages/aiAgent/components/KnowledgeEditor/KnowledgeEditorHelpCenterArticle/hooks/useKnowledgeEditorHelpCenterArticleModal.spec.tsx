import { act, renderHook } from '@testing-library/react'

import { useKnowledgeEditorHelpCenterArticleModal } from './useKnowledgeEditorHelpCenterArticleModal'

describe('useKnowledgeEditorHelpCenterArticleModal', () => {
    it('is closed by default', () => {
        const { result } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleModal(),
        )

        expect(result.current.modal).toEqual({ type: 'closed' })
    })

    it('manages unsaved changes modal', async () => {
        const { result, rerender } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleModal(),
        )

        const onDiscardChanges = jest.fn()
        const onSaveChanges = jest.fn()

        act(() =>
            result.current.openUnsavedChangesModal({
                onDiscardChanges,
                onSaveChanges,
            }),
        )

        rerender()

        if (result.current.modal.type !== 'unsaved-changes') {
            throw new Error('modal not in unsaved-changes state')
        }

        act(result.current.modal.onClose)

        rerender()

        expect(result.current.modal.type).toEqual('closed')
        expect(onDiscardChanges).not.toHaveBeenCalled()
        expect(onSaveChanges).not.toHaveBeenCalled()

        jest.clearAllMocks()

        act(() =>
            result.current.openUnsavedChangesModal({
                onDiscardChanges,
                onSaveChanges,
            }),
        )

        rerender()

        if (result.current.modal.type !== 'unsaved-changes') {
            throw new Error('modal not in unsaved-changes state')
        }

        await act(result.current.modal.onSave)

        rerender()

        expect(result.current.modal.type).toEqual('closed')
        expect(onSaveChanges).toHaveBeenCalled()
        expect(onDiscardChanges).not.toHaveBeenCalled()

        jest.clearAllMocks()

        act(() =>
            result.current.openUnsavedChangesModal({
                onDiscardChanges,
                onSaveChanges,
            }),
        )

        rerender()

        if (result.current.modal.type !== 'unsaved-changes') {
            throw new Error('modal not in unsaved-changes state')
        }

        act(result.current.modal.onDiscard)

        rerender()

        expect(result.current.modal.type).toEqual('closed')
        expect(onDiscardChanges).toHaveBeenCalled()
        expect(onSaveChanges).not.toHaveBeenCalled()
    })

    it('manages confirm delete modal', async () => {
        const { result, rerender } = renderHook(() =>
            useKnowledgeEditorHelpCenterArticleModal(),
        )

        const onConfirm = jest.fn()

        act(() =>
            result.current.openConfirmDeleteModal({
                resource: { kind: 'article' },
                onConfirm,
            }),
        )

        rerender()

        if (result.current.modal.type !== 'confirm-delete') {
            throw new Error('modal not in confirm-delete state')
        }

        act(result.current.modal.onClose)

        rerender()

        expect(result.current.modal.type).toEqual('closed')
        expect(onConfirm).not.toHaveBeenCalled()

        act(() =>
            result.current.openConfirmDeleteModal({
                resource: { kind: 'article' },
                onConfirm,
            }),
        )

        rerender()

        if (result.current.modal.type !== 'confirm-delete') {
            throw new Error('modal not in confirm-delete state')
        }

        await act(result.current.modal.onConfirm)

        rerender()

        expect(result.current.modal.type).toEqual('closed')
        expect(onConfirm).toHaveBeenCalled()

        act(() =>
            result.current.openConfirmDeleteModal({
                resource: {
                    kind: 'article-translation',
                    locale: {
                        label: 'English',
                        value: 'en-US',
                        text: 'English',
                    },
                },
                onConfirm,
            }),
        )

        rerender()

        expect(result.current.modal).toEqual({
            type: 'confirm-delete',
            resource: {
                kind: 'article-translation',
                locale: { label: 'English', value: 'en-US', text: 'English' },
            },
            onClose: expect.any(Function),
            onConfirm: expect.any(Function),
        })
    })
})
