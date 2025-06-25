import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'

import { useFlag } from 'core/flags'
import { THEME_NAME, useTheme } from 'core/theme'
import { useRedirectDeprecatedTicketRoutes } from 'tickets/core/hooks'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { useSetBanners } from '../../hooks/useSetBanners'
import App from '../App'

let history = createMemoryHistory()

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('common/notifications', () => ({
    NotificationsOverlay: () => <div>NotificationsOverlay</div>,
    NotificationsToasts: jest.fn(() => <div>toasts</div>),
}))
jest.mock('hooks/useHasPhone', () => jest.fn(() => true))
jest.mock('notifications', () => ({
    AlertNotifications: jest.fn(() => <div>alerts</div>),
}))
jest.mock('pages/common/components/EmailDisconnectedBanner', () =>
    jest.fn(() => <div>EmailDisconnectedBanner</div>),
)
jest.mock(
    'pages/common/components/EmailDomainVerificationBanner/EmailDomainVerificationBanner',
    () => jest.fn(() => <div>EmailDomainVerificationBanner</div>),
)
jest.mock(
    'pages/common/components/EmailMigrationBanner/EmailMigrationBanner',
    () => jest.fn(() => <div>EmailMigrationBanner</div>),
)
jest.mock('pages/common/components/KeyboardHelp/KeyboardHelp', () =>
    jest.fn(() => <div>KeyboardHelp</div>),
)
jest.mock(
    'pages/common/components/PhoneIntegrationBar/PhoneIntegrationBar',
    () => jest.fn(() => <div>PhoneIntegrationBar</div>),
)
jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner',
    () => jest.fn(() => <div>ScriptTagMigrationBanner</div>),
)
jest.mock(
    'pages/common/components/ScriptTagMigrationModal/ScriptTagMigrationModal',
    () => jest.fn(() => <div>ScriptTagMigrationModal</div>),
)
jest.mock('pages/common/components/SessionChangeDetection', () =>
    jest.fn(() => <div>SessionChangeDetection</div>),
)
jest.mock('pages/common/components/Spotlight/Spotlight', () =>
    jest.fn(() => <div>Spotlight</div>),
)
jest.mock(
    'pages/settings/yourProfile/twoFactorAuthentication/OutOfRecoveryCodesModal',
    () => jest.fn(() => <div>OutOfRecoveryCodesModal</div>),
)
jest.mock('tickets/core/hooks', () => ({
    useRedirectDeprecatedTicketRoutes: jest.fn(),
}))

jest.mock('AlertBanners', () => jest.fn(() => <div>AlertBanners</div>))
jest.mock('../../../../AlertBanners/components/ImpersonationBanner', () =>
    jest.fn(() => <div>ImpersonatedBanner</div>),
)

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useApplyTheme: jest.fn(),
    useTheme: jest.fn(),
}))
const useThemeMock = useTheme as jest.Mock

jest.mock('../../hooks/useSetBanners', () => ({
    useSetBanners: jest.fn(),
}))
jest.mock('../../hooks/useAppShortcuts', () => jest.fn(() => undefined))
jest.mock('../../hooks/usePollingManager', () => jest.fn(() => undefined))
jest.mock('../../hooks/useSharedLogic', () => jest.fn(() => undefined))
jest.mock('../../hooks/useActivityTracker', () => jest.fn(() => undefined))

describe('App component', () => {
    beforeEach(() => {
        history = createMemoryHistory()
        useFlagMock.mockReturnValue(false)
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Light })
    })

    it('should render its children', () => {
        const child = 'ChildComponent'
        renderWithRouter(<App>{child}</App>, { history })

        expect(screen.getByText(child)).toBeInTheDocument()
    })

    it('should apply the `globalNav` class to the AppNode', () => {
        useFlagMock.mockReturnValue(true)
        const { container } = renderWithRouter(<App>boop</App>, { history })
        const child = container.firstChild as HTMLElement
        expect(child.classList.contains('globalNav')).toBe(true)
    })

    it('should render banners when NOT in AI-Agent onboarding', () => {
        history.push('/app/home')

        renderWithRouter(
            <App>
                <span role="img" aria-label="cool">
                    🆒
                </span>
            </App>,
            { history },
        )

        expect(useSetBanners).toHaveBeenCalledTimes(1)
        expect(screen.getByText('AlertBanners')).toBeInTheDocument()
        expect(screen.getByText('ScriptTagMigrationBanner')).toBeInTheDocument()
        expect(
            screen.getByText('EmailDomainVerificationBanner'),
        ).toBeInTheDocument()
        expect(screen.getByText('EmailDisconnectedBanner')).toBeInTheDocument()
        expect(screen.getByText('EmailMigrationBanner')).toBeInTheDocument()
    })

    it('should NOT render banners when in AI-Agent onboarding (single step URL)', () => {
        history.push('/app/ai-agent/onboarding')

        renderWithRouter(
            <App>
                <span role="img" aria-label="cool">
                    🆒
                </span>
            </App>,
            { history },
        )

        expect(screen.queryByText('AlertBanners')).not.toBeInTheDocument()
        expect(
            screen.queryByText('ScriptTagMigrationBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailDomainVerificationBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailDisconnectedBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailMigrationBanner'),
        ).not.toBeInTheDocument()
    })

    it('should NOT render banners when in AI-Agent onboarding (shop-specific URL)', () => {
        history.push('/app/ai-agent/shopify/store-name/onboarding')

        renderWithRouter(
            <App>
                <span role="img" aria-label="cool">
                    🆒
                </span>
            </App>,
            { history },
        )

        expect(screen.queryByText('AlertBanners')).not.toBeInTheDocument()
        expect(
            screen.queryByText('ScriptTagMigrationBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailDomainVerificationBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailDisconnectedBanner'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('EmailMigrationBanner'),
        ).not.toBeInTheDocument()
    })

    it('should call the `useRedirectDeprecatedTicketRoutes` hook', () => {
        renderWithRouter(<App>boop</App>)
        expect(useRedirectDeprecatedTicketRoutes).toHaveBeenCalledWith()
    })
})
