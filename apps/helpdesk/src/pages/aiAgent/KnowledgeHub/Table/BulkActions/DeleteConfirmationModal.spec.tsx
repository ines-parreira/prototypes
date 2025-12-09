import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType } from '../../types'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

describe('DeleteConfirmationModal', () => {
    const mockOnConfirm = jest.fn()
    const mockOnCancel = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with singular item count', () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'FAQ 1',
                lastUpdatedAt: '2024-01-01',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={true}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        expect(screen.getByText('Delete 1 item?')).toBeInTheDocument()
    })

    it('should render with plural item count', () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'FAQ 1',
                lastUpdatedAt: '2024-01-01',
            },
            {
                id: '2',
                type: KnowledgeType.FAQ,
                title: 'FAQ 2',
                lastUpdatedAt: '2024-01-02',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={true}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        expect(screen.getByText('Delete 2 items?')).toBeInTheDocument()
    })

    it('should show warning messages', () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Document,
                title: 'Doc 1',
                lastUpdatedAt: '2024-01-01',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={true}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        expect(
            screen.getByText("Once deleted, this content can't be restored."),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Help Center articles will be deleted from both knowledge and your Help Center settings.',
            ),
        ).toBeInTheDocument()
    })

    it('should call onConfirm when Delete button is clicked', async () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'FAQ 1',
                lastUpdatedAt: '2024-01-01',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={true}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        await act(() =>
            userEvent.click(screen.getByRole('button', { name: /delete/i })),
        )

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should call onCancel when Cancel button is clicked', async () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'FAQ 1',
                lastUpdatedAt: '2024-01-01',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={true}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        await act(() =>
            userEvent.click(screen.getByRole('button', { name: /cancel/i })),
        )

        expect(mockOnCancel).toHaveBeenCalledTimes(1)
        expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should not render modal when isOpen is false', () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'FAQ 1',
                lastUpdatedAt: '2024-01-01',
            },
        ]

        render(
            <DeleteConfirmationModal
                isOpen={false}
                selectedItems={items}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        )

        expect(screen.queryByText('Delete 1 item?')).not.toBeInTheDocument()
    })
})
