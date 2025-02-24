export const formatDiscountMax = (value: number): number => {
    return parseFloat(value.toFixed(8).replace(/\.?0+$/, ''))
}
