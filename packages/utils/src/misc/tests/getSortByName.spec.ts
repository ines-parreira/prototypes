import { getSortByName } from '../getSortByName'

describe('getSortByName', () => {
    it.each([
        ['a', 'b', -1],
        ['b', 'a', 1],
        ['a', 'a', 0],
        ['a', 'A', 0],
        ['A', 'a', 0],
        ['A', 'B', -1],
        ['B', 'A', 1],
        ['B', 'b', 0],
        ['b', 'B', 0],
        ['a', '   b', -1],
        ['a', '\tb', -1],
        ['a', '&', 1],
    ])('should sort `%s` and `%s`, expecting `%s`', (a, b, expected) => {
        expect(getSortByName({ name: a }, { name: b })).toEqual(expected)
    })
})
