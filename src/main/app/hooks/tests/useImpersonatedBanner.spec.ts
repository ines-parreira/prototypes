import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import { useImpersonatedBanner } from '../useImpersonatedBanner'

const mockedAddBanner = jest.fn()
jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => {
                return { addBanner: mockedAddBanner }
            },
        }) as Record<string, unknown>,
)
jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

describe('useImpersonatedBanner', () => {
    afterEach(() => {
        window.USER_IMPERSONATED = null
    })

    it('should not call addBanner if user isn’t impersonated', () => {
        renderHook(useImpersonatedBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with proper data if user is impersonated', () => {
        window.USER_IMPERSONATED = true
        window.GORGIAS_CLUSTER = 'cluster'
        useAppSelectorMock.mockReturnValue(
            fromJS({
                id: '1',
                email: 'heya',
            }),
        )

        renderHook(useImpersonatedBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            preventDismiss: true,
            category: BannerCategories.IMPERSONATION,
            instanceId: BannerCategories.IMPERSONATION,
            type: AlertBannerTypes.Warning,
            message: `Impersonating <b>heya</b> in <b>development</b> environment.
                [<b>cluster:</b> '${window.GORGIAS_CLUSTER}', <b>account_id:</b> 1, <b>user_id:</b> 1]`,
        })
    })
})
