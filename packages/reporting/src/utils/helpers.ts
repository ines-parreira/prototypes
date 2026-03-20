import moment from 'moment-timezone'

import { IconName } from '@gorgias/axiom'

import {
    DEFAULT_BADGE_TEXT,
    DEFAULT_LOCALE,
    NOT_AVAILABLE_PLACEHOLDER,
    NOT_AVAILABLE_TEXT,
    UNDEFINED_VARIATION_TEXT,
} from '../constants'
import type {
    MetricTrendFormat,
    MetricValueFormat,
    TrendColor,
    TrendDirection,
} from '../types'

/**
 * Display a duration in days, hours, minutes and seconds
 * @param value - The duration in seconds.
 * @param precision - The precision of the duration.
 * @returns The formatted duration as a string.
 */
const formatDuration = (value: number, precision = 9): string => {
    if (!value || (value > -1 && value < 1)) {
        return '0s'
    }

    const duration = moment.duration(value, 'seconds')
    let currentPrecision = 0
    const parts = [
        [duration.years(), 'y'],
        [duration.months(), 'mo'],
        [duration.days(), 'd'],
        [duration.hours(), 'h'],
        [duration.minutes(), 'm'],
        [duration.seconds(), 's'],
    ].reduce<string[]>((acc, [num, unit]) => {
        if (num && currentPrecision < precision) {
            acc.push(`${num}${unit}`.padStart(3, '0'))
            currentPrecision++
        }
        return acc
    }, [])

    const result = parts.join(' ')

    if (result.startsWith('0')) {
        return result.slice(1)
    }
    return result
}

/**
 * Format a trend as a percentage
 * @param prevValue - The previous value.
 * @param absDiff - The absolute difference between the current and previous values.
 * @returns The formatted trend as a string or null if the value is not finite.
 */
const formatTrendAsPercent = (
    prevValue: number,
    absDiff: number,
): string | null => {
    // When both values are 0, there's no change - return "0%"
    if (prevValue === 0 && absDiff === 0) {
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: 'percent',
            maximumFractionDigits: 0,
        }).format(0)
    }

    // When prevValue is 0 but there is a difference,
    // we cannot calculate a percentage - return undefined variation text
    if (prevValue === 0) {
        return UNDEFINED_VARIATION_TEXT
    }

    const value = absDiff / prevValue || 0
    return Number.isFinite(value)
        ? new Intl.NumberFormat(DEFAULT_LOCALE, {
              style: 'percent',
              maximumFractionDigits: 0,
          }).format(value)
        : null
}

/**
 * Format a metric trend into a string and a sign
 * @param value - The current value.
 * @param prevValue - The previous value.
 * @param format - The format of the trend MetricTrendFormat.
 * @returns An object with the formatted trend and the sign
 */
const formatMetricTrend = (
    value: number | null | undefined,
    prevValue: number | null | undefined,
    format: MetricTrendFormat,
): {
    formattedTrend: string | null
    sign: number
} => {
    if (
        value === undefined ||
        value === null ||
        prevValue === undefined ||
        prevValue === null
    ) {
        return {
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        }
    }

    const diff = value - prevValue
    const absDiff = Math.abs(diff)
    let formattedDiff: string | null

    if (format === 'duration') {
        formattedDiff = formatDuration(absDiff, 1)
    } else if (format === 'decimal-to-percent') {
        formattedDiff = formatTrendAsPercent(prevValue * 100, absDiff * 100)
    } else if (
        format === 'percent' ||
        format === 'currency' ||
        format === 'currency-precision-1'
    ) {
        formattedDiff = formatTrendAsPercent(prevValue, absDiff)
    } else {
        formattedDiff = Intl.NumberFormat(DEFAULT_LOCALE, {
            maximumFractionDigits: 1,
        }).format(absDiff)
    }

    // If the formatted diff is the undefined variation text, return it with sign 0
    if (formattedDiff === UNDEFINED_VARIATION_TEXT) {
        return {
            formattedTrend: formattedDiff,
            sign: 0,
        }
    }

    if (formattedDiff === null || parseFloat(formattedDiff) === 0) {
        return {
            formattedTrend: DEFAULT_BADGE_TEXT,
            sign: 0,
        }
    }

    return {
        formattedTrend: formattedDiff,
        sign: diff > 0 ? 1 : diff < 0 ? -1 : 0,
    }
}

/**
 * Get the trend color from a value
 * @param value - The value to get the trend color from
 * @param trendDirection - The direction as of the trend
 * @returns The trend color
 */
function getTrendColorFromValue(
    value: number,
    trendDirection: TrendDirection,
): TrendColor {
    if (value === 0) return 'unchanged'

    switch (trendDirection) {
        case 'more-is-better':
            return value > 0 ? 'positive' : 'negative'
        case 'less-is-better':
            return value > 0 ? 'negative' : 'positive'
        default:
            return 'neutral'
    }
}

/**
 * Get the trend icon from the value sign
 * @param sign - The value sign to get the icon from
 * @returns The trend icon or null if zero
 */
function getTrendIconFromSign(sign: number): IconName | null {
    switch (sign) {
        case 1:
            return IconName.TrendingUp
        case -1:
            return IconName.TrendingDown
        default:
            return null
    }
}

/**
 * Format a value to a decimal
 * @param value - The value to format
 * @param formatOptions - The format options
 * @returns value as a decimal
 */
const metricToDecimal = (
    value: number,
    formatOptions?: Intl.NumberFormatOptions,
): string => {
    return value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
        ...formatOptions,
    })
}

/**
 * Format a value to an integer
 * @param value - The value to format
 * @returns value as an integer
 */
const metricToInteger = (value: number): string =>
    value.toLocaleString(DEFAULT_LOCALE, {
        maximumFractionDigits: 0,
    })

/**
 * Format a value to a currency
 * @param value - The value to format
 * @param currency - The currency to format
 * @param formatOptions - The format options
 * @returns value as a currency
 */
const formatCurrency = (
    value: number,
    currency: string,
    formatOptions?: Intl.NumberFormatOptions,
): string =>
    value.toLocaleString(DEFAULT_LOCALE, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
        ...formatOptions,
    })

/**
 * Format a value to a metric value format
 * @param value - The value to format
 * @param format - The format of the metric value
 * @param currency - The currency to format
 * @param usePlaceholder - Whether to use placeholder ('-') instead of 'N/A' for null/undefined values
 * @returns value depending on the format and currency
 */
const formatMetricValue = (
    value: number | null | undefined,
    format: MetricValueFormat = 'decimal',
    currency: string = 'USD',
    usePlaceholder: boolean = false,
    compact: boolean = false,
) => {
    const compactOption: Intl.NumberFormatOptions = compact
        ? { notation: 'compact', compactDisplay: 'short' }
        : {}
    if (value === null || value === undefined) {
        return usePlaceholder ? NOT_AVAILABLE_PLACEHOLDER : NOT_AVAILABLE_TEXT
    }

    if (format === 'duration') {
        return formatDuration(value, 2)
    }

    if (format === 'decimal-to-percent') {
        return `${metricToDecimal(value * 100, compactOption)}%`
    }

    if (format === 'decimal-to-percent-precision-1') {
        return `${metricToDecimal(value * 100, {
            maximumFractionDigits: 1,
            ...compactOption,
        })}%`
    }

    if (format === 'percent') {
        return `${metricToDecimal(value, compactOption)}%`
    }

    if (format === 'percent-precision-1') {
        return `${metricToDecimal(value, {
            maximumFractionDigits: 1,
            ...compactOption,
        })}%`
    }

    if (format === 'percent-refined') {
        return `${metricToDecimal(value, {
            maximumFractionDigits: value > 0.5 ? 0 : 1,
            ...compactOption,
        })}%`
    }

    if (format === 'integer') {
        return metricToInteger(Math.ceil(value))
    }

    if (format === 'decimal-percent-to-integer-percent') {
        return `${metricToInteger(Math.round(value * 100))}%`
    }

    if (format === 'currency') {
        return `${formatCurrency(value, currency, compactOption)}`
    }

    if (format === 'currency-precision-1') {
        return `${formatCurrency(value, currency, {
            maximumFractionDigits: 1,
            ...compactOption,
        })}`
    }

    if (format === 'ratio') {
        return `${metricToDecimal(value, compactOption)}x`
    }

    if (format === 'decimal-precision-1') {
        return metricToDecimal(value, {
            maximumFractionDigits: 1,
            ...compactOption,
        })
    }

    return metricToDecimal(value, compactOption)
}

const formatMetricValueOrString =
    (options?: {
        metricFormat?: MetricTrendFormat
        currency?: string
        compact?: boolean
    }) =>
    (value: number | string | undefined) => {
        if (typeof value === 'number') {
            return formatMetricValue(
                value,
                options?.metricFormat,
                options?.currency,
                false,
                options?.compact ?? false,
            )
        }

        return value ?? NOT_AVAILABLE_TEXT
    }

export {
    getTrendColorFromValue,
    getTrendIconFromSign,
    formatMetricValue,
    formatMetricTrend,
    formatDuration,
    formatMetricValueOrString,
}
