import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import { useBannersContext } from 'AlertBanners/Context'
import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'
import {
    BannerNotification,
    NotificationStyle,
} from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { useBannerCarousel } from '../useBannerCarousel'

const legacyBanner: BannerNotification = {
    id: '1',
    message: 'Test Legacy Banner',
    type: AlertBannerTypes.Critical,
    style: NotificationStyle.Banner,
    CTA: {
        type: 'action',
        text: 'test cta',
        onClick: jest.fn(),
    },
}

const banner: ContextBanner = {
    category: BannerCategories.IMPERSONATION,
    instanceId: '1',
    message: 'Test Context Banner',
    type: AlertBannerTypes.Critical,
    CTA: {
        type: 'action',
        text: 'test cta',
        onClick: jest.fn(),
    },
}

jest.mock('notifications/hooks/useLegacyAlertBanners', () => jest.fn())
jest.mock('../../Context', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../Context'),
    useBannersContext: jest.fn(),
}))

const useLegacyAlertBannersMock = assumeMock(useLegacyAlertBanners)
const useBannersContextMock = assumeMock(useBannersContext)

describe('useBannerCarousel', () => {
    beforeEach(() => {
        useLegacyAlertBannersMock.mockReturnValue([legacyBanner])
        useBannersContextMock.mockReturnValue([banner])
    })

    it('should merge legacy and context banners', () => {
        const { result } = renderHook(() => useBannerCarousel())

        expect(result.current.mergedBannersList).toHaveLength(2)
        expect(result.current.currentBannerPosition).toBe(0)
    })

    it('should handle empty legacyBanners', () => {
        useLegacyAlertBannersMock.mockReturnValue([])

        const { result } = renderHook(() => useBannerCarousel())

        expect(result.current.mergedBannersList).toHaveLength(1)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)
    })

    it('should handle empty banners', () => {
        useBannersContextMock.mockReturnValue([])

        const { result } = renderHook(() => useBannerCarousel())

        expect(result.current.mergedBannersList).toHaveLength(1)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(legacyBanner)
    })

    it('should cycle to last banner when onPrevious called from first position', () => {
        const { result } = renderHook(() => useBannerCarousel())

        expect(result.current.currentBannerPosition).toBe(0)

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(1)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)
    })

    it('should move to previous banner when onPrevious called from last position', () => {
        const { result } = renderHook(() => useBannerCarousel())

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(1)

        act(() => {
            result.current.onPrevious()
        })

        expect(result.current.currentBannerPosition).toBe(0)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(legacyBanner)
    })

    it('should reset position to 0 when banner list length becomes 1', () => {
        const { result, rerender } = renderHook(() => useBannerCarousel())

        act(() => {
            result.current.onNext()
        })
        expect(result.current.currentBannerPosition).toBe(1)

        useLegacyAlertBannersMock.mockReturnValue([])

        rerender()
        expect(result.current.currentBannerPosition).toBe(0)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)
    })

    it('should reset position to 0 when currentBannerPosition is long as banners list +1', () => {
        const { result } = renderHook(() => useBannerCarousel())

        act(() => {
            result.current.onNext()
        })

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(0)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(legacyBanner)
    })

    it('should reset position to list length currentBannerPosition is long as banners list -1', () => {
        const { result } = renderHook(() => useBannerCarousel())

        act(() => {
            result.current.onPrevious()
        })

        expect(result.current.currentBannerPosition).toBe(1)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)
    })

    it('should adjust position when a banner is removed from context', () => {
        useLegacyAlertBannersMock.mockReturnValue([legacyBanner])
        useBannersContextMock.mockReturnValue([banner, banner])

        const { result, rerender } = renderHook(() => useBannerCarousel())

        act(() => {
            result.current.onNext()
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(2)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)

        // Simulate removing the last banner from context
        act(() => {
            // Update the mock to return one less banner
            useBannersContextMock.mockReturnValue([banner])
            rerender()
        })

        expect(result.current.currentBannerPosition).toBe(1)
        expect(
            result.current.mergedBannersList[
                result.current.currentBannerPosition
            ],
        ).toBe(banner)
    })
})
