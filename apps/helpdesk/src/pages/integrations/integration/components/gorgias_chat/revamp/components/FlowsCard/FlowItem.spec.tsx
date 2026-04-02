import type { ReactNode } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { FlowItem } from './FlowItem'

jest.mock('pages/common/hooks/useReorderDnD', () => ({
    useReorderDnD: jest.fn().mockReturnValue({
        dragRef: { current: null },
        dropRef: { current: null },
        handlerId: null,
        isDragging: false,
    }),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const defaultProps = {
    index: 0,
    label: 'Test Flow',
    channelType: 'chat',
    editUrl: '/app/automation/shopify/test-shop/flows/edit/workflow-1',
    onMove: jest.fn(),
    onDrop: jest.fn(),
    onCancel: jest.fn(),
    onDelete: jest.fn(),
}

const renderComponent = (
    props: Partial<typeof defaultProps> & {
        languagesMismatchWarning?: ReactNode
    } = {},
) => {
    return render(
        <MemoryRouter>
            <FlowItem {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('FlowItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the flow label', () => {
        renderComponent()

        expect(screen.getByText('Test Flow')).toBeInTheDocument()
    })

    it('should render the drag handle', () => {
        renderComponent()

        expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument()
    })

    it('should render the edit button with correct aria-label', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /edit test flow/i }),
        ).toBeInTheDocument()
    })

    it('should render the remove button with correct aria-label', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /remove test flow/i }),
        ).toBeInTheDocument()
    })

    it('should navigate to edit URL when edit button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const editButton = screen.getByRole('button', {
            name: /edit test flow/i,
        })
        await user.click(editButton)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/flows/edit/workflow-1',
        )
    })

    it('should call onDelete when remove button is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = jest.fn()
        renderComponent({ onDelete })

        const removeButton = screen.getByRole('button', {
            name: /remove test flow/i,
        })
        await user.click(removeButton)

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should render with different flow label', () => {
        renderComponent({ label: 'Order Status Flow' })

        expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /edit order status flow/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /remove order status flow/i }),
        ).toBeInTheDocument()
    })

    it('should navigate to different edit URL when provided', async () => {
        const user = userEvent.setup()
        renderComponent({
            editUrl: '/app/settings/flows/bigcommerce/my-store/edit/workflow-2',
        })

        const editButton = screen.getByRole('button', {
            name: /edit test flow/i,
        })
        await user.click(editButton)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/flows/bigcommerce/my-store/edit/workflow-2',
        )
    })

    describe('languagesMismatchWarning', () => {
        it('should not render warning icon when languagesMismatchWarning is not provided', () => {
            renderComponent()

            expect(
                screen.queryByRole('img', { name: /triangle-warning/i }),
            ).not.toBeInTheDocument()
        })

        it('should render warning icon when languagesMismatchWarning is provided', () => {
            renderComponent({
                languagesMismatchWarning: <span>Language warning</span>,
            })

            expect(
                screen.getByRole('img', { name: /triangle-warning/i }),
            ).toBeInTheDocument()
        })

        it('should show tooltip content when hovering over warning icon', async () => {
            const user = userEvent.setup()
            renderComponent({
                languagesMismatchWarning: (
                    <span>Flow language does not match channel</span>
                ),
            })

            const warningIcon = screen.getByRole('img', {
                name: /triangle-warning/i,
            })
            await user.hover(warningIcon)

            await waitFor(() => {
                expect(
                    screen.getByText('Flow language does not match channel'),
                ).toBeInTheDocument()
            })
        })
    })
})
