import { fireEvent, render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'

describe('KnowledgeEditorTopBarGuidanceControls', () => {
    it('renders read mode', () => {
        const onEdit = jest.fn()
        const onCopy = jest.fn()
        const onDelete = jest.fn()
        const onTest = jest.fn()
        render(
            <KnowledgeEditorTopBarGuidanceControls
                mode={{
                    mode: 'read',
                    onEdit,
                    onCopy,
                    onDelete,
                    onTest,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'edit' }))

        expect(onEdit).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'copy' }))

        expect(onCopy).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(onDelete).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'test' }))

        expect(onTest).toHaveBeenCalled()
    })

    it('renders edit mode', () => {
        const onSave = jest.fn()
        const onCancel = jest.fn()

        render(
            <KnowledgeEditorTopBarGuidanceControls
                mode={{
                    mode: 'edit',
                    onSave,
                    onCancel,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onCancel).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(onSave).toHaveBeenCalled()
    })

    it('renders create mode', () => {
        const onCreate = jest.fn()
        const onCancel = jest.fn()

        render(
            <KnowledgeEditorTopBarGuidanceControls
                mode={{
                    mode: 'create',
                    onCreate,
                    onCancel,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onCancel).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(onCreate).toHaveBeenCalled()
    })
})
