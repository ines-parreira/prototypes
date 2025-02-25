import { LEAF_TYPES } from '../constants'
import {
    isCardTemplate,
    isLeafTemplate,
    isLeafType,
    isListTemplate,
    isSourceArray,
    isSourceRecord,
    isWrapperTemplate,
    Source,
    Template,
} from '../types'

describe('isSourceRecord', () => {
    it.each([
        [{ a: 1, b: 2 }, true],
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
    ])('should, when given `%s`, return %s', (input, outcome) => {
        expect(isSourceRecord(input as Source)).toBe(outcome)
    })
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
    ])('should, when given `%s`, return %s', (input, outcome) => {
        expect(isSourceArray(input as Source)).toBe(outcome)
    })
})

describe('isLeafType', () => {
    it.each([
        [LEAF_TYPES.TEXT, true],
        ['no', false],
        ['wrapper', false],
    ])('should, when given "%s", return %s', (input, output) => {
        expect(isLeafType(input)).toBe(output)
    })
})

describe('template type guards', () => {
    it.each([
        ['isWrapperTemplate', { type: 'wrapper' }, true, isWrapperTemplate],
        ['isWrapperTemplate', { type: 'card' }, false, isWrapperTemplate],
        ['isCardTemplate', { type: 'card' }, true, isCardTemplate],
        ['isCardTemplate', { type: 'wrapper' }, false, isCardTemplate],
        ['isListTemplate', { type: 'list' }, true, isListTemplate],
        ['isListTemplate', { type: 'card' }, false, isListTemplate],
        ['isLeafTemplate', { type: LEAF_TYPES.TEXT }, true, isLeafTemplate],
        ['isLeafTemplate', { type: 'yes' }, true, isLeafTemplate],
        ['isLeafTemplate', { type: 'wrapper' }, false, isLeafTemplate],
    ])(
        '%s should, when given `%s`, return %s',
        (label, input: unknown, outcome, typeguard) => {
            expect(typeguard(input as Template)).toBe(outcome)
        },
    )
})
