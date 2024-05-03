import {fromJS} from 'immutable'
import {integrationsState} from 'fixtures/integrations'
import {computeDiscountOfferSummary} from '../utils'

describe('UniqueDiscountOffers utils', () => {
    describe('computeDiscountOfferSummary', () => {
        const integration = fromJS(integrationsState.integration)
        const type = 'fixed'
        const value = '20'
        it('returns empty string if there is no integration', () => {
            const res = computeDiscountOfferSummary(type, value, undefined)
            expect(res).toEqual('')
        })
        it('returns free shipping content for free_shipping type', () => {
            const res = computeDiscountOfferSummary(
                'free_shipping',
                value,
                integration
            )
            expect(res).toEqual('Free shipping')
        })
        it('returns value and currency for fixed type', () => {
            const res = computeDiscountOfferSummary(type, value, integration)
            expect(res).toEqual('$20 off')
        })
        it('returns value and percentage for percentage type', () => {
            const res = computeDiscountOfferSummary(
                'percentage',
                value,
                integration
            )
            expect(res).toEqual('20% off')
        })
    })
})
