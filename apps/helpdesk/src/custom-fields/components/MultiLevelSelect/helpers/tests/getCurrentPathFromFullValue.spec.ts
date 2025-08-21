import { branchKey } from '../buildTreeOfChoices'
import { getCurrentPathFromFullValue } from '../getCurrentPathFromFullValue'

describe('getCurrentPathFromFullValue', () => {
    it.each([
        [undefined, []],
        [0, []],
        [1, []],
        [true, []],
        [false, []],
        ['', []],
        ['hello', []],
        ['hello::world', ['hello'].map(branchKey)],
        ['hello::world::foo', ['hello', 'world'].map(branchKey)],
    ])(
        'should the correct path',
        (
            input: Parameters<typeof getCurrentPathFromFullValue>[0],
            output: ReturnType<typeof getCurrentPathFromFullValue>,
        ) => {
            expect(getCurrentPathFromFullValue(input)).toEqual(output)
        },
    )
})
