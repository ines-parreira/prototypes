//@flow
import {deepMapKeysToSnakeCase} from '../utils'

describe('api model utils', () => {
    describe('deepMapKeysToSnakeCase', () => {
        it('should format params to snake_case', () => {
            expect(deepMapKeysToSnakeCase({
                foo: 1,
                fooBar: 2,
                _foobar: 3,
            })).toEqual({
                foo: 1,
                foo_bar: 2,
                foobar: 3,
            })
        })

        it('should format params to snake_case in a nested object', () => {
            expect(deepMapKeysToSnakeCase({
                fooBar: {
                    fooBar: 1,
                },
            })).toEqual({
                foo_bar: {
                    foo_bar: 1,
                },
            })
        })

        it('should format params to snake_case in array of objects', () => {
            expect(deepMapKeysToSnakeCase({
                foo: [{
                    fooBar: 1,
                }, {
                    fooBar: 2,
                }],
            })).toEqual({
                foo: [{
                    foo_bar: 1,
                }, {
                    foo_bar: 2,
                }],
            })
        })

        it.each([
            'foo',
            123,
            null,
            [1, 2, 3],
        ])('should return non object params', (value) => {
            expect(deepMapKeysToSnakeCase(value)).toEqual(value)
        })
    })
})
