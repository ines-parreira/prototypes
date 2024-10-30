import getMultiSelectLabel from '../getMultiSelectLabel'

describe('getMultiSelectLabel', () => {
    it.each([
        [undefined, ''],
        [[], ''],
        [['hello::world'], 'world'],
        [['hello::world', 'hello::world::foo'], '2 fields selected'],
    ])(
        'should return the correct path',
        (
            input: Parameters<typeof getMultiSelectLabel>[0],
            output: ReturnType<typeof getMultiSelectLabel>
        ) => {
            expect(getMultiSelectLabel(input)).toEqual(output)
        }
    )
})
