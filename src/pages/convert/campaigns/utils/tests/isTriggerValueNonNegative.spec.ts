import { isTriggerValueNonNegative } from 'pages/convert/campaigns/utils/isTriggerValueNonNegative'

describe('isTriggerValueNonNegative', () => {
    it.each([
        [1, true],
        ['1', true],
        [-1, false],
        ['-1', false],
        [0, true],
        ['0', true],
        ['test', false],
    ])(
        'for value %s should return %s',
        (value: string | number, expected: boolean) => {
            expect(isTriggerValueNonNegative(value)).toBe(expected)
        },
    )
})
