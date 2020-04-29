import {canUseNewRevenueStats, getCurrentAccountId} from '../account'

describe('canUseNewRevenueStats()', () => {
    it('should return `true` because the ID is higher than 19447', () => {
        const accountId = 19448
        expect(canUseNewRevenueStats(accountId)).toEqual(true)
    })
    it('should return `false` because the ID is lower or equal to 19447', () => {
        const accountId = 19447
        expect(canUseNewRevenueStats(accountId)).toEqual(false)
    })
})

describe('getCurrentAccountId()', () => {
    it.each([
        [{}],
        [{SEGMENT_ANALYTICS_USER_ID: null}],
        [{SEGMENT_ANALYTICS_USER_ID: ''}],
        [{SEGMENT_ANALYTICS_USER_ID: '12345'}],
    ])('should return `null` because there is no Segment User ID', (window) => {
        expect(getCurrentAccountId(window)).toBeNull()
    })

    it('should return the current account ID', () => {
        const window = {
            SEGMENT_ANALYTICS_USER_ID: '12_34'
        }
        expect(getCurrentAccountId(window)).toEqual(12)
    })
})
