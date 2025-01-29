import {render, screen} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'core/flags'
import {assumeMock} from 'utils/testing'

import {useSetBanners} from '../../hooks/useSetBanners'
import App from '../App'

jest.mock('core/flags', () => ({useFlag: jest.fn()}))
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
    jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/common/components/EmailDomainVerificationBanner/EmailDomainVerificationBanner',
    () => jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/common/components/EmailMigrationBanner/EmailMigrationBanner',
    () => jest.fn(() => <div>dull boy</div>)
)
jest.mock('pages/common/components/KeyboardHelp/KeyboardHelp', () =>
    jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/common/components/PhoneIntegrationBar/PhoneIntegrationBar',
    () => jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/ScriptTagMigrationBanner',
    () => jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/common/components/ScriptTagMigrationModal/ScriptTagMigrationModal',
    () => jest.fn(() => <div>dull boy</div>)
)
jest.mock('pages/common/components/SessionChangeDetection', () =>
    jest.fn(() => <div>dull boy</div>)
)
jest.mock('pages/common/components/Spotlight/Spotlight', () =>
    jest.fn(() => <div>dull boy</div>)
)
jest.mock(
    'pages/settings/yourProfile/twoFactorAuthentication/OutOfRecoveryCodesModal',
    () => jest.fn(() => <div>dull boy</div>)
)

jest.mock('AlertBanners', () => jest.fn(() => <div>banners</div>))

jest.mock('core/theme', () => ({useApplyTheme: jest.fn()}))
jest.mock('../../hooks/useSetBanners', () => ({
    useSetBanners: jest.fn(),
}))
jest.mock('../../hooks/useAppShortcuts', () => jest.fn(() => undefined))
jest.mock('../../hooks/usePollingManager', () => jest.fn(() => undefined))
jest.mock('../../hooks/useSharedLogic', () => jest.fn(() => undefined))
jest.mock('../../hooks/useActivityTracker', () => jest.fn(() => undefined))

describe('App component', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should render its children', () => {
        const child = '20-1RPZ'
        render(<App>{child}</App>)

        expect(screen.getByText(child)).toBeInTheDocument()
    })

    it('should apply the `globalNav` class to the AppNode', () => {
        useFlagMock.mockReturnValue(true)
        const {container} = render(<App>boop</App>)
        const child = container.firstChild as HTMLElement
        expect(child.classList.contains('globalNav')).toBe(true)
    })

    it('should use `useSetBanners` hook and render `AlertBanners`', () => {
        render(
            <App>
                <span role="img" aria-label="cool">
                    🆒
                </span>
            </App>
        )

        expect(useSetBanners).toHaveBeenCalledTimes(1)
        expect(screen.getByText('banners')).toBeInTheDocument()
    })
})
