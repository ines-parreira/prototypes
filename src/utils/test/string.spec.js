import {removeSuffix} from '../string'

describe('string util', () => {
    describe('removeSuffix', () => {
        it('should return the data if it\'s not a string', () => {
            expect(removeSuffix(null, 'hey')).toEqual(null)
            expect(removeSuffix({foo: 'bar'}, 'hey')).toEqual({foo: 'bar'})
            expect(removeSuffix(1, 'hey')).toEqual(1)
        })

        it('should return the data if the suffix does not end with it', () => {
            expect(removeSuffix('foo', 'hey')).toEqual('foo')
            expect(removeSuffix('heyfoo', 'hey')).toEqual('heyfoo')
            expect(removeSuffix('fooheyfoo', 'hey')).toEqual('fooheyfoo')
        })

        it('should remove the suffix from the data if the data ends with the suffix', () => {
            expect(removeSuffix('foobar', 'bar')).toEqual('foo')
        })
    })
})
