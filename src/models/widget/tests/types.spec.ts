import {isSourceRecord, isSourceArray, Source} from '../types'

describe('isSourceRecord', () => {
    it.each([
        [{a: 1, b: 2}, true],
        [{}, true],
        [['no'], false],
        ['hey', false],
        ['', false],
        [true, false],
        [1, false],
        [0, false],
        [null, false],
        [undefined, false],
        [() => undefined, false],
    ])(
        'should return correct outcome according to its input',
        (input, outcome) => {
            expect(isSourceRecord(input as Source)).toBe(outcome)
        }
    )
})

describe('isSourceArray', () => {
    it.each([
        [[1, 2, 3], true],
        [[], true],
        [{}, false],
        ['no', false],
        ['hey', false],
        ['', false],
        [true, false],
        [1, false],
        [0, false],
        [null, false],
        [undefined, false],
        [() => undefined, false],
    ])(
        'should return correct outcome according to its input',
        (input, outcome) => {
            expect(isSourceArray(input as Source)).toBe(outcome)
        }
    )
})
