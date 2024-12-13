import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React from 'react'

import {logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'
import {hasRole} from 'utils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import * as config from '../config'
import SettingsNavbar from '../SettingsNavbar'

const mockedDispatch = jest.fn()
jest.mock('utils')
jest.mock('common/navigation', () => ({
    ActiveContent: {Settings: 'settings'},
}))
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {SettingsNavigationClicked: 'navEvent'},
}))
jest.mock(
    'pages/common/components/Navbar',
    () =>
        ({children}: {children: React.ReactNode}) => <div>{children}</div>
)
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))
jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountState: jest.fn(),
}))

const mockedHasRole = assumeMock(hasRole)
const mockedLogEvent = assumeMock(logEvent)
const mockedGetCurrentUser = assumeMock(getCurrentUser)
const mockedGetCurrentAccountState = assumeMock(getCurrentAccountState)

describe('<SettingsNavbar />', () => {
    beforeEach(() => {
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

    it('should dispatch `closePanels` action when a link is clicked and call logEvent', () => {
        mockedGetCurrentAccountState.mockReturnValue(fromJS({}))
        renderWithRouter(<SettingsNavbar />, {path: '/'})

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
            'toto' as unknown as ReturnType<typeof getCurrentUser>
        )
        mockedHasRole.mockReturnValue(false)

        const {rerenderComponent} = renderWithRouter(<SettingsNavbar />, {
            path: '/',
        })

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

        renderWithRouter(<SettingsNavbar />, {path: '/'})

        expect(screen.getByText('True')).toBeInTheDocument()
        expect(screen.queryByText('False')).not.toBeInTheDocument()
    })
})
