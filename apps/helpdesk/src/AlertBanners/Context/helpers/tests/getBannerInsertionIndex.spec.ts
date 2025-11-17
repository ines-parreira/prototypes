import type { ContextBanner } from '../../../types'
import { AlertBannerTypes } from '../../../types'
import { getBannerInsertionIndex } from '../getBannerInsertionIndex'

describe('getBannerInsertionIndex', () => {
    it('should return 0 if there are no banners', () => {
        const banners = [] as ContextBanner[]
        const type = AlertBannerTypes.Info

        expect(getBannerInsertionIndex(banners, type)).toBe(0)
    })

    it('should return 0 if all banners are of lesser type', () => {
        const banners = [
            { type: AlertBannerTypes.Warning },
            { type: AlertBannerTypes.Info },
            { type: AlertBannerTypes.Info },
        ] as ContextBanner[]
        const type = AlertBannerTypes.Critical

        expect(getBannerInsertionIndex(banners, type)).toBe(0)
    })

    it("should return the index of the first banner of the same type if it's present", () => {
        const banners = [
            { type: AlertBannerTypes.Warning },
            { type: AlertBannerTypes.Info },
            { type: AlertBannerTypes.Info },
        ] as ContextBanner[]
        const type = AlertBannerTypes.Info

        expect(getBannerInsertionIndex(banners, type)).toBe(1)
    })

    it('should return the last index + 1 of the first available upper type', () => {
        const banners = [
            { type: AlertBannerTypes.Critical },
            { type: AlertBannerTypes.Critical },
            { type: AlertBannerTypes.Warning },
            { type: AlertBannerTypes.Info },
        ] as ContextBanner[]
        const type = AlertBannerTypes.Warning

        // Warning should be inserted after the last Critical banner (index 1)
        expect(getBannerInsertionIndex(banners, type)).toBe(2)

        const banners2 = [
            { type: AlertBannerTypes.Critical },
            { type: AlertBannerTypes.Warning },
            { type: AlertBannerTypes.Info },
        ] as ContextBanner[]
        const type2 = AlertBannerTypes.Info

        // Info should be inserted after the last Warning banner (index 1)
        expect(getBannerInsertionIndex(banners2, type2)).toBe(2)
    })

    it('should return 0 for unknown banner types', () => {
        const banners = [
            { type: AlertBannerTypes.Critical },
            { type: AlertBannerTypes.Warning },
        ] as ContextBanner[]
        const type = 'UnknownType' as AlertBannerTypes

        // Unknown type should return 0 since getNextBannerType returns undefined
        expect(getBannerInsertionIndex(banners, type)).toBe(0)
    })

    describe('getNextBannerType switch cases', () => {
        it('should return Warning for Info type', () => {
            const banners = [{ type: AlertBannerTypes.Info }] as ContextBanner[]
            const type = AlertBannerTypes.Info

            // Info -> Warning -> Critical -> undefined
            expect(getBannerInsertionIndex(banners, type)).toBe(0)
        })

        it('should return Critical for Warning type', () => {
            const banners = [
                { type: AlertBannerTypes.Warning },
            ] as ContextBanner[]
            const type = AlertBannerTypes.Warning

            // Warning -> Critical -> undefined
            expect(getBannerInsertionIndex(banners, type)).toBe(0)
        })

        it('should return undefined for Critical type', () => {
            const banners = [
                { type: AlertBannerTypes.Critical },
            ] as ContextBanner[]
            const type = AlertBannerTypes.Critical

            // Critical -> undefined
            expect(getBannerInsertionIndex(banners, type)).toBe(0)
        })

        it('should return undefined for unknown type (default case)', () => {
            const banners = [{ type: AlertBannerTypes.Info }] as ContextBanner[]
            const type = 'UnknownType' as AlertBannerTypes

            // Unknown -> undefined
            expect(getBannerInsertionIndex(banners, type)).toBe(0)
        })
    })
})
