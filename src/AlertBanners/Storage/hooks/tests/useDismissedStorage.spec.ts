import { Dispatch } from 'react'

import { renderHook } from '@testing-library/react-hooks'

import useLocalStorage from 'hooks/useLocalStorage'
import { assumeMock } from 'utils/testing'

import { BannerCategories } from '../../../types'
import { DISMISSED_BANNER_STORAGE_KEY } from '../../constants'
import { isBannerDismissed } from '../../helpers/isBannerDismissed'
import { useDismissedStorage } from '../useDismissedStorage'
import { useStorageCleanup } from '../useStorageCleanup'
import { useStorageSync } from '../useStorageSync'

jest.mock('hooks/useLocalStorage', () => jest.fn())
jest.mock('../../helpers/isBannerDismissed', () => ({
    isBannerDismissed: jest.fn(),
}))
jest.mock('../useStorageCleanup', () => ({
    useStorageCleanup: jest.fn(),
}))
jest.mock('../useStorageSync', () => ({
    useStorageSync: jest.fn(),
}))
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('useDismissedStorage', () => {
    const setStorageMock = jest.fn<unknown, [Dispatch<unknown>], unknown>()
    const defaultStorage = {
        [BannerCategories.IMPERSONATION]: {
            dismissedInstances: ['instanceId'],
            lastUpdate: 0,
        },
    }
    beforeEach(() => {
        useLocalStorageMock.mockReturnValue([
            defaultStorage,
            setStorageMock as Dispatch<unknown>,
            () => {},
        ])
    })

    it('should call useLocalStorage with DISMISSED_BANNER_STORAGE_KEY and {}', () => {
        renderHook(() => useDismissedStorage(jest.fn()))

        expect(useLocalStorage).toHaveBeenCalledWith(
            DISMISSED_BANNER_STORAGE_KEY,
            {},
        )
    })

    it('should call useStorageCleanup with storage and setStorage', () => {
        renderHook(() => useDismissedStorage(jest.fn()))

        expect(useStorageCleanup).toHaveBeenCalledWith(
            defaultStorage,
            setStorageMock,
        )
    })

    it('should call useStorageSync with storage and updateCurrentTabState', () => {
        const updateCurrentTabState = jest.fn()
        renderHook(() => useDismissedStorage(updateCurrentTabState))

        expect(useStorageSync).toHaveBeenCalledWith(
            defaultStorage,
            updateCurrentTabState,
        )
    })

    it('should return isBannerDismissed and call the underlying helper', () => {
        const { result } = renderHook(() => useDismissedStorage(jest.fn()))

        result.current.isBannerDismissed(
            BannerCategories.IMPERSONATION,
            'instanceId',
        )

        expect(isBannerDismissed).toHaveBeenCalledWith(
            defaultStorage,
            BannerCategories.IMPERSONATION,
            'instanceId',
        )
    })

    it('should return setDismissed and call setStorage with the new storage', () => {
        const { result } = renderHook(() => useDismissedStorage(jest.fn()))

        result.current.setDismissed(
            BannerCategories.IMPERSONATION,
            'instanceId2',
        )

        expect(setStorageMock.mock.calls[0][0](defaultStorage)).toStrictEqual({
            ...defaultStorage,
            [BannerCategories.IMPERSONATION]: {
                dismissedInstances: ['instanceId', 'instanceId2'],
                lastUpdate: expect.any(Number),
            },
        })

        result.current.setDismissed(
            BannerCategories.STATUS_PAGE_INCIDENT,
            'instanceId3',
        )

        expect(setStorageMock.mock.calls[1][0](defaultStorage)).toStrictEqual({
            ...defaultStorage,
            [BannerCategories.IMPERSONATION]: {
                dismissedInstances: ['instanceId'],
                lastUpdate: expect.any(Number),
            },
            [BannerCategories.STATUS_PAGE_INCIDENT]: {
                dismissedInstances: ['instanceId3'],
                lastUpdate: expect.any(Number),
            },
        })
    })
})
