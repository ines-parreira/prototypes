import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

describe('safeDivide', () => {
    test.each([
        [10, 2, 5],
        [10, 0, 0],
        [null, 2, 0],
        [10, null, 0],
        [null, null, 0],
        [undefined, 2, 0],
        [10, undefined, 0],
        [undefined, undefined, 0],
        [0, 0, 0],
    ])('safeDivide(%p, %p) = %p', (a, b, expected) => {
        expect(safeDivide(a, b)).toBe(expected)
    })
})
