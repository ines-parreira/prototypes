import {fromJS} from 'immutable'
import {integrationsState} from 'fixtures/integrations'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {computeDiscountOfferSummary} from '../utils'

describe('UniqueDiscountOffers utils', () => {
    describe('computeDiscountOfferSummary', () => {
        const integration = fromJS(integrationsState.integration)
        const offer: UniqueDiscountOffer = {
            type: 'fixed',
            value: '20',
            store_integration_id: '3',
            prefix: 'test',
            id: '5',
        }
        it('returns empty string if there is no offer', () => {
            const res = computeDiscountOfferSummary(undefined, integration)
            expect(res).toEqual('')
        })
        it('returns empty string if there is no integration', () => {
            const res = computeDiscountOfferSummary(offer, undefined)
            expect(res).toEqual('')
        })
        it('returns the summary if already available', () => {
            const res = computeDiscountOfferSummary(
                {...offer, summary: 'hello'},
                integration
            )
            expect(res).toEqual('hello')
        })
        it('returns free shipping content for free_shipping type', () => {
            const res = computeDiscountOfferSummary(
                {...offer, type: 'free_shipping'},
                integration
            )
            expect(res).toEqual('Get free shipping for this order')
        })
        it('returns value and currency for fixed type', () => {
            const res = computeDiscountOfferSummary(offer, integration)
            expect(res).toEqual('Get $20 off')
        })
        it('returns value and percentage for percentage type', () => {
            const res = computeDiscountOfferSummary(
                {...offer, type: 'percentage'},
                integration
            )
            expect(res).toEqual('Get 20% off')
        })
    })
})
