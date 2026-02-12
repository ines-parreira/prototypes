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
    useHelpdeskV2BaselineFlag: jest.fn(),
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

const { useFlag, useHelpdeskV2BaselineFlag } = jest.requireMock(
    '@repo/feature-flags',
)
const useFlagMock = useFlag as jest.Mock
const useHelpdeskV2BaselineFlagMock = useHelpdeskV2BaselineFlag as jest.Mock

jest.mock('../AvailabilityToggle', () => () => <div>AvailabilityToggle</div>)
jest.mock('../AxiomMigrationToggle', () => ({
    AxiomMigrationToggle: () => <div>AxiomMigrationToggle</div>,
}))
jest.mock('../HelpdeskV2BetaToggle', () => ({
    HelpdeskV2BetaToggle: () => <div>HelpdeskV2BetaToggle</div>,
}))
jest.mock('../MainNavigation', () => () => <div>MainNavigation</div>)
jest.mock(
    '../StatusMenu',
    () =>
        ({ onUpdateStatusStart }: { onUpdateStatusStart: () => void }) => (
            <div>
                StatusMenu
                <button onClick={onUpdateStatusStart}>MockStatusUpdate</button>
            </div>
        ),
)
jest.mock('../ThemeMenu', () => () => <div>ThemeMenu</div>)

jest.mock('@repo/agent-status', () => ({
    UserInfoHeaderContainer: () => <div>UserInfoHeaderContainer</div>,
    useUserAvailabilityStatus: jest.fn(() => ({
        status: undefined,
        isLoading: false,
    })),
    useAgentPhoneStatus: jest.fn(() => ({
        agentPhoneUnavailabilityStatus: undefined,
        isLoading: false,
    })),
}))

const { useUserAvailabilityStatus, useAgentPhoneStatus } =
    jest.requireMock('@repo/agent-status')
const useUserAvailabilityStatusMock = useUserAvailabilityStatus as jest.Mock
const useAgentPhoneStatusMock = useAgentPhoneStatus as jest.Mock

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
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: jest.fn(),
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
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: undefined,
            isLoading: false,
        })
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

    it('should render the AxiomMigrationToggle when axiom migration flag is enabled and baseline flag is disabled', () => {
        useAxiomMigrationMock.mockReturnValue({ hasFlag: true })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('AxiomMigrationToggle')).toBeInTheDocument()
    })

    it('should not render the AxiomMigrationToggle when axiom migration flag is enabled but baseline flag is also enabled', () => {
        useAxiomMigrationMock.mockReturnValue({ hasFlag: true })
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: jest.fn(),
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(
            screen.queryByText('AxiomMigrationToggle'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('HelpdeskV2BetaToggle')).toBeInTheDocument()
    })

    it('should not render the agent status components when CustomAgentUnavailableStatuses feature flag is disabled', () => {
        useFlagMock.mockImplementation((key: string) => {
            if (key === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return false
            }
            return false
        })
        render(<UserMenu onClose={onClose} />, { wrapper })

        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
        expect(screen.queryByText('Status:')).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', {
                name: /change status.*current status: available/i,
            }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('UserInfoHeaderContainer'),
        ).not.toBeInTheDocument()
    })
    it('should render the agent status components when CustomAgentUnavailableStatuses feature flag is enabled', () => {
        useUserAvailabilityStatusMock.mockReturnValue({
            status: {
                id: 'available',
                name: 'Available',
            },
            isLoading: false,
        })
        useFlagMock.mockImplementation((key: string) => {
            if (key === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return true
            }
            return false
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('UserInfoHeaderContainer')).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /change status.*current status: available/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(ignoreHTML('Status:Available')),
        ).toBeInTheDocument()
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
        expect(getByText('Gorgias Academy')).toBeInTheDocument()
        expect(getByText('Gorgias Community')).toBeInTheDocument()
        expect(getByText('Keyboard shortcuts')).toBeInTheDocument()
    })

    it.each([
        ['Help Center', 'helpdocs'],
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

    it('should disable status button when agent is on a call', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: {
                id: 'available',
                name: 'Available',
            },
            isLoading: false,
        })
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'on-a-call',
                name: 'On a call',
            },
            isLoading: false,
        })

        render(<UserMenu onClose={onClose} />, { wrapper })

        // The button still uses the regular status name in aria-label, but is disabled
        const statusButton = screen.getByRole('button', {
            name: /change status.*current status: available/i,
        })
        expect(statusButton).toBeDisabled()
        expect(
            screen.getByText(ignoreHTML('Status:On a call')),
        ).toBeInTheDocument()
    })

    it('should hide chevron icon when status button is disabled due to phone status', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: undefined,
            isLoading: false,
        })
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'call-wrap-up',
                name: 'Call wrap-up',
            },
            isLoading: false,
        })

        render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        const statusButton = screen.getByRole('button', {
            name: /change status.*current status: none/i,
        })
        expect(statusButton).toBeDisabled()
        expect(
            screen.getByText(ignoreHTML('Status:Call wrap-up')),
        ).toBeInTheDocument()

        // Verify chevron icon is not rendered within the status button
        const buttonContent = statusButton.querySelector('.material-icons')
        expect(buttonContent?.textContent).not.toBe('chevron_right')
    })

    it('should display phone unavailability status text over regular status', () => {
        const useFlag = require('@repo/feature-flags').useFlag
        useFlag.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: {
                id: 'available',
                name: 'Available',
            },
            isLoading: false,
        })
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'on-a-call',
                name: 'On a call',
            },
            isLoading: false,
        })

        render(<UserMenu onClose={onClose} />, { wrapper })

        // Should show phone status instead of regular availability status
        expect(
            screen.getByText(ignoreHTML('Status:On a call')),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(ignoreHTML('Status:Available')),
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
        expect(screen.queryByText('AvailabilityToggle')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /change status.*current status: available/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Your profile')).toBeInTheDocument()
    })

    it('should navigate back to main menu when status is updated', () => {
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

        userEvent.click(getByText('MockStatusUpdate'))

        expect(screen.queryByText('StatusMenu')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /change status.*current status: available/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Your profile')).toBeInTheDocument()
    })
    it('should render the HelpdeskV2BetaToggle when baseline flag is enabled', () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: jest.fn(),
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('HelpdeskV2BetaToggle')).toBeInTheDocument()
    })

    it('should not render the HelpdeskV2BetaToggle when baseline flag is disabled', () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: jest.fn(),
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(
            screen.queryByText('HelpdeskV2BetaToggle'),
        ).not.toBeInTheDocument()
    })
})
