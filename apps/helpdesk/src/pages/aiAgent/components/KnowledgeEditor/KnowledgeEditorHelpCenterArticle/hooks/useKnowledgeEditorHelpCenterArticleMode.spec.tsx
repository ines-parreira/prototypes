import { renderHook } from '@testing-library/react'

import { ArticleModes } from '../../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import { useKnowledgeEditorHelpCenterArticleMode } from './useKnowledgeEditorHelpCenterArticleMode'

describe('useKnowledgeEditorHelpCenterArticleMode', () => {
    it('returns article mode', () => {
        const onEdit = jest.fn()
        const onCancel = jest.fn()
        const onSave = jest.fn()
        const onDelete = jest.fn()

        const { result, rerender } = renderHook(
            (
                props: Parameters<
                    typeof useKnowledgeEditorHelpCenterArticleMode
                >[0],
            ) => useKnowledgeEditorHelpCenterArticleMode(props),
            {
                initialProps: {
                    mode: ArticleModes.READ,
                    onEdit,
                    onCancel,
                    onSave,
                    onDelete,
                },
            },
        )

        expect(result.current).toEqual({
            mode: ArticleModes.READ,
            onEdit,
            onDelete,
            onTest: expect.any(Function),
        })

        rerender({
            mode: ArticleModes.EDIT_PUBLISHED,
            onEdit,
            onCancel,
            onSave,
            onDelete,
        })

        expect(result.current).toEqual({
            mode: ArticleModes.EDIT_PUBLISHED,
            onSaveAndPublish: onSave,
            onCancel: onCancel,
        })

        rerender({
            mode: ArticleModes.EDIT_DRAFT,
            onEdit,
            onCancel,
            onSave,
            onDelete,
        })

        expect(result.current).toEqual({
            mode: ArticleModes.EDIT_DRAFT,
            onCreate: onSave,
            onCancel: onCancel,
        })
    })
})
