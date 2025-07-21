import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { ImportStatus } from 'pages/settings/importZendesk/zendesk/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useZendeskImportFailedBanner } from '../useZendeskImportFailedBanner'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>,
)

const mockedAddBanner = jest.fn()
const mockedRemoveBanner = jest.fn()
const mockHistoryPush = jest.fn()

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

const INSTANCE_ID = 'zendesk-import-failure-banner'

const successfulIntegration = {
    id: 1,
    type: 'zendesk',
    meta: {
        status: ImportStatus.Success,
        continuous_import_enabled: true,
    },
}

const failedIntegration = {
    id: 1,
    type: 'zendesk',
    meta: {
        status: ImportStatus.Failure,
        continuous_import_enabled: true,
    },
}

const failedIntegrationContinuousImportDisabled = {
    id: 1,
    type: 'zendesk',
    meta: {
        status: ImportStatus.Failure,
        continuous_import_enabled: false,
    },
}

describe('useZendeskImportFailedBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        useAppSelectorMock.mockReset()
    })

    it('should call addBanner with proper data when conditions are met', () => {
        useAppSelectorMock.mockReturnValue([failedIntegration])

        renderHook(useZendeskImportFailedBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            'aria-label': 'Zendesk Import Failed Banner',
            category: BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            type: AlertBannerTypes.Warning,
            instanceId: INSTANCE_ID,
            preventDismiss: false,
            message: expect.any(Object),
            CTA: expect.objectContaining({
                type: 'action',
                text: 'View import data settings',
                onClick: expect.any(Function),
            }),
        })

        onclick = mockedAddBanner.mock.calls[0][0].CTA.onClick()
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/import-zendesk/zendesk/1',
        )
    })

    it('should call removeBanner when no failed integration exists', () => {
        useAppSelectorMock.mockReturnValue([successfulIntegration])

        renderHook(useZendeskImportFailedBanner)

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            INSTANCE_ID,
        )
    })

    it('should call removeBanner when continuous import is disabled', () => {
        useAppSelectorMock.mockReturnValue([
            failedIntegrationContinuousImportDisabled,
        ])

        renderHook(useZendeskImportFailedBanner)

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            INSTANCE_ID,
        )
    })

    it('should handle empty integrations list', () => {
        useAppSelectorMock.mockReturnValue([])

        renderHook(useZendeskImportFailedBanner)

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            INSTANCE_ID,
        )
    })
})
