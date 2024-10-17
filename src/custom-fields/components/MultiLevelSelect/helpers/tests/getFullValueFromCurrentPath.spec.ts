import {getFullValueFromCurrentPath} from '../getFullValueFromCurrentPath'

describe('getFullValueFromCurrentPath', () => {
    const testValues: Array<
        [
            Parameters<typeof getFullValueFromCurrentPath>,
            ReturnType<typeof getFullValueFromCurrentPath>,
        ]
    > = [
        [[[], 'foo'], 'foo'],
        [[['bar'], 'foo'], 'bar::foo'],
        [[['bar', 'hello'], 'foo'], 'bar::hello::foo'],
        [[['bar'], 0], 0],
        [[[], 1], 1],
        [[['bar'], 1], 1],
        [[['bar'], true], true],
        [[['bar'], false], false],
        [[[], false], false],
    ]
    it.each(testValues)('should the correct path', (input, output) => {
        expect(getFullValueFromCurrentPath(...input)).toBe(output)
    })
})
