import { NonFractionalCurrency } from '../../constants/integrations/types/shopify'

function shiftDecimal(value: number, exponent: number): number {
    const [coefficient, currentExponent = '0'] = `${value}e`.split('e')
    return Number(`${coefficient}e${Number(currentExponent) + exponent}`)
}

export function floorWithPrecision(value: number, precision: number): number {
    return shiftDecimal(Math.floor(shiftDecimal(value, precision)), -precision)
}

export function ceilWithPrecision(value: number, precision: number): number {
    return shiftDecimal(Math.ceil(shiftDecimal(value, precision)), -precision)
}

export function formatPrice(
    price: number | string,
    currencyCode: string,
    shouldFloor = false,
): string {
    const isNonFractional = Object.values(NonFractionalCurrency).includes(
        currencyCode.toUpperCase() as NonFractionalCurrency,
    )
    const decimals = isNonFractional ? 0 : 2

    // See https://floating-point-gui.de/
    const parsedPrice = parseFloat(parseFloat(price as string).toFixed(3))

    return shouldFloor
        ? floorWithPrecision(parsedPrice, decimals).toFixed(decimals)
        : parsedPrice.toFixed(decimals)
}

export function formatPercentage(value: number | string): string {
    return parseFloat(value as string).toFixed(2)
}
