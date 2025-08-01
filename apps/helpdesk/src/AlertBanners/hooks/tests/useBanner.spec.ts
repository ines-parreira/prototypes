import { Dispatch } from 'react'

import { assumeMock, renderHook } from '@repo/testing'

import { BannerActions } from 'AlertBanners/Context/types'

import { BannerActionTypes, useBannersDispatchContext } from '../../Context'
import { useDismissedStorage } from '../../Storage'
import { BannerCategories, ContextBanner } from '../../types'
import { useBanners } from '../useBanners'

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
    const bannerDispatchMock = jest.fn<unknown, [{ payload: ContextBanner }]>()
    const setDismissedMock = jest.fn()
    const isBannerDismissedMock = jest.fn()
    beforeEach(() => {
        useBannersDispatchContextMock.mockReturnValue(
            bannerDispatchMock as Dispatch<BannerActions>,
        )
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
        it('should should dispatch the correct add action with proper params,', () => {
            const { result } = renderHook(useBanners)
            const { addBanner, forceAddBanner } = result.current

            addBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: { ...data, onClose: expect.any(Function) },
            })

            forceAddBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(2)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: { ...data, onClose: expect.any(Function) },
            })

            const newData = { ...data, preventDismiss: true }

            addBanner(newData)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(3)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: newData,
            })

            forceAddBanner(newData)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(4)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.ADD,
                payload: newData,
            })
        })

        it('should call the passed `onClose`, `setDismissed`, and dispatch the correct remove banner action when onClose prop is called', () => {
            const { result } = renderHook(useBanners)
            const { addBanner } = result.current

            const onCloseSpy = jest.fn()
            addBanner({ ...data, onClose: onCloseSpy })
            const onClose = bannerDispatchMock.mock.calls[0][0].payload.onClose
            onClose?.()

            expect(setDismissedMock).toHaveBeenCalledTimes(1)
            expect(setDismissedMock).toHaveBeenCalledWith(
                data.category,
                data.instanceId,
            )
            expect(bannerDispatchMock).toHaveBeenCalledTimes(2)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.REMOVE_BANNER,
                category: data.category,
                instanceId: data.instanceId,
            })

            expect(onCloseSpy).toHaveBeenCalledTimes(1)
        })

        it('should not dispatch any action if banner is dismissed when using addBanner', () => {
            isBannerDismissedMock.mockReturnValue(true)
            const { result } = renderHook(useBanners)
            const { addBanner, forceAddBanner } = result.current

            addBanner(data)
            expect(bannerDispatchMock).not.toHaveBeenCalled()

            forceAddBanner(data)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
        })

        it('should dispatch the correct remove category action with proper params', () => {
            const { result } = renderHook(useBanners)
            const { removeCategory } = result.current

            removeCategory(BannerCategories.IMPERSONATION)
            expect(bannerDispatchMock).toHaveBeenCalledTimes(1)
            expect(bannerDispatchMock).toHaveBeenCalledWith({
                type: BannerActionTypes.REMOVE_CATEGORY,
                category: BannerCategories.IMPERSONATION,
            })
        })

        it('should dispatch the correct remove banner action with proper params', () => {
            const { result } = renderHook(useBanners)
            const { removeBanner, dismissBanner } = result.current

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
            const { result } = renderHook(useBanners)
            const { dismissBanner } = result.current

            dismissBanner(BannerCategories.IMPERSONATION, '1')
            expect(setDismissedMock).toHaveBeenCalledTimes(1)
            expect(setDismissedMock).toHaveBeenCalledWith(
                BannerCategories.IMPERSONATION,
                '1',
            )
        })
    })
})
