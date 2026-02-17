import {
    DEFAULT_BADGE_TEXT,
    NOT_AVAILABLE_TEXT,
    UNDEFINED_VARIATION_TEXT,
} from '../constants'
import {
    formatDuration,
    formatMetricTrend,
    formatMetricValue,
    formatMetricValueOrString,
    getTrendColorFromValue,
} from './helpers'

describe('formatMetricValue', () => {
    it('should format value up to two decimal places when format is "decimal"', () => {
        expect(formatMetricValue(123456.789, 'decimal')).toBe('123,456.79')
    })

    it('should format value up to one decimal place when format is "decimal-precision-1"', () => {
        expect(formatMetricValue(123456.789, 'decimal-precision-1')).toBe(
            '123,456.8',
        )
    })

    it('should format rounded value when format is "integer"', () => {
        const value = 123456.789

        expect(formatMetricValue(value, 'integer')).toBe('123,457')
    })

    it('should format value up to two decimal places and render as percentage when format is "percent"', () => {
        expect(formatMetricValue(123456.789, 'percent')).toBe('123,456.79%')
    })

    it('should format and round value up to one decimal places and render as percentage when format is "percent-precision-1"', () => {
        expect(formatMetricValue(123456.789, 'percent-precision-1')).toBe(
            '123,456.8%',
        )
    })

    it('should format value up to one decimal place and representing percentage when format is "decimal-to-percent-precision-1"', () => {
        expect(
            formatMetricValue(123456.789, 'decimal-to-percent-precision-1'),
        ).toBe('12,345,678.9%')
    })

    it('should format value as duration with precision two when format is "duration"', () => {
        const minuteInSeconds = 60
        const hourInSeconds = 60 * minuteInSeconds
        const dayInSeconds = 24 * hourInSeconds

        expect(
            formatMetricValue(
                5 * dayInSeconds +
                    17 * hourInSeconds +
                    42 * minuteInSeconds +
                    33,
                'duration',
            ),
        ).toBe('5d 17h')
    })

    it('should return fallback when value is null', () => {
        expect(formatMetricValue(null, 'decimal')).toBe(NOT_AVAILABLE_TEXT)
    })

    it('should return percent on 0-1 float representing percentage', () => {
        expect(formatMetricValue(0.5, 'decimal-to-percent')).toBe('50%')
    })

    it('should round number to closest integer (up) when format is "decimal-percent-to-integer-percent"', () => {
        expect(
            formatMetricValue(0.555, 'decimal-percent-to-integer-percent'),
        ).toBe('56%')
    })

    it('should round number to closest integer (down) when format is "decimal-percent-to-integer-percent"', () => {
        expect(
            formatMetricValue(0.352, 'decimal-percent-to-integer-percent'),
        ).toBe('35%')
    })

    it('should show $ sign when format is "currency" and currency not specified', () => {
        expect(formatMetricValue(123456.789, 'currency')).toBe('$123,456.79')
    })

    it('should show $ sign when format is "currency" and currency is specified', () => {
        expect(formatMetricValue(123456.789, 'currency', 'JPY')).toBe(
            '¥123,456.79',
        )
    })

    it('should show $ sign and display up to 1 decimal place when format is "currency-precision-1" and currency is specified', () => {
        expect(
            formatMetricValue(123456.789, 'currency-precision-1', 'JPY'),
        ).toBe('¥123,456.8')
    })

    it('should render `x` sign if format is ratio', () => {
        expect(formatMetricValue(1.23, 'ratio')).toBe('1.23x')
    })

    it('should format value up to one decimal place and representing percentage when format is "    percent-refined"', () => {
        expect(formatMetricValue(123456.789, 'percent-refined')).toBe(
            '123,457%',
        )
    })
})

describe('getTrendColorFromValue', () => {
    it('should return "unchanged" when value is 0', () => {
        expect(getTrendColorFromValue(0, 'neutral')).toBe('unchanged')
    })

    it('should return "positive" when value is positive', () => {
        expect(getTrendColorFromValue(1, 'more-is-better')).toBe('positive')
    })

    it('should return "positive" when value is negative', () => {
        expect(getTrendColorFromValue(-1, 'less-is-better')).toBe('positive')
    })

    it('should return "negative" when value is positive and more is not better', () => {
        expect(getTrendColorFromValue(1, 'less-is-better')).toBe('negative')
    })

    it('should return "negative" when value is negative and more is not better', () => {
        expect(getTrendColorFromValue(-1, 'more-is-better')).toBe('negative')
    })

    it('should return "neutral" when value is 0 and more is not better', () => {
        expect(getTrendColorFromValue(1, 'neutral')).toBe('neutral')
    })
})

describe('formatMetricTrend', () => {
    it('should return default badge text when one of the values is null or undefined', () => {
        expect(formatMetricTrend(null, 1, 'decimal')).toMatchObject({
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        })
        expect(formatMetricTrend(1, null, 'decimal')).toMatchObject({
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        })
        expect(formatMetricTrend(undefined, 1, 'decimal')).toMatchObject({
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        })
        expect(formatMetricTrend(1, undefined, 'decimal')).toMatchObject({
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        })
    })

    it('should format trend up to one decimal when format is "decimal"', () => {
        expect(formatMetricTrend(13.14, 10, 'decimal')).toMatchObject({
            formattedTrend: '3.1',
            sign: 1,
        })
    })

    it('should format trend as duration with precision one when format is "duration"', () => {
        const minuteInSeconds = 60

        expect(
            formatMetricTrend(
                38 * minuteInSeconds + 15,
                21 * minuteInSeconds + 6,
                'duration',
            ),
        ).toMatchObject({
            formattedTrend: '17m',
            sign: 1,
        })
    })

    it('should format trend as percent with no decimal places when format is "percent"', () => {
        expect(formatMetricTrend(2.3, 1.2, 'percent')).toMatchObject({
            formattedTrend: '92%',
            sign: 1,
        })
    })

    it('should return undefined variation text when current value is non-zero and prev value is zero and the format is percent', () => {
        expect(formatMetricTrend(2.3, 0, 'percent')).toMatchObject({
            formattedTrend: UNDEFINED_VARIATION_TEXT,
            sign: 0,
        })
    })

    it('should format trend as 0 when current value is zero and prev value is zero and the format is percent', () => {
        expect(formatMetricTrend(0, 0, 'percent')).toMatchObject({
            formattedTrend: '0%',
        })
    })

    describe('division by zero edge cases', () => {
        it('should return undefined variation text when prevValue is 0 and value is positive', () => {
            expect(formatMetricTrend(10, 0, 'percent')).toMatchObject({
                formattedTrend: UNDEFINED_VARIATION_TEXT,
                sign: 0,
            })
        })

        it('should return undefined variation text when prevValue is 0 and value is negative', () => {
            expect(formatMetricTrend(-5, 0, 'percent')).toMatchObject({
                formattedTrend: UNDEFINED_VARIATION_TEXT,
                sign: 0,
            })
        })

        it('should return 0% when both values are 0', () => {
            expect(formatMetricTrend(0, 0, 'percent')).toMatchObject({
                formattedTrend: '0%',
                sign: 0,
            })
        })

        it('should return undefined variation text for decimal-to-percent format when prevValue is 0', () => {
            expect(
                formatMetricTrend(1.5, 0, 'decimal-to-percent'),
            ).toMatchObject({
                formattedTrend: UNDEFINED_VARIATION_TEXT,
                sign: 0,
            })
        })
    })

    it('should not return +0% when the result is to the degree of thousands and the format is percent', () => {
        expect(formatMetricTrend(1001, 1000, 'percent')).not.toMatchObject({
            formattedTrend: '0%',
            sign: 1,
        })
    })

    it('should not return -0% when the result is to the degree of thousands and the format is percent', () => {
        expect(formatMetricTrend(1000, 1001, 'percent')).not.toMatchObject({
            formattedTrend: '0%',
            sign: -1,
        })
    })

    it('should format trend as decimal-to-percent', () => {
        expect(
            formatMetricTrend(1000, 500, 'decimal-to-percent'),
        ).toMatchObject({
            formattedTrend: '100%',
            sign: 1,
        })
    })
})

describe('formatDuration', () => {
    it.each<[string, number, string]>([
        ['negative second', -20, '-20s'],
        ['empty value', 0, '0s'],
        ['less than a second', 0.6, '0s'],
        ['second', 1, '1s'],
        ['second with decimal', 1.8, '1s'],
        ['minute', 60, '1m'],
        ['hour', 3600, '1h'],
        ['day', 24 * 3600, '1d'],
        ['month', 24 * 3600 * 31, '1mo'],
        ['year', 24 * 3600 * 365 * 2, '1y 11mo 29d'],
    ])('should match template for %s', (testName, duration, expected) => {
        expect(formatDuration(duration)).toBe(expected)
    })

    it.each<[number, string]>([
        [1, '1mo'],
        [2, '1mo 01d'],
        [3, '1mo 01d 01h'],
        [4, '1mo 01d 01h 01m'],
        [5, '1mo 01d 01h 01m 01s'],
    ])('should match template for precision %i', (precision, expected) => {
        const duration = 24 * 3600 * 31 + 24 * 3600 + 3600 + 60 + 1
        expect(formatDuration(duration, precision)).toBe(expected)
    })

    it.each<[number, string]>([
        [1, '2y'],
        [2, '2y 1mo'],
        [3, '2y 1mo 01d'],
        [4, '2y 1mo 01d 01h'],
        [5, '2y 1mo 01d 01h 01m'],
        [6, '2y 1mo 01d 01h 01m 01s'],
    ])(
        'should match template with year for precision %i',
        (precision, expected) => {
            const duration =
                24 * 3600 * 365 * 2 + 24 * 3600 * 31 + 24 * 3600 + 3600 + 60 + 1
            expect(formatDuration(duration, precision)).toBe(expected)
        },
    )
})

describe('formatMetricValueOrString', () => {
    describe('without options', () => {
        it.each<[number, string]>([
            [1234.56, '1,234.56'],
            [0, '0'],
            [1000, '1,000'],
        ])('should format number %p as %s', (value, expected) => {
            const formatter = formatMetricValueOrString()
            expect(formatter(value)).toBe(expected)
        })

        it.each<[string, string]>([
            ['custom text', 'custom text'],
            ['100%', '100%'],
            ['', ''],
        ])('should return string %p unchanged', (value, expected) => {
            const formatter = formatMetricValueOrString()
            expect(formatter(value)).toBe(expected)
        })
    })
})
