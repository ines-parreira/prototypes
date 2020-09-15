import _floor from 'lodash/floor'

import {NonFractionalCurrency} from '../../constants/integrations/types/shopify'

export function formatPrice(
    price: number | string,
    currencyCode: string,
    shouldFloor = false
): string {
    const isNonFractional = Object.values(NonFractionalCurrency).includes(
        currencyCode.toUpperCase() as NonFractionalCurrency
    )
    const decimals = isNonFractional ? 0 : 2

    // See https://floating-point-gui.de/
    const parsedPrice = parseFloat(parseFloat(price as string).toFixed(3))

    return shouldFloor
        ? _floor(parsedPrice, decimals).toFixed(decimals)
        : parsedPrice.toFixed(decimals)
}

export function formatPercentage(value: number | string): string {
    return parseFloat(value as string).toFixed(2)
}
