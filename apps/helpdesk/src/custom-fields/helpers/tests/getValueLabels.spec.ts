import { getShortValueLabel, getValueLabel } from '../getValueLabels'

describe('getShortValueLabel', () => {
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
            input: Parameters<typeof getShortValueLabel>[0],
            output: ReturnType<typeof getShortValueLabel>,
        ) => {
            expect(getShortValueLabel(input)).toEqual(output)
        },
    )
})

describe('getValueLabel', () => {
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
            input: Parameters<typeof getValueLabel>[0],
            output: ReturnType<typeof getValueLabel>,
        ) => {
            expect(getValueLabel(input)).toEqual(output)
        },
    )

    it.each([
        [['hello::world::foo', 'bar::baz'], 'hello > world > foo,bar > baz'],
        [['hello', 'world'], 'hello,world'],
        [['hello::world', 'bar'], 'hello > world,bar'],
        [[true, false], 'Yes,No'],
        [[1, 2, 3], '1,2,3'],
        [['hello', '', 'world'], 'hello,world'],
        [[], ''],
    ])(
        'should handle array inputs correctly',
        (
            input: Parameters<typeof getValueLabel>[0],
            output: ReturnType<typeof getValueLabel>,
        ) => {
            expect(getValueLabel(input)).toEqual(output)
        },
    )
})
