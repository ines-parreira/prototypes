/**
 * Safely divides two numbers, returning 0 if the divisor is 0 or if either number is null or undefined.
 *
 * @param {number | null} [a] - The dividend.
 * @param {number | null} [b] - The divisor.
 * @returns {number} - The result of the division, or 0 if the divisor is 0.
 */

const safeDivide = (a?: number | null, b?: number | null): number => {
    const dividend = a || 0
    const divisor = b || 0

    return divisor === 0 ? 0 : dividend / divisor
}

export default safeDivide
