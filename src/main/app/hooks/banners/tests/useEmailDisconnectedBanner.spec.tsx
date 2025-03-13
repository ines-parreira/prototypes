import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { BannerCategories } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'

import { useEmailDisconnectedBanner } from '../useEmailDisconnectedBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

const mockedAddBanner = jest.fn()
const mockedRemoveCategory = jest.fn()
jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeCategory: mockedRemoveCategory,
            }),
        }) as Record<string, unknown>,
)

const mockStore = configureStore([])
const state = {
    currentUser: fromJS({
        role: { name: UserRole.Admin },
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'gmail',
                meta: { address: 'alice@acme.com' },
                deactivated_datetime: null,
            },
            {
                id: 2,
                type: 'gmail',
                meta: { address: 'bob@acme.com' },
                deactivated_datetime: '2025-03-12T00:13:40.385400',
            },
            {
                id: 3,
                type: 'outlook',
                meta: { address: 'alice@onmicrosoft.acme.com' },
                deactivated_datetime: null,
            },
            {
                id: 4,
                type: 'outlook',
                meta: { address: 'bob@onmicrosoft.acme.com' },
                deactivated_datetime: '2025-03-11T12:17:50.000000',
            },
        ],
        authentication: {
            gmail: { redirect_uri: '/integrations/gmail/pre-callback' },
            outlook: { redirect_uri: '/integrations/outlook/pre-callback' },
        },
    }),
}

describe('useEmailDisconnectedBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveCategory.mockReset()
        mockUseFlag.mockReset()
    })

    it('should not call addBanner if FF is not enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: false,
                }
            }
        })

        renderHook(useEmailDisconnectedBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with the banner for admins', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })
        const store = mockStore(state)
        const openSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(mockedRemoveCategory).toHaveBeenCalledWith(
            BannerCategories.EMAIL_DISCONNECTED,
        )
        expect(mockedAddBanner).toHaveBeenCalledTimes(2)
        mockedAddBanner.mock.calls.forEach(([banner]) => banner.CTA.onClick())
        expect(openSpy.mock.calls).toEqual([
            ['/integrations/gmail/pre-callback?integration_id=2'],
            ['/integrations/outlook/pre-callback?integration_id=4'],
        ])
        expect(
            mockedAddBanner.mock.calls.map(([banner]) =>
                renderToStaticMarkup(banner.message),
            ),
        ).toEqual([
            'Your email account bob@acme.com is disconnected. Follow the steps in the reconnection email to restore email access.',
            'Your email account bob@onmicrosoft.acme.com is disconnected. Follow the steps in the reconnection email to restore email access.',
        ])
    })

    it('should call addBanner with the banner for agents', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })
        const store = mockStore({
            ...state,
            currentUser: fromJS({
                role: { name: UserRole.Agent },
            }),
        })

        renderHook(useEmailDisconnectedBanner, {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        expect(mockedRemoveCategory).toHaveBeenCalledWith(
            BannerCategories.EMAIL_DISCONNECTED,
        )
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
})
