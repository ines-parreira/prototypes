import {getLabel} from '../getLabel'

describe('getLabel', () => {
    it.each([
        ['hello::world::foo', 'hello > world > foo'],
        ['hello::world', 'hello > world'],
        ['hello', 'hello'],
        [undefined, ''],
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
