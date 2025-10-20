import { fireEvent, render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'

describe('KnowledgeEditorTopBarGuidanceControls', () => {
    it('renders read mode', () => {
        const onEdit = jest.fn()
        const onCopy = jest.fn()
        const onDelete = jest.fn()
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={false}
                mode={{
                    mode: 'read',
                    onEdit,
                    onCopy,
                    onDelete,
                }}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'edit' }))

        expect(onEdit).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'copy' }))

        expect(onCopy).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'delete' }))

        expect(onDelete).toHaveBeenCalled()
    })

    it('renders edit mode', () => {
        const onSave = jest.fn()
        const onCancel = jest.fn()

        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={false}
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
                isUpdating={false}
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

    it('renders disabled', () => {
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={true}
                mode={{
                    mode: 'read',
                    onEdit: jest.fn(),
                    onCopy: jest.fn(),
                    onDelete: jest.fn(),
                }}
            />,
        )

        expect(screen.getByRole('button', { name: 'edit' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'copy' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'delete' })).toBeDisabled()
    })

    it('renders edit mode disabled', () => {
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={true}
                mode={{ mode: 'edit', onSave: jest.fn(), onCancel: jest.fn() }}
            />,
        )

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('renders edit mode disabled when onSave is undefined', () => {
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={false}
                mode={{ mode: 'edit', onSave: undefined, onCancel: jest.fn() }}
            />,
        )

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('renders create mode disabled when onCreate is undefined', () => {
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={false}
                mode={{
                    mode: 'create',
                    onCreate: undefined,
                    onCancel: jest.fn(),
                }}
            />,
        )

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    })

    it('renders create mode disabled', () => {
        render(
            <KnowledgeEditorTopBarGuidanceControls
                isUpdating={true}
                mode={{
                    mode: 'create',
                    onCreate: jest.fn(),
                    onCancel: jest.fn(),
                }}
            />,
        )

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    })
})
