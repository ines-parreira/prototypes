import { screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { BulkMoreActionsMenu } from './BulkMoreActionsMenu'

const mockMenuState = vi.hoisted(() => ({
    canUseRestrictedBulkActions: true,
    isTrashLikeView: false,
}))

vi.mock('../../../../hooks/useBulkActionMenuState', () => ({
    useBulkActionMenuState: () => ({
        canUseRestrictedBulkActions: mockMenuState.canUseRestrictedBulkActions,
    }),
}))

vi.mock('../../../../hooks/useIsTrashLikeView', () => ({
    useIsTrashLikeView: () => mockMenuState.isTrashLikeView,
}))

const defaultProps = {
    viewId: 123,
    isDisabled: false,
    onMarkAsUnread: vi.fn(),
    onMarkAsRead: vi.fn(),
    onChangePriority: vi.fn(),
    onApplyMacro: vi.fn(),
    onExportTickets: vi.fn(),
    onMoveToTrash: vi.fn(),
    onUndelete: vi.fn(),
    onDeleteForever: vi.fn(),
}

async function openMenu(user: ReturnType<typeof render>['user']) {
    await user.click(screen.getByRole('button', { name: /more actions/i }))
    await waitFor(() => {
        expect(
            screen.getByRole('menuitem', { name: /mark as unread/i }),
        ).toBeInTheDocument()
    })
}

describe('BulkMoreActionsMenu', () => {
    beforeEach(() => {
        mockMenuState.canUseRestrictedBulkActions = true
        mockMenuState.isTrashLikeView = false
    })

    it('shows export and delete in a normal view for agents', async () => {
        const { user } = render(<BulkMoreActionsMenu {...defaultProps} />)
        await openMenu(user)

        expect(
            screen.getByRole('menuitem', { name: /mark as read/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /export tickets/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /^delete$/i }),
        ).toBeInTheDocument()
    })

    it('calls onMarkAsRead when selected', async () => {
        const onMarkAsRead = vi.fn()
        const { user } = render(
            <BulkMoreActionsMenu
                {...defaultProps}
                onMarkAsRead={onMarkAsRead}
            />,
        )
        await openMenu(user)
        await user.click(
            screen.getByRole('menuitem', { name: /mark as read/i }),
        )

        expect(onMarkAsRead).toHaveBeenCalledTimes(1)
    })

    it('calls onMarkAsUnread when selected', async () => {
        const onMarkAsUnread = vi.fn()
        const { user } = render(
            <BulkMoreActionsMenu
                {...defaultProps}
                onMarkAsUnread={onMarkAsUnread}
            />,
        )
        await openMenu(user)
        await user.click(
            screen.getByRole('menuitem', { name: /mark as unread/i }),
        )

        expect(onMarkAsUnread).toHaveBeenCalledTimes(1)
    })

    it('calls onApplyMacro when selected', async () => {
        const onApplyMacro = vi.fn()
        const { user } = render(
            <BulkMoreActionsMenu
                {...defaultProps}
                onApplyMacro={onApplyMacro}
            />,
        )
        await openMenu(user)
        await user.click(screen.getByRole('menuitem', { name: /apply macro/i }))

        expect(onApplyMacro).toHaveBeenCalledTimes(1)
    })

    it('calls onMoveToTrash when delete is selected in a normal view', async () => {
        const onMoveToTrash = vi.fn()
        const { user } = render(
            <BulkMoreActionsMenu
                {...defaultProps}
                onMoveToTrash={onMoveToTrash}
            />,
        )
        await openMenu(user)
        await user.click(screen.getByRole('menuitem', { name: /^delete$/i }))

        expect(onMoveToTrash).toHaveBeenCalledTimes(1)
    })

    it('hides restricted actions in a normal view for users below agent', async () => {
        mockMenuState.canUseRestrictedBulkActions = false

        const { user } = render(<BulkMoreActionsMenu {...defaultProps} />)
        await openMenu(user)

        expect(
            screen.queryByRole('menuitem', { name: /export tickets/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /^delete$/i }),
        ).not.toBeInTheDocument()
    })

    it('shows export, undelete, and delete forever in a trash-like view for agents', async () => {
        mockMenuState.isTrashLikeView = true

        const { user } = render(<BulkMoreActionsMenu {...defaultProps} />)
        await openMenu(user)

        expect(
            screen.getByRole('menuitem', { name: /export tickets/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /undelete/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /delete forever/i }),
        ).toBeInTheDocument()
    })

    it('calls onUndelete when selected in a trash-like view', async () => {
        mockMenuState.isTrashLikeView = true
        const onUndelete = vi.fn()

        const { user } = render(
            <BulkMoreActionsMenu {...defaultProps} onUndelete={onUndelete} />,
        )
        await openMenu(user)
        await user.click(screen.getByRole('menuitem', { name: /undelete/i }))

        expect(onUndelete).toHaveBeenCalledTimes(1)
    })

    it('calls onDeleteForever when selected in a trash-like view', async () => {
        mockMenuState.isTrashLikeView = true
        const onDeleteForever = vi.fn()

        const { user } = render(
            <BulkMoreActionsMenu
                {...defaultProps}
                onDeleteForever={onDeleteForever}
            />,
        )
        await openMenu(user)
        await user.click(
            screen.getByRole('menuitem', { name: /delete forever/i }),
        )

        expect(onDeleteForever).toHaveBeenCalledTimes(1)
    })

    it('hides trash-like restricted actions for users below agent', async () => {
        mockMenuState.canUseRestrictedBulkActions = false
        mockMenuState.isTrashLikeView = true

        const { user } = render(<BulkMoreActionsMenu {...defaultProps} />)
        await openMenu(user)

        expect(
            screen.queryByRole('menuitem', { name: /export tickets/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /undelete/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /delete forever/i }),
        ).not.toBeInTheDocument()
    })
})
