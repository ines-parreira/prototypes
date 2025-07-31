import { renderHook } from '@repo/testing'

import { assumeMock } from 'utils/testing'

import { useBannersContext } from '../../../Context'
import { BannerCategories, ContextBanner } from '../../../types'
import { useStorageSync } from '../useStorageSync'

jest.mock('../../../Context', () => ({
    useBannersContext: jest.fn(),
}))
const useBannersContextMock = assumeMock(useBannersContext)

describe('useStorageSync', () => {
    beforeEach(() => {
        useBannersContextMock.mockReturnValue([
            {
                category: BannerCategories.IMPERSONATION,
                instanceId: 'instanceId0',
            },
            {
                category: BannerCategories.STATUS_PAGE_INCIDENT,
                instanceId: 'instanceId1',
            },
            {
                category: BannerCategories.STATUS_PAGE_INCIDENT,
                instanceId: 'instanceId2',
            },
        ] as ContextBanner[])
    })

    it('should not call the passed updateCurrentTabState if there is no instanceId matches', () => {
        const updateCurrentTabState = jest.fn()
        const storage = {
            [BannerCategories.STATUS_PAGE_INCIDENT]: {
                dismissedInstances: ['instanceId3'],
                lastUpdate: 0,
            },
        }

        renderHook(() => useStorageSync(storage, updateCurrentTabState))

        expect(updateCurrentTabState).not.toHaveBeenCalled()
    })

    it('should call the passed updateCurrentTabState for each bannerId that is both in the banners context and the storage', () => {
        const updateCurrentTabState = jest.fn()
        const storage = {
            [BannerCategories.STATUS_PAGE_INCIDENT]: {
                dismissedInstances: ['instanceId1', 'instanceId2'],
                lastUpdate: 0,
            },
        }

        renderHook(() => useStorageSync(storage, updateCurrentTabState))

        expect(updateCurrentTabState).toHaveBeenCalledTimes(2)
        expect(updateCurrentTabState).toHaveBeenNthCalledWith(
            1,
            BannerCategories.STATUS_PAGE_INCIDENT,
            'instanceId1',
        )
        expect(updateCurrentTabState).toHaveBeenNthCalledWith(
            2,
            BannerCategories.STATUS_PAGE_INCIDENT,
            'instanceId2',
        )
    })
})
