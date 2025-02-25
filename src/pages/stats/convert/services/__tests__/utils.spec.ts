import {
    getDefaultsForMetricKeys,
    getMetricValue,
} from 'pages/stats/convert/services/utils'

describe('getMetricValue', () => {
    const data = {
        floatProp: '12.34',
        intProp: '1234',
        nullProp: null,
        undefinedProp: undefined,
    }

    it.each([
        [data, 'floatProp', '0', parseFloat, 12.34],
        [data, 'intProp', '0', parseInt, 1234],
        [data, 'nullProp', '0', parseFloat, 0],
        [data, 'undefinedProp', '0', parseFloat, 0],
        [data, 'missingProp', '0', parseFloat, 0],
        // different default
        [data, 'missingProp', '1.2', parseFloat, 1.2],
        // parser should apply to default too
        [data, 'missingProp', '1.2', parseInt, 1],
        // no data
        [{}, 'missingProp', '1.2', parseInt, 1],
        [null, 'missingProp', '1.2', parseInt, 1],
        [undefined, 'missingProp', '1.2', parseInt, 1],
        // bad default for parser
        [data, 'missingProp', '', parseFloat, 0],
    ])(
        'For data=%p, prop=%p, default=%p, parser=%p expecting `%p`',
        (data, propName, defaultValue, parser, expected) => {
            // act
            // @ts-ignore - props don't really matter here
            const value = getMetricValue(data, propName, defaultValue, parser)

            // assert
            expect(value).toStrictEqual(expected)
        },
    )

    it('has reasonable defaults', () => {
        // act
        // @ts-ignore - props don't really matter here
        const value = getMetricValue(data, 'floatProp')

        // assert
        expect(value).toStrictEqual(12.34)
    })
})

describe('getDefaultsForMetricKeys', () => {
    it('should return object with default values', () => {
        const metrics = {
            a: 'metricA',
            b: 'metricB',
        }

        const result = getDefaultsForMetricKeys(metrics)

        expect(result).toStrictEqual({
            metricA: '0',
            metricB: '0',
        })
    })
})
