import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getEmailIntegrations } from 'state/integrations/selectors'
import { isAdmin } from 'utils'
import { assumeMock } from 'utils/testing'

import { useEmailDomainVerificationBanner } from '../useEmailDomainVerificationBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/integrations/selectors', () => ({
    getEmailIntegrations: jest.fn(),
}))

const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('utils', () => ({
    isAdmin: jest.fn(),
}))

const isAdminMock = assumeMock(isAdmin)

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

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

const emailIntegrationMock = fromJS([
    {
        meta: {
            preferred: true,
            use_new_creds_version: true,
            outbound_verification_status: {
                single_sender: 'unverified',
                domain: 'unverified',
            },
            verified: false,
            provider: 'sendgrid',
            email_forwarding_activated: false,
            address: 'marko.kovacevic@gorgias.com',
            use_gmail_categories: false,
            import_activated: false,
            oauth: {
                status: 'success',
            },
            enable_gmail_threading: true,
            sync: {
                datetime: '2025-01-30 15:11:25.027082',
                expiration: '1738945459956',
                history_id: '96665',
            },
            enable_gmail_sending: true,
        },
        http: null,
        deactivated_datetime: null,
        application_id: null,
        name: 'Marko Kovacevic',
        user: {
            id: 464120316,
        },
        uri: '/api/integrations/126535/',
        decoration: null,
        locked_datetime: null,
        created_datetime: '2025-01-23T14:16:50.241363+00:00',
        type: 'gmail',
        id: 126535,
        description: null,
        updated_datetime: '2025-01-31T16:24:19.966526+00:00',
        managed: false,
    },
    {
        meta: {
            provider: 'sendgrid',
            outbound_verification_status: {
                single_sender: 'unverified',
                domain: 'success',
            },
            address: 'p1lk9gnee7jg7683@email.gorgias.com',
            preferred: false,
            verified: true,
            email_forwarding_activated: false,
        },
        http: null,
        deactivated_datetime: null,
        application_id: null,
        name: 'Markokovacevic Support',
        user: {
            id: 464120316,
        },
        uri: '/api/integrations/126534/',
        decoration: null,
        locked_datetime: null,
        created_datetime: '2025-01-23T14:15:21.920675+00:00',
        type: 'email',
        id: 126534,
        description: null,
        updated_datetime: '2025-01-23T14:16:22.663663+00:00',
        managed: false,
    },
]) as Map<any, any>[]

describe('useEmailDomainVerificationBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        mockUseFlag.mockReset()
        useAppSelectorMock.mockReset()
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Admin } }),
        )
    })

    it('should not call addBanner if FF is not enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDomainVerificationBanner: false,
                }
            }
        })
        isAdminMock.mockReturnValue(true)

        renderHook(useEmailDomainVerificationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with proper data when conditions are met', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDomainVerificationBanner: true,
                }
            }
        })

        isAdminMock.mockReturnValue(true)

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getEmailIntegrations) {
                return emailIntegrationMock
            }

            return null
        })

        renderHook(useEmailDomainVerificationBanner)

        expect(mockedAddBanner).toHaveBeenCalled()
    })

    it('should not render banner if isUserAdmin is false', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDomainVerificationBanner: true,
                }
            }
        })

        isAdminMock.mockReturnValue(false)

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getEmailIntegrations) {
                return emailIntegrationMock
            }

            return null
        })

        renderHook(useEmailDomainVerificationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should remove banner if all email integrations is resolved', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailDomainVerificationBanner: true,
                }
            }
        })

        isAdminMock.mockReturnValue(true)

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getEmailIntegrations) {
                return []
            }

            return null
        })

        renderHook(useEmailDomainVerificationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })
})
