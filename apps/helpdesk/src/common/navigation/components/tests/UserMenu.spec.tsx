import type { ReactNode } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { StaticRouter } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from 'services/activityTracker'
import shortcutManager from 'services/shortcutManager'
import { getCurrentUser } from 'state/currentUser/selectors'
import { ignoreHTML } from 'tests/ignoreHTML'

import UserMenu from '../UserMenu'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
)
jest.mock('pages/common/components/NoticeableIndicator', () => () => (
    <div>NoticeableIndicator</div>
))
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('hooks/useAxiomMigration', () => ({ useAxiomMigration: jest.fn() }))
const useAxiomMigrationMock = useAxiomMigration as jest.Mock

jest.mock(
    'services/activityTracker',
    () =>
        ({
            ...jest.requireActual('services/activityTracker'),
            clearActivityTrackerSession: jest.fn(),
            logActivityEvent: jest.fn(),
            unregisterAppActivityTrackerHooks: jest.fn(),
        }) as typeof import('services/activityTracker'),
)
jest.mock('services/shortcutManager', () => ({
    triggerAction: jest.fn(),
}))

jest.mock(
    'core/theme',
    () =>
        ({
            ...jest.requireActual('core/theme'),
            useTheme: jest.fn(),
        }) as typeof import('core/theme'),
)
const useThemeMock = assumeMock(useTheme)
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('../AvailabilityToggle', () => () => <div>AvailabilityToggle</div>)
jest.mock('../AxiomMigrationToggle', () => ({
    AxiomMigrationToggle: () => <div>AxiomMigrationToggle</div>,
}))
jest.mock('../MainNavigation', () => () => <div>MainNavigation</div>)
jest.mock('../OfficeHours', () => () => <div>OfficeHours</div>)
jest.mock('../ThemeMenu', () => () => <div>ThemeMenu</div>)

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

const wrapper = ({ children }: { children?: ReactNode }) => (
    <StaticRouter location="/app">{children}</StaticRouter>
)

describe('UserMenu', () => {
    let onClose: jest.Mock

    beforeEach(() => {
        onClose = jest.fn()
        useAxiomMigrationMock.mockReturnValue({ hasFlag: false })
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
        getCurrentUserMock.mockReturnValue(
            fromJS({
                email: 'test@example.com',
            }),
        )
    })

    it('should render the main screen', () => {
        render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
        expect(
            screen.queryByText('AxiomMigrationToggle'),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(ignoreHTML('Theme:Classic')),
        ).toBeInTheDocument()
        expect(screen.getByText('Your profile')).toBeInTheDocument()
        expect(screen.getByText('Gorgias updates')).toBeInTheDocument()
        expect(screen.getByText('Learn')).toBeInTheDocument()
        expect(screen.getByText('OfficeHours')).toBeInTheDocument()
        expect(screen.getByText('Refer a friend & earn')).toBeInTheDocument()
        expect(screen.getByText('Log out')).toBeInTheDocument()
    })

    it('should render the axiom migration toggle if the fla is enabled', () => {
        useAxiomMigrationMock.mockReturnValue({ hasFlag: true })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('AxiomMigrationToggle')).toBeInTheDocument()
    })

    it.each([
        ['Your profile', 'your-profile'],
        ['Refer a friend & earn', 'referral-program'],
    ])('should handle clicks for %s on the main screen', (label, link) => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText(label))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link,
                user_email: 'test@example.com',
            },
        )
        expect(onClose).toHaveBeenCalledWith()
    })

    it('should log out and stop activity tracking', () => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText('Log out'))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'log-out',
                user_email: 'test@example.com',
            },
        )

        expect(logActivityEvent).toHaveBeenCalledWith(
            ActivityEvents.UserClosedApp,
        )
        expect(unregisterAppActivityTrackerHooks).toHaveBeenCalledWith()
        expect(clearActivityTrackerSession).toHaveBeenCalledWith()
    })

    it('should render the learn screen', () => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })
        userEvent.click(getByText('Learn'))

        expect(getByText('Back')).toBeInTheDocument()
        expect(getByText('Help Center')).toBeInTheDocument()
        expect(getByText('Gorgias Webinars')).toBeInTheDocument()
        expect(getByText('Gorgias Academy')).toBeInTheDocument()
        expect(getByText('Gorgias Community')).toBeInTheDocument()
        expect(getByText('Keyboard shortcuts')).toBeInTheDocument()
    })

    it.each([
        ['Help Center', 'helpdocs'],
        ['Gorgias Webinars', 'gorgiaswebinars'],
        ['Gorgias Academy', 'gorgiasacademy'],
        ['Gorgias Community', 'gorgiascommunity'],
    ])('should handle clicks for %s on the learn screen', (label, link) => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText('Learn'))
        userEvent.click(getByText(label))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link,
                user_email: 'test@example.com',
            },
        )
        expect(onClose).toHaveBeenCalledWith()
    })

    it('should handle clicks for Keyboard shortcuts on the learn screen', () => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText('Learn'))
        userEvent.click(getByText('Keyboard shortcuts'))
        expect(shortcutManager.triggerAction).toHaveBeenCalledWith(
            'KeyboardHelp',
            'SHOW_HELP',
        )
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'keyboard-shortcuts',
                user_email: 'test@example.com',
            },
        )
        expect(onClose).toHaveBeenCalledWith()
    })

    it('should render the updates screen', () => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })
        userEvent.click(getByText('Gorgias updates'))

        expect(getByText('Back')).toBeInTheDocument()
        expect(getByText('Latest updates')).toBeInTheDocument()
        expect(getByText('NoticeableIndicator')).toBeInTheDocument()
        expect(getByText('Roadmap')).toBeInTheDocument()
        expect(getByText('Service status')).toBeInTheDocument()
    })

    it('should handle clicks for Latest updates on the updates screen', () => {
        window.noticeableWidgetId = 'noticeable-widget-id'
        window.noticeable = {
            do: jest.fn(),
        } as unknown as typeof window.noticeable
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText('Gorgias updates'))
        userEvent.click(getByText('Latest updates'))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'latest-updates',
                user_email: 'test@example.com',
            },
        )
        expect(window.noticeable.do).toHaveBeenCalledWith(
            'widget:open',
            'noticeable-widget-id',
        )
    })

    it.each([
        ['Roadmap', 'roadmap'],
        ['Service status', 'service-status'],
    ])('should handle clicks for %s on the updates screen', (label, link) => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        userEvent.click(getByText('Gorgias updates'))
        userEvent.click(getByText(label))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link,
                user_email: 'test@example.com',
            },
        )
        expect(onClose).toHaveBeenCalledWith()
    })

    it('should render the theme screen', () => {
        const { getByText } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })
        userEvent.click(getByText(ignoreHTML('Theme:Classic')))

        expect(getByText('Back')).toBeInTheDocument()
        expect(getByText('ThemeMenu')).toBeInTheDocument()
    })
})
