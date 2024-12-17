import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import {BannerActionTypes, useBannersDispatchContext} from '../../Context'
import {useDismissedStorage} from '../../Storage'
import {BannerCategories, ContextBanner} from '../../types'
import {useBanners} from '../useBanners'

jest.mock('../../Context', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../Context'),
    useBannersDispatchContext: jest.fn(),
}))
jest.mock('../../Storage', () => {
    return {
        useDismissedStorage: jest.fn(),
    }
})

const useBannersDispatchContextMock = assumeMock(useBannersDispatchContext)
const useDismissedStorageMock = assumeMock(useDismissedStorage)

const data: ContextBanner = {
    category: BannerCategories.IMPERSONATION,
    instanceId: '1',
    message: 'Test',
}

describe('useBanners', () => {
    const bannerDispatchMock = jest.fn()
    const setDismissedMock = jest.fn()
    const isBannerDismissedMock = jest.fn()
    beforeEach(() => {
        useBannersDispatchContextMock.mockReturnValue(bannerDispatchMock)
        isBannerDismissedMock.mockReturnValue(false)
        useDismissedStorageMock.mockReturnValue({
            setDismissed: setDismissedMock,
            isBannerDismissed: isBannerDismissedMock,
        })
    })

    it('should call useDismissedStorage with a function calling bannerDispatch with proper params', () => {
        renderHook(useBanners)

        const category = BannerCategories.IMPERSONATION
        const instanceId = '1'
        useDismissedStorageMock.mock.calls[0][0](category, instanceId)

        expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
        expect(bannerDispatchMock).toHaveBeenCalledWith({
            type: BannerActionTypes.REMOVE_BANNER,
            category,
            instanceId,
        })
    })

    describe('returned API', () => {
        it('should should dispatch the correct add action with proper params', () => {
            const {result} = renderHook(useBanners)
            const {addBanner, forceAddBanner} = result.current

            addBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: data,
            })

            forceAddBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(2)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: data,
            })
        })
        it('should not dispatch any action if banner is dismissed when using addBanner', () => {
            isBannerDismissedMock.mockReturnValue(true)
            const {result} = renderHook(useBanners)
            const {addBanner, forceAddBanner} = result.current

            addBanner(data)
            expect(bannerDispatchMock).not.toHaveBeenCalled()

            forceAddBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
        })

        it('should dispatch the correct remove category action with proper params', () => {
            const {result} = renderHook(useBanners)
            const {removeCategory} = result.current

            removeCategory(BannerCategories.IMPERSONATION)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.REMOVE_CATEGORY,
                category: BannerCategories.IMPERSONATION,
            })
        })

        it('should dispatch the correct remove banner action with proper params', () => {
            const {result} = renderHook(useBanners)
            const {removeBanner, dismissBanner} = result.current

            removeBanner(BannerCategories.IMPERSONATION, '1')
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.REMOVE_BANNER,
                category: BannerCategories.IMPERSONATION,
                instanceId: '1',
            })

            dismissBanner(BannerCategories.IMPERSONATION, '1')
            expect(bannerDispatchMock).toHaveBeenCalledTimes(2)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.REMOVE_BANNER,
                category: BannerCategories.IMPERSONATION,
                instanceId: '1',
            })
        })

        it('should call setDismissed when dismissing a banner', () => {
            const {result} = renderHook(useBanners)
            const {dismissBanner} = result.current

            dismissBanner(BannerCategories.IMPERSONATION, '1')
            expect(setDismissedMock).toHaveBeenCalledTimes(1)
            expect(setDismissedMock).toHaveBeenCalledWith(
                BannerCategories.IMPERSONATION,
                '1'
            )
        })
    })
})
