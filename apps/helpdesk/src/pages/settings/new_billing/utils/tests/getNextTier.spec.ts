import {
    convertPlan1,
    convertPlan2,
    convertPlan3,
    convertPlan4,
    convertPlan5,
    convertProduct,
} from 'fixtures/plans'

import { getNextTier } from '../getNextTier'

describe('getNextTier', () => {
    it.each([
        [convertPlan1, convertPlan2],
        [convertPlan3, convertPlan5],
        [convertPlan4, convertPlan5],
        [convertPlan5, undefined],
    ])('should return next tier from list', (input, output) => {
        const result = getNextTier(convertProduct.prices, input)
        expect(result).toBe(output)
    })
})
