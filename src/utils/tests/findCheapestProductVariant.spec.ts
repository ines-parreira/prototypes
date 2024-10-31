import {Product} from 'constants/integrations/types/shopify'
import {findCheapestProductVariant} from 'utils/findCheapestProductVariant'

describe('findCheapestProductVariant', () => {
    describe('when product has multiple variants', () => {
        it('should return the cheapest variant', () => {
            const product = {
                variants: [{price: '10'}, {price: '5'}, {price: '15'}],
            } as Product

            const result = findCheapestProductVariant(product)
            expect(result).toEqual({price: '5'})
        })
    })
})
