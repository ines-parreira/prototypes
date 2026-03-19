import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router-dom'

import { DndProvider } from 'utils/wrappers/DndProvider'

import { InboxSidebarBlock } from '../InboxSidebarBlock'

jest.mock('../TicketNavbarDropTarget', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

const renderComponent = (
    props: Partial<React.ComponentProps<typeof InboxSidebarBlock>> = {},
) => {
    const user = userEvent.setup()
    const result = render(
        <DndProvider backend={HTML5Backend}>
            <MemoryRouter>
                <InboxSidebarBlock title="Inbox" {...props}>
                    <div>Child content</div>
                </InboxSidebarBlock>
            </MemoryRouter>
        </DndProvider>,
    )
    return { ...result, user }
}

describe('InboxSidebarBlock', () => {
    it('renders the section title', () => {
        renderComponent({ title: 'My Inbox' })

        expect(screen.getByText('My Inbox')).toBeInTheDocument()
    })

    it('renders children', () => {
        renderComponent()

        expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('renders the actions menu button when actions are provided', () => {
        renderComponent({
            actions: [{ label: 'Add view', onClick: jest.fn() }],
        })

        expect(
            screen.getByRole('button', { name: 'add-plus-circle' }),
        ).toBeInTheDocument()
    })

    it('renders action menu items after clicking the trigger', async () => {
        const { user } = renderComponent({
            actions: [{ label: 'Add view', onClick: jest.fn() }],
        })

        await user.click(
            screen.getByRole('button', { name: 'add-plus-circle' }),
        )

        await waitFor(() => {
            expect(screen.getByText('Add view')).toBeInTheDocument()
        })
    })

    it('renders actionsIcon tooltip button when actionsIcon is provided', () => {
        renderComponent({
            actions: [{ label: 'Add view', onClick: jest.fn() }],
            actionsIcon: { tooltip: 'Add a new view' },
        })

        expect(
            screen.getByRole('button', { name: 'add-plus-circle' }),
        ).toBeInTheDocument()
    })
})
