import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { Button, Menu } from '@gorgias/axiom'

import { UserMenuAccountSection } from '../UserMenuAccountSection'

jest.mock('@repo/activity-tracker', () => ({
    ...jest.requireActual('@repo/activity-tracker'),
    clearActivityTrackerSession: jest.fn(),
    logActivityEvent: jest.fn(),
    unregisterAppActivityTrackerHooks: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

const logEventMock = assumeMock(logEvent)

const renderInMenu = (props: { userEmail?: string; userRole?: string } = {}) =>
    render(
        <Menu defaultOpen trigger={<Button>Open menu</Button>}>
            <UserMenuAccountSection {...props} />
        </Menu>,
    )

describe('UserMenuAccountSection', () => {
    const originalLocation = window.location

    beforeEach(() => {
        window.CSRF_TOKEN = 'test-csrf-token'
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: { ...originalLocation, href: '' },
        })
    })

    afterAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: originalLocation,
        })
    })

    it('renders the Sign out menu item', () => {
        renderInMenu({ userEmail: 'a@b.c', userRole: 'admin' })

        expect(
            screen.getByRole('menuitem', { name: /Sign out/ }),
        ).toBeInTheDocument()
    })

    it('logs the logout event, clears activity tracker state and redirects to /logout', async () => {
        const user = userEvent.setup()
        renderInMenu({ userEmail: 'a@b.c', userRole: 'admin' })

        await user.click(screen.getByRole('menuitem', { name: /Sign out/ }))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'log-out',
                user_email: 'a@b.c',
                user_role: 'admin',
            },
        )
        expect(logActivityEvent).toHaveBeenCalledWith(
            ActivityEvents.UserClosedApp,
        )
        expect(unregisterAppActivityTrackerHooks).toHaveBeenCalled()
        expect(clearActivityTrackerSession).toHaveBeenCalled()
        expect(window.location.href).toBe('/logout?csrf-token=test-csrf-token')
    })

    it('logs with undefined user_email and user_role when props are omitted', async () => {
        const user = userEvent.setup()
        renderInMenu()

        await user.click(screen.getByRole('menuitem', { name: /Sign out/ }))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'log-out',
                user_email: undefined,
                user_role: undefined,
            },
        )
    })
})
