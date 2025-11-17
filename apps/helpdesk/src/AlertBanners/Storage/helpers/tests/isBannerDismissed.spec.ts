import { BannerCategories } from '../../../types'
import type { AlertBannerStorage } from '../../types'
import { isBannerDismissed } from '../isBannerDismissed'

describe('isBannerDismissed', () => {
    const storage: AlertBannerStorage = {
        [BannerCategories.STATUS_PAGE_INCIDENT]: {
            lastUpdate: 0,
            dismissedInstances: ['1', '2'],
        },
    }
    it('should return false if the banner is not dismissed', () => {
        expect(
            isBannerDismissed(
                storage,
                BannerCategories.STATUS_PAGE_INCIDENT,
                '3',
            ),
        ).toBe(false)
    })

    it('should return true if the banner is dismissed', () => {
        expect(
            isBannerDismissed(
                storage,
                BannerCategories.STATUS_PAGE_INCIDENT,
                '2',
            ),
        ).toBe(true)
    })

    it('should return false if the category is not in storage', () => {
        expect(
            isBannerDismissed(
                storage,
                BannerCategories.STATUS_PAGE_MAINTENANCE,
                '2',
            ),
        ).toBe(false)
    })
})
