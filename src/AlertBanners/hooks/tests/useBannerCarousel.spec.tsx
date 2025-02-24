import {renderHook, act} from '@testing-library/react-hooks'

import {BannerCategories, ContextBanner} from 'AlertBanners'
import {BannerNotification} from 'state/notifications/types'

import {useBannerCarousel} from '../useBannerCarousel'

describe('useBannerCarousel', () => {
    const legacyBanner = {id: 'legacy-1', message: 'Legacy Banner'}
    const contextBanner: ContextBanner = {
        instanceId: '2',
        message: 'Context Banner',
        category: BannerCategories.EMAIL_DISCONNECTED,
        CTA: {
            type: 'action',
            text: 'CTA',
            onClick: () => {},
        },
    }
    const impersonationBanner = {
        instanceId: BannerCategories.IMPERSONATION,
        message: 'Impersonation Banner',
        category: BannerCategories.IMPERSONATION,
    }

    it('should merge legacy and context banners', () => {
        const {result} = renderHook(
            ({
                legacyBanners,
                banners,
            }: {
                legacyBanners: any[]
                banners: any[]
            }) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners as ContextBanner[],
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        expect(result.current.mergedBannersList).toHaveLength(2)
        expect(result.current.selectedBanner).toBe(legacyBanner)
        expect(result.current.currentBannerPosition).toBe(0)
    })

    it('should set impersonationBanner', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners as ContextBanner[],
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner, impersonationBanner],
                },
            }
        )

        expect(result.current.mergedBannersList).toHaveLength(2)
        expect(result.current.selectedBanner).toBe(legacyBanner)
        expect(result.current.currentBannerPosition).toBe(0)
        expect(result.current.impersonationBanner).toBe(impersonationBanner)
    })

    it('should handle empty legacyBanners', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners as ContextBanner[],
                }),
            {
                initialProps: {
                    legacyBanners: [],
                    banners: [contextBanner, impersonationBanner],
                },
            }
        )

        expect(result.current.mergedBannersList).toHaveLength(1)
        expect(result.current.selectedBanner).toBe(contextBanner)
        expect(result.current.impersonationBanner).toBe(impersonationBanner)
    })

    it('should handle empty banners', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners as ContextBanner[],
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [],
                },
            }
        )

        expect(result.current.mergedBannersList).toHaveLength(1)
        expect(result.current.selectedBanner).toBe(legacyBanner)
        expect(result.current.impersonationBanner).not.toBe(impersonationBanner)
    })

    it('should cycle to last banner when onPrevious called from first position', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners,
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        expect(result.current.currentBannerPosition).toBe(0)

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(1)
        expect(result.current.selectedBanner).toBe(contextBanner)
    })

    it('should move to previous banner when onPrevious called from last position', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners,
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(1)

        act(() => {
            result.current.onPrevious()
        })

        expect(result.current.currentBannerPosition).toBe(0)
        expect(result.current.selectedBanner).toBe(legacyBanner)
    })

    it('should reset position to 0 when banner list length becomes 1', () => {
        const {result, rerender} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners,
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        act(() => {
            result.current.onNext()
        })
        expect(result.current.currentBannerPosition).toBe(1)

        rerender({legacyBanners: [], banners: [contextBanner]})
        expect(result.current.currentBannerPosition).toBe(0)
        expect(result.current.selectedBanner).toBe(contextBanner)
    })

    it('should reset position to 0 when currentBannerPosition is long as banners list +1', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners,
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        act(() => {
            result.current.onNext()
        })

        act(() => {
            result.current.onNext()
        })

        expect(result.current.currentBannerPosition).toBe(0)
        expect(result.current.selectedBanner).toBe(legacyBanner)
    })

    it('should reset position to list length currentBannerPosition is long as banners list -1', () => {
        const {result} = renderHook(
            ({legacyBanners, banners}) =>
                useBannerCarousel({
                    legacyBanners: legacyBanners as BannerNotification[],
                    banners: banners,
                }),
            {
                initialProps: {
                    legacyBanners: [legacyBanner],
                    banners: [contextBanner],
                },
            }
        )

        act(() => {
            result.current.onPrevious()
        })

        expect(result.current.currentBannerPosition).toBe(1)
        expect(result.current.selectedBanner).toBe(contextBanner)
    })
})
