import { fireEvent, render, screen } from '@testing-library/react'

import {
    ArticleModes,
    KnowledgeEditorTopBarHelpCenterArticlesControls,
} from './KnowledgeEditorTopBarHelpCenterArticlesControls'

describe('KnowledgeEditorTopBarHelpCenterArticlesControls', () => {
    it('renders read mode', () => {
        const onEdit = jest.fn()
        const onDelete = jest.fn()
        const onTest = jest.fn()
        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={ArticleModes.READ}
                onEdit={onEdit}
                onDelete={onDelete}
                onTest={onTest}
                disabled={false}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'edit' }))

        expect(onEdit).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(onDelete).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'test' }))

        expect(onTest).toHaveBeenCalled()
    })

    it('renders editDraft mode', () => {
        const onCancel = jest.fn()
        const onSaveDraft = jest.fn()
        const onSaveAndPublish = jest.fn()

        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={ArticleModes.EDIT_DRAFT}
                onCancel={onCancel}
                onSaveDraft={onSaveDraft}
                onSaveAndPublish={onSaveAndPublish}
                disabled={false}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

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
                mode={ArticleModes.EDIT_PUBLISHED}
                onCancel={onCancel}
                onSaveAndPublish={onSaveAndPublish}
                disabled={false}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(onCancel).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Save & publish' }))

        expect(onSaveAndPublish).toHaveBeenCalled()
    })

    it('renders read mode disabled', () => {
        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={ArticleModes.READ}
                onEdit={jest.fn()}
                onDelete={jest.fn()}
                onTest={jest.fn()}
                disabled={true}
            />,
        )

        expect(screen.getByRole('button', { name: 'edit' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'delete' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'test' })).toBeDisabled()
    })

    it('renders editDraft mode disabled', () => {
        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={ArticleModes.EDIT_DRAFT}
                onCancel={jest.fn()}
                onSaveDraft={jest.fn()}
                onSaveAndPublish={jest.fn()}
                disabled={true}
            />,
        )

        expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'Save draft' }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'Save & publish' }),
        ).toBeDisabled()
    })

    it('renders editPublished mode disabled', () => {
        render(
            <KnowledgeEditorTopBarHelpCenterArticlesControls
                mode={ArticleModes.EDIT_PUBLISHED}
                onCancel={jest.fn()}
                onSaveAndPublish={jest.fn()}
                disabled={true}
            />,
        )

        expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'Save & publish' }),
        ).toBeDisabled()
    })
})
