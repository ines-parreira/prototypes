import type { ReactNode } from 'react'

import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { StaticRouter } from 'react-router-dom'

import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { getCurrentUser } from 'state/currentUser/selectors'
import { ignoreHTML } from 'tests/ignoreHTML'

import { UserMenu } from '../UserMenu'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2BaselineFlag: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
jest.mock('pages/common/components/NoticeableIndicator', () => ({
    NoticeIndicator: () => <div>NoticeableIndicator</div>,
}))
jest.mock('hooks/useAppSelector', () => ({
    useAppSelector: (fn: () => void) => fn(),
}))

jest.mock('@repo/activity-tracker', () => ({
    ...jest.requireActual('@repo/activity-tracker'),
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

const { useHelpdeskV2BaselineFlag } = jest.requireMock('@repo/feature-flags')
const useHelpdeskV2BaselineFlagMock = useHelpdeskV2BaselineFlag as jest.Mock

jest.mock('../AvailabilityToggle', () => ({
    AvailabilityToggle: () => <div>AvailabilityToggle</div>,
}))
jest.mock('../HelpdeskV2BetaToggle', () => ({
    HelpdeskV2BetaToggle: () => <div>HelpdeskV2BetaToggle</div>,
}))
jest.mock('../MainNavigation', () => ({
    MainNavigation: () => <div>MainNavigation</div>,
}))
jest.mock('../StatusMenu', () => ({
    StatusMenu: ({
        onUpdateStatusStart,
    }: {
        onUpdateStatusStart: () => void
    }) => (
        <div>
            StatusMenu
            <button onClick={onUpdateStatusStart}>MockStatusUpdate</button>
        </div>
    ),
}))
jest.mock('../ThemeMenu', () => ({ ThemeMenu: () => <div>ThemeMenu</div> }))

jest.mock('@repo/agent-status', () => ({
    UserInfoHeaderContainer: () => <div>UserInfoHeaderContainer</div>,
    useUserAvailabilityStatus: jest.fn(() => ({
        status: undefined,
        isLoading: false,
    })),
    useAgentPhoneStatus: jest.fn(() => ({
        agentPhoneUnavailabilityStatus: undefined,
        isOnActiveCall: false,
        isLoading: false,
    })),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

const {
    useUserAvailabilityStatus,
    useAgentPhoneStatus,
    useCustomAgentUnavailableStatusesFlag,
} = jest.requireMock('@repo/agent-status')
const useUserAvailabilityStatusMock = useUserAvailabilityStatus as jest.Mock
const useAgentPhoneStatusMock = useAgentPhoneStatus as jest.Mock
const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock

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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
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
            isOnActiveCall: false,
            isLoading: false,
        })
    })

    it('should render the main screen', () => {
        render(<UserMenu onClose={onClose} />, {
            wrapper,
        })

        expect(screen.getByText('AvailabilityToggle')).toBeInTheDocument()
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

    it('refetches phone status on every menu mount', () => {
        render(<UserMenu onClose={onClose} />, { wrapper })

        expect(useAgentPhoneStatusMock).toHaveBeenCalledWith(
            expect.objectContaining({ refetchOnMount: 'always' }),
        )
    })

    it('should render the HelpdeskV2BetaToggle when the baseline flag is enabled', () => {
        useHelpdeskV2BaselineFlagMock.mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: jest.fn(),
        })
        render(<UserMenu onClose={onClose} />, { wrapper })
        expect(screen.getByText('HelpdeskV2BetaToggle')).toBeInTheDocument()
    })

    it('should not render the agent status components when CustomAgentUnavailableStatuses feature flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
            isOnActiveCall: true,
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

    it('should enable status button during wrap-up so agents can go off-queue', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: undefined,
            isLoading: false,
        })
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'call-wrap-up',
                name: 'Call wrap-up',
            },
            isOnActiveCall: false,
            isLoading: false,
        })

        render(<UserMenu onClose={onClose} />, { wrapper })

        const statusButton = screen.getByRole('button', {
            name: /change status.*current status: none/i,
        })
        expect(statusButton).not.toBeDisabled()
        expect(
            screen.getByText(ignoreHTML('Status:Call wrap-up')),
        ).toBeInTheDocument()
    })

    it('should hide chevron icon when status button is disabled during an active call', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useUserAvailabilityStatusMock.mockReturnValue({
            status: undefined,
            isLoading: false,
        })
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'on-a-call',
                name: 'On a call',
            },
            isOnActiveCall: true,
            isLoading: false,
        })

        render(<UserMenu onClose={onClose} />, { wrapper })

        const statusButton = screen.getByRole('button', {
            name: /change status.*current status: none/i,
        })
        expect(statusButton).toBeDisabled()

        const buttonContent = statusButton.querySelector('.material-icons')
        expect(buttonContent?.textContent).not.toBe('chevron_right')
    })

    it('should display phone unavailability status text over regular status', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
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
