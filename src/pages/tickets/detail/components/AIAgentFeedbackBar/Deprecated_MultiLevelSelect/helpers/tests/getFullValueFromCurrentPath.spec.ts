import {getFullValueFromCurrentPath} from '../getFullValueFromCurrentPath'

describe('getFullValueFromCurrentPath', () => {
    const testValues: Array<
        [
            Parameters<typeof getFullValueFromCurrentPath>,
            ReturnType<typeof getFullValueFromCurrentPath>
        ]
    > = [
        [[[], 'foo'], 'foo'],
        [[['bar'], 'foo'], 'bar::foo'],
        [[['bar', 'hello'], 'foo'], 'bar::hello::foo'],
    ]
    it.each(testValues)('should the correct path', (input, output) => {
        expect(getFullValueFromCurrentPath(...input)).toBe(output)
    })
})
