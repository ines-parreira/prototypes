import {getStealthLabel, getLabel, getMultiLabel} from '../getLabels'

describe('getStealthLabel', () => {
    it.each([
        ['hello::world::foo', 'foo'],
        ['hello::world', 'world'],
        ['hello', 'hello'],
        [undefined, ''],
        [0, '0'],
        [1, '1'],
        [true, 'Yes'],
        [false, 'No'],
    ])(
        'should the correct path',
        (
            input: Parameters<typeof getStealthLabel>[0],
            output: ReturnType<typeof getStealthLabel>
        ) => {
            expect(getStealthLabel(input)).toEqual(output)
        }
    )
})

describe('getLabel', () => {
    it.each([
        ['hello::world::foo', 'hello > world > foo'],
        ['hello::world', 'hello > world'],
        ['hello', 'hello'],
        [undefined, ''],
        [0, '0'],
        [1, '1'],
        [true, 'Yes'],
        [false, 'No'],
    ])(
        'should the correct path',
        (
            input: Parameters<typeof getLabel>[0],
            output: ReturnType<typeof getLabel>
        ) => {
            expect(getLabel(input)).toEqual(output)
        }
    )
})

describe('getMultiLabel', () => {
    it.each([
        [undefined, ''],
        [[], ''],
        [['hello::world'], 'world'],
        [['hello::world', 'hello::world::foo'], '2 fields selected'],
    ])(
        'should return the correct path',
        (
            input: Parameters<typeof getMultiLabel>[0],
            output: ReturnType<typeof getMultiLabel>
        ) => {
            expect(getMultiLabel(input)).toEqual(output)
        }
    )
})
