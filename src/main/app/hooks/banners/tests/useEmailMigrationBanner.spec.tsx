import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { AlertBannerCTATypes, AlertBannerTypes } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import * as helpers from 'pages/common/components/EmailMigrationBanner/helpers'
import * as migrationBannerHook from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import { getEmailMigrationStatus } from 'state/integrations/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useEmailMigrationBanner } from '../useEmailMigrationBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock
const mockHistoryPush = jest.fn()

const mockLocation = '/app/settings/channels/email/migration'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
            useLocation: jest.fn(),
        }) as Record<string, unknown>,
)
const mockUseLocation = assumeMock(useLocation)

jest.mock('state/integrations/selectors', () => ({
    getEmailMigrationStatus: jest.fn(),
}))

const mockFetchMigrationStatus = jest.fn()
jest.spyOn(migrationBannerHook, 'default').mockImplementation(
    () => mockFetchMigrationStatus,
)

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

const computeBannerSpy = jest.spyOn(
    helpers,
    'computeEmailMigrationStatusBanner',
)

const useAppSelectorMock = assumeMock(useAppSelector)

const bannerConfigObj = {
    CTA: {
        type: 'action' as const,
        text: 'Finish Migration',
        onClick: () => {},
    } satisfies AlertBannerCTATypes,
    message:
        '<strong>Deadline missed:</strong> Please migrate your email integrations...',
    type: AlertBannerTypes.Critical,
    preventDismiss: true,
}

const bannerConfig = fromJS({ ...bannerConfigObj })

describe('useEmailMigrationBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        mockUseFlag.mockReset()
        useAppSelectorMock.mockReset()
        mockFetchMigrationStatus.mockReset()
        mockUseLocation.mockReset()
    })

    it('should not call addBanner if FF is not enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: false,
                }
            }
        })

        renderHook(useEmailMigrationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not call addBanner, and should call removeBanner when user is on settings page', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
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
            if (selector === getEmailMigrationStatus) {
                return bannerConfig as unknown
            }

            return null
        })
        renderHook(useEmailMigrationBanner)
        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalled()
    })

    it('should not call addBanner when state is empty', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
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
            if (selector === getEmailMigrationStatus) {
                return []
            }

            return null
        })
        renderHook(useEmailMigrationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with proper data when conditions are met', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
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
            if (selector === getEmailMigrationStatus) {
                return bannerConfig as unknown
            }

            return null
        })

        computeBannerSpy.mockReturnValue({ ...bannerConfigObj })

        renderHook(useEmailMigrationBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            category: 'email_migration_banner',
            instanceId: 'email_migration',
            type: bannerConfigObj.type,
            message: bannerConfigObj.message,
            preventDismiss: true,
            CTA: {
                text: bannerConfigObj?.CTA?.text,
                type: bannerConfigObj?.CTA?.type,
                onClick: bannerConfigObj?.CTA.onClick,
            },
        })
    })

    it('should fetch migration status on mount', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
                }
            }
        })
        mockUseLocation.mockReturnValue({
            pathname: '/app',
            search: '',
            state: undefined,
            hash: '',
        })
        renderHook(useEmailMigrationBanner)

        expect(mockFetchMigrationStatus).toHaveBeenCalledTimes(1)
    })

    it('should navigate to migration page when CTA is clicked', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
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
            if (selector === getEmailMigrationStatus) {
                return bannerConfig as unknown
            }
            return null
        })

        let capturedOnClick: (() => void) | undefined

        computeBannerSpy.mockImplementation((status, onClick) => {
            capturedOnClick = onClick
            return { ...bannerConfigObj }
        })

        renderHook(useEmailMigrationBanner)

        capturedOnClick?.()

        expect(mockHistoryPush).toHaveBeenCalledWith(mockLocation)
    })

    it('should use empty string when banner message is null', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    emailMigrationBanner: true,
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
            if (selector === getEmailMigrationStatus) {
                return bannerConfig as unknown
            }
            return null
        })

        computeBannerSpy.mockReturnValue({
            ...bannerConfigObj,
            message: null,
        })

        renderHook(useEmailMigrationBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                message: '',
            }),
        )
    })
})
