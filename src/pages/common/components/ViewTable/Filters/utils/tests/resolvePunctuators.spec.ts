import resolvePunctuators from '../resolvePunctuators'

describe('resolvePunctuators', () => {
    it("should return '.param' when type is Identifier", () => {
        expect(resolvePunctuators('Identifier', 'foo')).toBe('.foo')
    })

    it("should return '[ param ]' when type is Literal", () => {
        expect(resolvePunctuators('Literal', 'foo')).toBe('[foo]')
    })

    it('should throw error when type is not supported', () => {
        expect(() => resolvePunctuators('UnaryExpression', 'string')).toThrow(
            'Unsupported type: UnaryExpression'
        )
    })
})
