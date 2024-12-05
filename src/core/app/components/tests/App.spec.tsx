import {render, screen} from '@testing-library/react'
import React from 'react'

import {useSetBanners} from '../../hooks/useSetBanners'
import App from '../App'

jest.mock('common/notifications', () => ({
    NotificationsToasts: jest.fn(() => <div>toasts</div>),
}))
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

jest.mock('theme', () => ({useTheme: () => 'theme'}))
jest.mock('../../hooks/useSetBanners', () => ({
    useSetBanners: jest.fn(),
}))
jest.mock('../../hooks/useHasPhone', () => jest.fn(() => true))
jest.mock('../../hooks/useAppShortcuts', () => jest.fn(() => undefined))
jest.mock('../../hooks/usePollingManager', () => jest.fn(() => undefined))
jest.mock('../../hooks/useSharedLogic', () => jest.fn(() => undefined))
jest.mock('../../hooks/useActivityTracker', () => jest.fn(() => undefined))

describe('App component', () => {
    it('should render its children', () => {
        const child = '20-1RPZ'
        render(<App>{child}</App>)

        expect(screen.getByText(child)).toBeInTheDocument()
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
