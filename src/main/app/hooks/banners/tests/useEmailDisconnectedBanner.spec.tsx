import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { BannerCategories } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getDeactivatedOAuthEmailIntegrations } from 'state/integrations/selectors'
import { assumeMock } from 'utils/testing'

import { useEmailDisconnectedBanner } from '../useEmailDisconnectedBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

const mockedAddBanner = jest.fn()
const mockedRemoveBanner = jest.fn()
jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

jest.mock('state/currentUser/selectors', () => ({
    ...jest.requireActual('state/currentUser/selectors'),
    getCurrentUser: jest.fn(),
}))
const mockedGetCurrentUser = assumeMock(getCurrentUser)

jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getDeactivatedOAuthEmailIntegrations: jest.fn(),
}))
const mockedGetDeactivatedOAuthEmailIntegrations = assumeMock(
    getDeactivatedOAuthEmailIntegrations,
)

const mockStore = configureStore([])

describe('useEmailDisconnectedBanner', () => {
    beforeEach(() => {
        mockUseFlag.mockReset()
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        mockedGetCurrentUser.mockReset()
        mockedGetCurrentUser.mockReturnValue(
            fromJS({
                role: { name: UserRole.Admin },
            }),
        )
        mockedGetDeactivatedOAuthEmailIntegrations.mockReset()
        mockedGetDeactivatedOAuthEmailIntegrations.mockReturnValue([
            {
                address: 'bob@acme.com',
                reconnectUrl:
                    '/integrations/gmail/pre-callback?integration_id=404',
            },
            {
                address: 'bob@onmicrosoft.acme.com',
                reconnectUrl:
                    '/integrations/outlook/pre-callback?integration_id=418',
            },
        ])
    })

    it('should not call addBanner if FF is not enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: false,
                }
            }
        })

        renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={mockStore()}>{children}</Provider>
            ),
        })

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with the banner for admins', () => {
        renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={mockStore()}>{children}</Provider>
            ),
        })

        expect(mockedAddBanner).toHaveBeenCalledTimes(2)
        expect(
            mockedAddBanner.mock.calls.map(([banner]) => [
                banner.CTA.href,
                renderToStaticMarkup(banner.message),
            ]),
        ).toEqual([
            [
                '/integrations/gmail/pre-callback?integration_id=404',
                'Your email account bob@acme.com is disconnected. Follow the steps in the reconnection email to restore email access.',
            ],
            [
                '/integrations/outlook/pre-callback?integration_id=418',
                'Your email account bob@onmicrosoft.acme.com is disconnected. Follow the steps in the reconnection email to restore email access.',
            ],
        ])
    })

    it('should call addBanner with the banner for agents', () => {
        mockedGetCurrentUser.mockReturnValue(
            fromJS({
                role: { name: UserRole.Agent },
            }),
        )

        renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={mockStore()}>{children}</Provider>
            ),
        })

        expect(mockedAddBanner).toHaveBeenCalledTimes(2)
        expect(
            mockedAddBanner.mock.calls.map(([banner]) =>
                renderToStaticMarkup(banner.message),
            ),
        ).toEqual([
            'The email account bob@acme.com is disconnected. Only the Account Owner or an Admin can reconnect it. Please contact them for assistance.',
            'The email account bob@onmicrosoft.acme.com is disconnected. Only the Account Owner or an Admin can reconnect it. Please contact them for assistance.',
        ])
        expect(
            mockedAddBanner.mock.calls.map(([banner]) => banner.CTA),
        ).toEqual([undefined, undefined])
    })

    it('should call removeBanner for banners that need to be removed', () => {
        // run the hook and check that the banners state got updated
        const { rerender } = renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={mockStore()}>{children}</Provider>
            ),
        })
        expect(mockedAddBanner).toHaveBeenCalledTimes(2)
        mockedAddBanner.mockReset()

        // now change the integrations' state
        mockedGetDeactivatedOAuthEmailIntegrations.mockReturnValue([
            {
                address: 'bob@onmicrosoft.acme.com',
                reconnectUrl: '/integrations/outlook/pre-callback',
            },
        ])

        rerender()

        // check that we remove the banner for bob@acme.com
        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.EMAIL_DISCONNECTED,
            'email-disconnected-banner-bob@acme.com',
        )
    })
})
