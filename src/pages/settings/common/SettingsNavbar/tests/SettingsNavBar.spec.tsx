import React from 'react'

import { screen } from '@testing-library/react'
import type { Location } from 'history'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { useLocation } from 'react-router-dom'

import { logEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { closePanels } from 'state/layout/actions'
import { hasRole } from 'utils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import * as config from '../config'
import SettingsNavbar from '../SettingsNavbar'

const mockedDispatch = jest.fn()
jest.mock('utils')
jest.mock('common/navigation', () => ({
    ActiveContent: { Settings: 'settings' },
    Navbar: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { SettingsNavigationClicked: 'navEvent' },
}))
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/billing/selectors', () => ({
    getHasAutomate: jest.fn(() => false),
}))
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))
jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountState: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(() => [
        {
            id: '1',
            name: 'Integration 1',
            type: 'integration',
        },
    ]),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('../NewUI', () => () => <div>New UI</div>)
const mockUseFlag = useFlag as jest.Mock

const mockedHasRole = assumeMock(hasRole)
const mockedLogEvent = assumeMock(logEvent)
const mockedGetCurrentUser = assumeMock(getCurrentUser)
const mockedGetCurrentAccountState = assumeMock(getCurrentAccountState)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(),
}))
const useLocationMock = assumeMock(useLocation)

describe('<SettingsNavbar />', () => {
    beforeEach(() => {
        useLocationMock.mockReturnValue({ pathname: '/' } as Location)
        mockUseFlag.mockReturnValue(false)
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                icon: 'speed',
                links: [
                    {
                        to: 'whatever',
                        text: 'Link',
                        requiredRole: 'toto' as UserRole,
                    },
                ],
            },
        ])
        mockedHasRole.mockReturnValue(true)
    })

    it('should render a category if the `shouldRender` function returns true', () => {
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                icon: 'speed',
                shouldRender: () => true,
                links: [
                    {
                        to: 'whatever',
                        text: 'Link',
                        requiredRole: 'toto' as UserRole,
                    },
                ],
            },
        ])
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/whatever',
        } as Location)
        renderWithRouter(<SettingsNavbar />)

        expect(screen.getByText('Link')).toBeInTheDocument()
        expect(screen.getByText('Link')).toHaveClass('active')
    })

    it('should not render a category if the `shouldRender` function returns false', () => {
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                icon: 'speed',
                shouldRender: () => false,
                links: [
                    {
                        to: 'whatever',
                        text: 'Link',
                        requiredRole: 'toto' as UserRole,
                    },
                ],
            },
        ])
        renderWithRouter(<SettingsNavbar />)

        expect(screen.queryByText('Link')).not.toBeInTheDocument()
    })

    it('should dispatch `closePanels` action when a link is clicked and call logEvent', () => {
        mockedGetCurrentAccountState.mockReturnValue(fromJS({}))
        renderWithRouter(<SettingsNavbar />)

        screen.getByText('Link').click()

        expect(mockedDispatch).toHaveBeenCalledWith(closePanels())
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(mockedLogEvent).toHaveBeenCalledWith('navEvent', {
            title: 'Link',
            account_domain: undefined,
        })
        expect(mockedLogEvent).toHaveBeenCalledTimes(1)
    })

    it("should render links when their `requiredRole` key does match the user's role", () => {
        mockedGetCurrentUser.mockReturnValue(
            'toto' as unknown as ReturnType<typeof getCurrentUser>,
        )
        mockedHasRole.mockReturnValue(false)

        const { rerenderComponent } = renderWithRouter(<SettingsNavbar />)

        expect(mockedHasRole).toHaveBeenNthCalledWith(1, 'toto', 'toto')
        expect(screen.queryByText('Link')).not.toBeInTheDocument()

        mockedHasRole.mockReturnValue(true)
        rerenderComponent(<SettingsNavbar />)

        expect(screen.getByText('Link')).toBeInTheDocument()
    })

    it('should render links when their `requiredFeatureFlags` key does match a feature flag which returns true', () => {
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                icon: 'speed',
                links: [
                    {
                        to: 'whatever',
                        text: 'True',
                        requiredFeatureFlags: ['matchesTrue' as FeatureFlagKey],
                    },
                    {
                        to: 'whatever',
                        text: 'False',
                        requiredFeatureFlags: [
                            'matchesFalse' as FeatureFlagKey,
                        ],
                    },
                ],
            },
        ])
        mockFlags({
            ['matchesTrue']: true,
            ['matchesFalse']: false,
        })

        renderWithRouter(<SettingsNavbar />)

        expect(screen.getByText('True')).toBeInTheDocument()
        expect(screen.queryByText('False')).not.toBeInTheDocument()
    })

    it('should render new UI when flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(<SettingsNavbar />)

        expect(screen.getByText('New UI')).toBeInTheDocument()
        expect(screen.queryByText('Link')).not.toBeInTheDocument()
    })

    it('should handle alternate text if user does not have a password', () => {
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                links: [
                    {
                        to: 'password-2fa',
                        text: 'Link',
                    },
                ],
            },
        ])
        mockedGetCurrentUser.mockReturnValue(fromJS({}))
        renderWithRouter(<SettingsNavbar />)

        expect(screen.queryByText('2FA')).toBeInTheDocument()
    })

    it('should not set `integrations` as active when on `integrations/mine`', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/integrations/mine',
        } as Location)
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                links: [
                    {
                        to: 'integrations',
                        text: 'Link',
                    },
                ],
            },
        ])
        renderWithRouter(<SettingsNavbar />)

        expect(screen.getByText('Link')).not.toHaveClass('active')
    })

    it('should not set `integrations` as active when on `integrations/http`', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/settings/integrations/http',
        } as Location)
        jest.replaceProperty(config, 'NavbarConfig', [
            {
                name: 'Category',
                links: [
                    {
                        to: 'integrations',
                        text: 'Link',
                    },
                ],
            },
        ])
        renderWithRouter(<SettingsNavbar />)

        expect(screen.getByText('Link')).not.toHaveClass('active')
    })
})
