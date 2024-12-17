import {AlertBannerTypes, ContextBanner} from '../../../types'
import {getBannerInsertionIndex} from '../getBannerInsertionIndex'

describe('getBannerInsertionIndex', () => {
    it('should return 0 if there are no banners', () => {
        const banners = [] as ContextBanner[]
        const type = AlertBannerTypes.Info

        expect(getBannerInsertionIndex(banners, type)).toBe(0)
    })

    it('should return 0 if all banners are of lesser type', () => {
        const banners = [
            {type: AlertBannerTypes.Warning},
            {type: AlertBannerTypes.Info},
            {type: AlertBannerTypes.Info},
        ] as ContextBanner[]
        const type = AlertBannerTypes.Critical

        expect(getBannerInsertionIndex(banners, type)).toBe(0)
    })

    it("should return the index of the first banner of the same type if it's present", () => {
        const banners = [
            {type: AlertBannerTypes.Warning},
            {type: AlertBannerTypes.Info},
            {type: AlertBannerTypes.Info},
        ] as ContextBanner[]
        const type = AlertBannerTypes.Info

        expect(getBannerInsertionIndex(banners, type)).toBe(1)
    })

    it('should return the last index + 1 of the first available upper type', () => {
        const banners1 = [
            {type: AlertBannerTypes.Critical},
            {type: AlertBannerTypes.Critical},
            {type: AlertBannerTypes.Info},
        ] as ContextBanner[]
        const type1 = AlertBannerTypes.Warning

        expect(getBannerInsertionIndex(banners1, type1)).toBe(2)

        const banners2 = [
            {type: AlertBannerTypes.Critical},
            {type: AlertBannerTypes.Critical},
            {type: AlertBannerTypes.Critical},
        ] as ContextBanner[]
        const type2 = AlertBannerTypes.Info

        expect(getBannerInsertionIndex(banners2, type2)).toBe(3)
    })
})
