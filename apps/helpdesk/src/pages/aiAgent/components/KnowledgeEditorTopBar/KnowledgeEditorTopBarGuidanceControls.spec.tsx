import { fireEvent, render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'

describe('KnowledgeEditorTopBarGuidanceControls', () => {
    it('renders readonly mode', () => {
        const onEdit = jest.fn()
        const onDelete = jest.fn()

        render(
            <KnowledgeEditorTopBarGuidanceControls
                mode={{
                    mode: 'readonly',
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
