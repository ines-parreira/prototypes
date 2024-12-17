import {renderHook} from '@testing-library/react-hooks'

import {BannerCategories} from '../../../types'
import {STORAGE_CLEAR_TIMEOUT} from '../../constants'
import {AlertBannerStorage} from '../../types'
import {useStorageCleanup} from '../useStorageCleanup'

const storage: AlertBannerStorage = {
    [BannerCategories.STATUS_PAGE_INCIDENT]: {
        lastUpdate: Date.now(),
        dismissedInstances: ['1', '2'],
    },
    [BannerCategories.STATUS_PAGE_MAINTENANCE]: {
        lastUpdate: Date.now() - STORAGE_CLEAR_TIMEOUT - 1, // to be cleared
        dismissedInstances: ['3', '4'],
    },
}

describe('useStorageCleanup', () => {
    it('should call passed function with a cleaned up state, once', () => {
        const setStorageMock = jest.fn()

        const {rerender} = renderHook(
            ({storage, setStorageMock}) =>
                useStorageCleanup(storage, setStorageMock),
            {initialProps: {storage, setStorageMock}}
        )
        rerender({storage, setStorageMock})

        expect(setStorageMock).toHaveBeenCalledWith({
            [BannerCategories.STATUS_PAGE_INCIDENT]:
                storage[BannerCategories.STATUS_PAGE_INCIDENT],
        })
        expect(setStorageMock).toHaveBeenCalledTimes(1)
    })
})
