import type { ReactNode } from 'react'

import { useSidebar } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NavigationSidebarNotificationsPopover } from '../NavigationSidebarNotificationsPopover'

jest.mock('@repo/navigation', () => ({
    useSidebar: jest.fn(),
}))

jest.mock('@repo/notifications', () => ({
    NotificationsFeedPanel: ({
        onClose,
    }: {
        onClose: () => void
        renderItem: unknown
    }) => (
        <div>
            <div>NotificationsFeedPanel</div>
            <button onClick={onClose}>Close panel</button>
        </div>
    ),
}))

jest.mock('common/notifications/utils/getNotificationConfig', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('../NavigationSidebarNotificationsButton', () => ({
    NavigationSidebarNotificationsButton: () => (
        <button aria-label="Notifications">Notifications</button>
    ),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Popover: ({
        trigger,
        children,
        isOpen,
        onOpenChange,
    }: {
        trigger: ReactNode
        children: ReactNode
        isOpen: boolean
        onOpenChange: (open: boolean) => void
    }) => (
        <div>
            <div onClick={() => onOpenChange(true)}>{trigger}</div>
            {isOpen && children}
        </div>
    ),
}))

const useSidebarMock = assumeMock(useSidebar)

describe('NavigationSidebarNotificationsPopover', () => {
    beforeEach(() => {
        useSidebarMock.mockReturnValue({
            isCollapsed: false,
            toggleCollapse: jest.fn(),
            onSidebarShortcutToggle: jest.fn(),
        })
    })

    it('renders the notifications button', () => {
        render(<NavigationSidebarNotificationsPopover />)
        expect(
            screen.getByRole('button', { name: /notifications/i }),
        ).toBeInTheDocument()
    })

    it('does not show the feed panel initially', () => {
        render(<NavigationSidebarNotificationsPopover />)
        expect(
            screen.queryByText('NotificationsFeedPanel'),
        ).not.toBeInTheDocument()
    })

    it('opens the feed panel when the trigger area is clicked', async () => {
        const user = userEvent.setup()
        render(<NavigationSidebarNotificationsPopover />)

        await user.click(screen.getByRole('button', { name: /notifications/i }))

        expect(screen.getByText('NotificationsFeedPanel')).toBeInTheDocument()
    })

    it('closes the feed panel when onClose is called', async () => {
        const user = userEvent.setup()
        render(<NavigationSidebarNotificationsPopover />)

        await user.click(screen.getByRole('button', { name: /notifications/i }))
        expect(screen.getByText('NotificationsFeedPanel')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /close panel/i }))
        expect(
            screen.queryByText('NotificationsFeedPanel'),
        ).not.toBeInTheDocument()
    })
})
