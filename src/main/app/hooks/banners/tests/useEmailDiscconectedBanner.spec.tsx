import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {useLocation} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getInactiveEmailChannels} from 'state/integrations/selectors'
import {assumeMock} from 'utils/testing'

import {useEmailDisconnectedBanner} from '../useEmailDisconnectedBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock
const mockHistoryPush = jest.fn()

const mockLocation = '/app/settings/channels/email'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
            useLocation: jest.fn(),
        }) as Record<string, unknown>
)
const mockUseLocation = assumeMock(useLocation)

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/integrations/selectors', () => ({
    getInactiveEmailChannels: jest.fn(),
}))

const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('utils', () => ({
    isAdmin: jest.fn(),
}))

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
        }) as Record<string, unknown>
)

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

const emailIntegrationMock = fromJS([
    {
        isDeactivated: true,
        verified: true,
        name: 'Test Test',
        address: 'test@test.com',
        isDefault: false,
        type: 'email',
        id: 12031,
    },
]) as Map<any, any>[]

describe('useEmailDomainVerificationBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        mockUseFlag.mockReset()
        useAppSelectorMock.mockReset()
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.Admin}})
        )
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

    it('should call addBanner with proper data when conditions are met', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })

        mockUseLocation.mockReturnValue({
            pathname: '/app/settings',
            search: '',
            state: undefined,
            hash: '',
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getInactiveEmailChannels) {
                return emailIntegrationMock
            }

            return null
        })
        renderHook(useEmailDisconnectedBanner)

        expect(mockedAddBanner).toHaveBeenCalled()
        const mockCalls = mockedAddBanner.mock.calls as Array<
            [
                {
                    CTA: {
                        type: string
                        text: string
                        onClick: () => void
                    }
                },
            ]
        >
        const bannerCTA = mockCalls[0][0].CTA

        bannerCTA.onClick()

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/channels/email'
        )
    })

    it('should not call addBanner, and should call removeBanner when user is on settings channels page', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })

        mockUseLocation.mockReturnValue({
            pathname: mockLocation,
            search: '',
            state: undefined,
            hash: '',
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getInactiveEmailChannels) {
                return emailIntegrationMock
            }

            return null
        })
        renderHook(useEmailDisconnectedBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalled()
    })

    it('should not call addBanner when state is empty', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDisconnectedBanner: true,
                }
            }
        })

        mockUseLocation.mockReturnValue({
            pathname: '/test',
            search: '',
            state: undefined,
            hash: '',
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getInactiveEmailChannels) {
                return []
            }

            return null
        })
        renderHook(useEmailDisconnectedBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })
})
