import type { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { StaticRouter } from 'react-router-dom'

import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from 'services/activityTracker'
import { getCurrentUser } from 'state/currentUser/selectors'
import { ignoreHTML } from 'tests/ignoreHTML'

import UserMenu from '../UserMenu'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
jest.mock('pages/common/components/NoticeableIndicator', () => () => (
    <div>NoticeableIndicator</div>
))
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('hooks/useAxiomMigration', () => ({ useAxiomMigration: jest.fn() }))
const useAxiomMigrationMock = useAxiomMigration as jest.Mock

jest.mock('services/activityTracker', () => ({
    ...jest.requireActual('services/activityTracker'),
    clearActivityTrackerSession: jest.fn(),
    logActivityEvent: jest.fn(),
    unregisterAppActivityTrackerHooks: jest.fn(),
}))
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        triggerAction: jest.fn(),
    },
}))

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))
const useThemeMock = assumeMock(useTheme)
const getCurrentUserMock = assumeMock(getCurrentUser)

const { useFlag } = jest.requireMock('@repo/feature-flags')
const useFlagMock = useFlag as jest.Mock

jest.mock('../AvailabilityToggle', () => () => <div>AvailabilityToggle</div>)
jest.mock('../AxiomMigrationToggle', () => ({
    AxiomMigrationToggle: () => (
        <div>
            <span>New UI</span>
        </div>
    ),
}))
jest.mock('../MainNavigation', () => () => <div>MainNavigation</div>)
jest.mock('../StatusMenu', () => () => <div>StatusMenu</div>)
jest.mock('../ThemeMenu', () => () => <div>ThemeMenu</div>)

jest.mock('@repo/agent-status', () => ({
    UserInfoHeaderContainer: () => <div>UserInfoHeaderContainer</div>,
    useUserAvailabilityStatus: jest.fn(() => ({
        status: undefined,
        isLoading: false,
    })),
}))

const { useUserAvailabilityStatus } = jest.requireMock('@repo/agent-status')
const useUserAvailabilityStatusMock = useUserAvailabilityStatus as jest.Mock

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
    getCurrentUserId: jest.fn(() => 123),
}))

const wrapper = ({ children }: { children?: ReactNode }) => (
    <StaticRouter location="/app">{children}</StaticRouter>
)

describe('UserMenu', () => {
    let onClose: jest.Mock

    beforeEach(() => {
        onClose = jest.fn()
        useAxiomMigrationMock.mockReturnValue({ hasFlag: false })
        useFlagMock.mockImplementation(() => {
            return false
        })
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
        getCurrentUserMock.mockReturnValue(
            fromJS({
                email: 'test@example.com',
                role: {
                    name: 'admin',
                },
            }),
        )
    })

    it('should render the main screen', () => {
        render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
        expect(screen.queryByText('New UI')).not.toBeInTheDocument()
        expect(
            screen.queryByText(ignoreHTML('Status:None')),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(ignoreHTML('Theme:Classic')),
        ).toBeInTheDocument()
        expect(screen.getByText('Your profile')).toBeInTheDocument()
        expect(screen.getByText('Gorgias updates')).toBeInTheDocument()
        expect(screen.getByText('Learn')).toBeInTheDocument()
        expect(screen.getByText('Refer a friend & earn')).toBeInTheDocument()
        expect(screen.getByText('Log out')).toBeInTheDocument()
    })

    it('should render the New UI menu item when axiom migration flag is enabled', () => {
        useAxiomMigrationMock.mockReturnValue({ hasFlag: true })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('New UI')).toBeInTheDocument()
    })

    it('should not render the user info header when feature flag is disabled', () => {
        useFlagMock.mockImplementation((key: string) => {
            if (key === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return false
            }
            return false
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(
            screen.queryByText('UserInfoHeaderContainer'),
        ).not.toBeInTheDocument()
    })

    it('should render the user info header when feature flag is enabled', () => {
        useFlagMock.mockImplementation((key: string) => {
            if (key === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return true
            }
            return false
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('UserInfoHeaderContainer')).toBeInTheDocument()
    })

    it('should render user info header above availability toggle when enabled', () => {
        useFlagMock.mockImplementation((key: string) => {
            if (key === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return true
            }
            return false
        })
        const { container } = render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        const userInfoHeader = screen.getByText('UserInfoHeaderContainer')
        const availabilityToggle = screen.getByText('AvailabilityToggle')

        expect(userInfoHeader).toBeInTheDocument()
        expect(availabilityToggle).toBeInTheDocument()

        const allElements = Array.from(container.querySelectorAll('*'))
        const userInfoPosition = allElements.indexOf(userInfoHeader)
        const availabilityPosition = allElements.indexOf(availabilityToggle)

        expect(userInfoPosition).toBeGreaterThan(-1)
        expect(availabilityPosition).toBeGreaterThan(-1)
        expect(userInfoPosition).toBeLessThan(availabilityPosition)
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
                user_role: 'admin',
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
                user_role: 'admin',
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
                user_role: 'admin',
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
                user_role: 'admin',
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
                user_role: 'admin',
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
                user_role: 'admin',
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

    it('should render the status dropdown and screen when feature flag is enabled', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: {
                id: 'available',
                name: 'Available',
            },
            isLoading: false,
        })

        const { getByRole, getByText } = render(
            <UserMenu onClose={onClose} />,
            {
                wrapper,
            },
        )
        userEvent.click(
            getByRole('button', {
                name: /change status.*current status: available/i,
            }),
        )

        expect(getByText('Back')).toBeInTheDocument()
        expect(getByText('StatusMenu')).toBeInTheDocument()
    })

    it('should render status button with correct label when status is not available', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)

        useUserAvailabilityStatusMock.mockReturnValue({
            status: undefined,
            isLoading: false,
        })

        const { getByText, getByRole } = render(
            <UserMenu onClose={onClose} />,
            {
                wrapper,
            },
        )

        expect(getByText(ignoreHTML('Status:None'))).toBeInTheDocument()
        expect(
            getByRole('button', {
                name: /change status.*current status: none/i,
            }),
        ).toBeInTheDocument()
    })

    it('should not render status button when feature flag is disabled', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(false)

        render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        expect(
            screen.queryByText(ignoreHTML('Status:')),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', {
                name: /change status/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('should navigate back to main menu from status screen', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: {
                id: 'available',
                name: 'Available',
            },
            isLoading: false,
        })

        const { getByRole, getByText } = render(
            <UserMenu onClose={onClose} />,
            {
                wrapper,
            },
        )

        userEvent.click(
            getByRole('button', {
                name: /change status.*current status: available/i,
            }),
        )

        expect(getByText('StatusMenu')).toBeInTheDocument()

        userEvent.click(getByText('Back'))

        expect(screen.queryByText('StatusMenu')).not.toBeInTheDocument()
        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
        expect(screen.getByText('Your profile')).toBeInTheDocument()
    })
})
