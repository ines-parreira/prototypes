import { act, renderHook } from '@testing-library/react'

import { ModalState } from '../modals/KnowledgeEditorGuidanceModal.types'
import { useKnowledgeEditorGuidanceModal } from './useKnowledgeEditorGuidanceModal'

describe('useKnowledgeEditorGuidanceModal', () => {
    it('is closed by default', () => {
        const { result } = renderHook(() => useKnowledgeEditorGuidanceModal())

        expect(result.current.modal).toEqual({ type: ModalState.Closed })
    })

    describe('Unsaved changes modal', () => {
        it('opens unsaved changes modal with correct state', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
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

            expect(result.current.modal.type).toBe(ModalState.UnsavedChanges)
        })

        it('calls onSaveChanges and closes modal when onSave is called', async () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
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

            if (result.current.modal.type !== ModalState.UnsavedChanges) {
                throw new Error('modal not in unsaved-changes state')
            }

            await act(result.current.modal.onSave)

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
            expect(onSaveChanges).toHaveBeenCalled()
            expect(onDiscardChanges).not.toHaveBeenCalled()
        })

        it('calls onDiscardChanges and closes modal when onDiscard is called', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
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

            if (result.current.modal.type !== ModalState.UnsavedChanges) {
                throw new Error('modal not in unsaved-changes state')
            }

            act(result.current.modal.onDiscard)

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
            expect(onDiscardChanges).toHaveBeenCalled()
            expect(onSaveChanges).not.toHaveBeenCalled()
        })

        it('closes modal without calling callbacks when onBackToEditing is called', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
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

            if (result.current.modal.type !== ModalState.UnsavedChanges) {
                throw new Error('modal not in unsaved-changes state')
            }

            act(result.current.modal.onBackToEditing)

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
            expect(onDiscardChanges).not.toHaveBeenCalled()
            expect(onSaveChanges).not.toHaveBeenCalled()
        })
    })

    describe('Discard draft modal', () => {
        it('opens discard draft modal with correct state', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            act(() => result.current.openDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)
        })

        it('contains onBackToEditing callback that closes the modal', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            act(() => result.current.openDiscardDraftModal())

            rerender()

            if (result.current.modal.type !== ModalState.DiscardDraft) {
                throw new Error('modal not in discard-draft state')
            }

            expect(result.current.modal.onBackToEditing).toBeDefined()

            act(result.current.modal.onBackToEditing)

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
        })

        it('can be closed using closeDiscardDraftModal', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            act(() => result.current.openDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)

            act(() => result.current.closeDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
        })

        it('can be reopened after being closed', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            act(() => result.current.openDiscardDraftModal())
            rerender()

            act(() => result.current.closeDiscardDraftModal())
            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)

            act(() => result.current.openDiscardDraftModal())
            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)
        })
    })

    describe('Modal state transitions', () => {
        it('can transition from unsaved changes to discard draft', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
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

            expect(result.current.modal.type).toBe(ModalState.UnsavedChanges)

            act(() => result.current.openDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)
        })

        it('can transition from discard draft to unsaved changes', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            act(() => result.current.openDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)

            const onDiscardChanges = jest.fn()
            const onSaveChanges = jest.fn()

            act(() =>
                result.current.openUnsavedChangesModal({
                    onDiscardChanges,
                    onSaveChanges,
                }),
            )

            rerender()

            expect(result.current.modal.type).toBe(ModalState.UnsavedChanges)
        })
    })

    describe('Multiple modal operations', () => {
        it('handles multiple open/close cycles correctly', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            for (let i = 0; i < 3; i++) {
                act(() => result.current.openDiscardDraftModal())
                rerender()
                expect(result.current.modal.type).toBe(ModalState.DiscardDraft)

                act(() => result.current.closeDiscardDraftModal())
                rerender()
                expect(result.current.modal.type).toBe(ModalState.Closed)
            }
        })

        it('maintains independent state for different modals', () => {
            const { result, rerender } = renderHook(() =>
                useKnowledgeEditorGuidanceModal(),
            )

            const onDiscardChanges1 = jest.fn()
            const onSaveChanges1 = jest.fn()

            act(() =>
                result.current.openUnsavedChangesModal({
                    onDiscardChanges: onDiscardChanges1,
                    onSaveChanges: onSaveChanges1,
                }),
            )

            rerender()

            expect(result.current.modal.type).toBe(ModalState.UnsavedChanges)

            if (result.current.modal.type === ModalState.UnsavedChanges) {
                act(result.current.modal.onBackToEditing)
            }

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)

            act(() => result.current.openDiscardDraftModal())

            rerender()

            expect(result.current.modal.type).toBe(ModalState.DiscardDraft)

            if (result.current.modal.type === ModalState.DiscardDraft) {
                act(result.current.modal.onBackToEditing)
            }

            rerender()

            expect(result.current.modal.type).toBe(ModalState.Closed)
            expect(onDiscardChanges1).not.toHaveBeenCalled()
            expect(onSaveChanges1).not.toHaveBeenCalled()
        })
    })
})
