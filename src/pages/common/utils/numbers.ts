import _defaults from 'lodash/defaults'

const DEFAULT_OPTIONS = {
    maximumFractionDigits: 2,
}

export function formatPercentage(
    value: number,
    options?: Intl.NumberFormatOptions,
) {
    const optionsWithDefaults = _defaults(options, DEFAULT_OPTIONS)

    return new Intl.NumberFormat(window.navigator.language, {
        style: 'percent',
        ...optionsWithDefaults,
    }).format(value / 100)
}

export function ensureNumberValue(value: string | number): number {
    if (typeof value === 'number') {
        return value
    }
    return parseFloat(value)
}
