import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { render, screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { StaticRouter } from 'react-router-dom'

import { Button, Menu } from '@gorgias/axiom'

import { UserMenuLinksSection } from '../UserMenuLinksSection'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: { triggerAction: jest.fn() },
}))

jest.mock('../useNoticeableWidget', () => ({
    openNoticeableWidget: jest.fn(),
    useNoticeableUnreadCount: jest.fn(() => 0),
}))

const { openNoticeableWidget } = jest.requireMock('../useNoticeableWidget')
const openNoticeableWidgetMock = openNoticeableWidget as jest.Mock
const logEventMock = assumeMock(logEvent)
const triggerActionMock = shortcutManager.triggerAction as jest.Mock

const defaultProps = {
    userEmail: 'agent@example.com',
    userRole: 'admin',
}

const expectedLogPayload = (link: string) => ({
    link,
    user_email: defaultProps.userEmail,
    user_role: defaultProps.userRole,
})

const renderInMenu = (
    props: { userEmail?: string; userRole?: string } = defaultProps,
) =>
    render(
        <StaticRouter location="/app">
            <Menu defaultOpen trigger={<Button>Open menu</Button>}>
                <UserMenuLinksSection {...props} />
            </Menu>
        </StaticRouter>,
    )

const openSubMenu = async (
    user: UserEvent,
    name: RegExp,
): Promise<HTMLElement> => {
    await user.hover(screen.getByRole('menuitem', { name }))
    return screen.findByRole('menu', { name })
}

describe('UserMenuLinksSection', () => {
    it('renders the Gorgias updates and Learn submenus plus direct menu items', () => {
        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /Gorgias updates/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Learn/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Refer a friend/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Keyboard shortcuts/ }),
        ).toBeInTheDocument()
    })

    it('opens the Noticeable widget and logs the event when Latest updates is clicked', async () => {
        const user = userEvent.setup()
        renderInMenu()

        const submenu = await openSubMenu(user, /Gorgias updates/)
        await user.click(
            within(submenu).getByRole('menuitem', { name: /Latest updates/ }),
        )

        expect(openNoticeableWidgetMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            expectedLogPayload('latest-updates'),
        )
    })

    it.each([
        [
            'Roadmap',
            'https://www.gorgias.com/roadmap',
            'roadmap',
            /Gorgias updates/,
        ],
        [
            'Service status',
            'https://status.gorgias.com/',
            'service-status',
            /Gorgias updates/,
        ],
        ['Help Center', 'https://docs.gorgias.com/', 'helpdocs', /Learn/],
        [
            'Gorgias Academy',
            'https://academy.gorgias.com/trainings?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu',
            'gorgiasacademy',
            /Learn/,
        ],
        [
            'Gorgias Community',
            'https://community.gorgias.com/',
            'gorgiascommunity',
            /Learn/,
        ],
    ])(
        'renders %s as an external link pointing to %s and logs %s when clicked',
        async (label, href, linkId, submenuName) => {
            const user = userEvent.setup()
            renderInMenu()

            const submenu = await openSubMenu(user, submenuName as RegExp)
            const link = within(submenu).getByRole('menuitem', { name: label })

            expect(link).toHaveAttribute('href', href)
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noreferrer')

            await user.click(link)

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.MenuUserLinkClicked,
                expectedLogPayload(linkId),
            )
        },
    )

    it('renders Refer a friend as a react-router Link pointing to /app/referral-program', async () => {
        const user = userEvent.setup()
        renderInMenu()

        const refer = screen.getByRole('menuitem', { name: /Refer a friend/ })
        const anchor = refer.tagName === 'A' ? refer : refer.querySelector('a')
        expect(anchor).toHaveAttribute('href', '/app/referral-program')

        await user.click(refer)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            expectedLogPayload('referral-program'),
        )
    })

    it('triggers the keyboard help shortcut and logs the event when Keyboard shortcuts is clicked', async () => {
        const user = userEvent.setup()
        renderInMenu()

        await user.click(
            screen.getByRole('menuitem', { name: /Keyboard shortcuts/ }),
        )

        expect(triggerActionMock).toHaveBeenCalledWith(
            'KeyboardHelp',
            'SHOW_HELP',
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            expectedLogPayload('keyboard-shortcuts'),
        )
    })

    it('passes undefined user_email and user_role when the props are omitted', async () => {
        const user = userEvent.setup()
        renderInMenu({})

        await user.click(
            screen.getByRole('menuitem', { name: /Keyboard shortcuts/ }),
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'keyboard-shortcuts',
                user_email: undefined,
                user_role: undefined,
            },
        )
    })
})
