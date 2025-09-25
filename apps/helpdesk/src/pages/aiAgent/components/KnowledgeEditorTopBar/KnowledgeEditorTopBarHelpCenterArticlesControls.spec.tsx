import { fireEvent, render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarHelpCenterArticlesControls } from './KnowledgeEditorTopBarHelpCenterArticlesControls'

describe('KnowledgeEditorTopBarHelpCenterArticlesControls', () => {
    it('renders read mode', () => {
        const onEdit = jest.fn()
        const onDelete = jest.fn()

        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={{
                    mode: 'read',
                    onEdit,
                    onDelete,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'edit' }))

        expect(onEdit).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(onDelete).toHaveBeenCalled()
    })

    it('renders editDraft mode', () => {
        const onCancel = jest.fn()
        const onSaveDraft = jest.fn()
        const onSaveAndPublish = jest.fn()

        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={{
                    mode: 'editDraft',
                    onCancel,
                    onSaveDraft,
                    onSaveAndPublish,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onCancel).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))

        expect(onSaveDraft).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Save & publish' }))

        expect(onSaveAndPublish).toHaveBeenCalled()
    })

    it('renders editPublished mode', () => {
        const onCancel = jest.fn()
        const onSaveAndPublish = jest.fn()

        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={{
                    mode: 'editPublished',
                    onCancel,
                    onSaveAndPublish,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onCancel).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Save & publish' }))

        expect(onSaveAndPublish).toHaveBeenCalled()
    })
})
