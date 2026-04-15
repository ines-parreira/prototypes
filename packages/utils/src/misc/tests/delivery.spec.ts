import { getTrackingUrl } from '../delivery'

describe('getTrackingUrl()', () => {
    it.each([
        [
            'usps',
            'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=123asd',
        ],
        ['ups', 'https://www.ups.com/track?tracknum=123asd'],
        ['fedex', 'https://www.fedex.com/apps/fedextrack/?tracknumbers=123asd'],
        [
            'canada_post',
            'https://www.canadapost.ca/trackweb/en#/search?searchFor=123asd',
        ],
        [
            'dhl',
            'https://www.dhl.com/en/express/tracking.html?AWB=123asd&brand=DHL',
        ],
    ])(
        'should return a tracking url for carrier %s',
        (carrier, expectedUrl) => {
            expect(getTrackingUrl('123asd', carrier)).toBe(expectedUrl)
        },
    )

    it('should return an empty string for unhandled carriers', () => {
        expect(getTrackingUrl('123asd', 'somethingelse')).toBe('')
    })
})
