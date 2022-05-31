import {checkBigCommerceAccess} from '../checkFeatureAccess'

describe('checkBigCommerceAccess()', () => {
    it.each([
        ['acme', true],
        ['test-martin', true],
        ['blablabla.preview', true],
        ['some-random-one', false],
        ['', false],
    ])(
        'should return if a domain has access or not to the feature',
        (domain, expectedValue) => {
            const hasAccessToBigCommerce = checkBigCommerceAccess(domain)

            expect(hasAccessToBigCommerce).toEqual(expectedValue)
        }
    )
})
