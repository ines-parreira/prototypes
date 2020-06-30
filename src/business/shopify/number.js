// @flow

import _floor from 'lodash/floor'

import {NON_FRACTIONAL_CURRENCIES} from '../../constants/integrations/shopify'

export function formatPrice(
    price: number | string,
    currencyCode: string,
    shouldFloor: boolean = false
): string {
    const isNonFractional = NON_FRACTIONAL_CURRENCIES.includes(
        currencyCode.toUpperCase()
    )
    const decimals = isNonFractional ? 0 : 2

    // See https://floating-point-gui.de/
    const parsedPrice = parseFloat(parseFloat(price).toFixed(3))

    return shouldFloor
        ? _floor(parsedPrice, decimals).toFixed(decimals)
        : parsedPrice.toFixed(decimals)
}

export function formatPercentage(value: number | string): string {
    return parseFloat(value).toFixed(2)
}
