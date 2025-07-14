import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'

describe('utils', () => {
    describe('handleNestedString', () => {
        const testCases: ([string, string] | [null, null])[] = [
            ['"Product::Details::Other"', 'Product::Details::Other'],
            ['abc::xyz', 'abc::xyz'],
            [null, null],
            ['true', 'true'],
            ['false', 'false'],
        ]
        it.each(testCases)('should escape strings', (source, result) => {
            expect(stripEscapedQuotes(source)).toEqual(result)
        })
    })
})
