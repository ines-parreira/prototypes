import {getTrackingUrl} from '../delivery'


describe('getTrackingUrl()', () => {
    const handledCarriers = ['usps', 'ups', 'fedex', 'canada_post', 'dhl']

    for (const handledCarrier of handledCarriers) {
        it(`should return a tracking url for carrier ${handledCarrier}`, () => {
            expect(getTrackingUrl('123asd', handledCarrier)).toMatchSnapshot()
        })
    }

    it('should return an empty string for unhandled carriers', () => {
        expect(getTrackingUrl('123asd', 'somethingelse')).toEqual('')
    })
})
