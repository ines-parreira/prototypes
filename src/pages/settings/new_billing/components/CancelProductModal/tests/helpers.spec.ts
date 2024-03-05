import {ProductType} from 'models/billing/types'
import {findCancellationScenarioByProductType} from '../helpers'
import {HELPDESK_CANCELLATION_SCENARIO} from '../scenarios'

describe('findCancellationScenarioByProductType', () => {
    it('should return Helpdesk cancellation script for Helpdesk product', () => {
        const result = findCancellationScenarioByProductType(
            ProductType.Helpdesk
        )
        expect(result).toEqual(HELPDESK_CANCELLATION_SCENARIO)
    })

    it('should return an error if cancellation is not supported by a product', () => {
        expect(() => {
            findCancellationScenarioByProductType(ProductType.Voice)
        }).toThrow(
            new Error(
                `Cancellation script not found for ${ProductType.Voice} product.`
            )
        )
    })
})
