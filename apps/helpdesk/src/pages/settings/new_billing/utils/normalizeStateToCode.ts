import { states } from 'config/states'

/**
 * Normalizes state values from full names to 2-letter codes for Stripe AddressElement.
 * Chargebee stores US states as full names (e.g., "Colorado"), but Stripe expects
 * 2-letter codes (e.g., "CO").
 *
 * @param state - The state value (either full name or 2-letter code)
 * @param country - The country code (e.g., "US", "CA")
 * @returns The 2-letter state code, or the original value if no mapping found
 *
 * @example
 * normalizeStateToCode('Colorado', 'US') // returns 'CO'
 * normalizeStateToCode('CO', 'US') // returns 'CO'
 * normalizeStateToCode('British Columbia', 'CA') // returns 'BC'
 * normalizeStateToCode(null, 'US') // returns null
 * normalizeStateToCode('Colorado', '') // returns 'Colorado'
 */
export function normalizeStateToCode(
    state: string | null,
    country: string,
): string | null {
    if (!state || !country) return state

    if (state.length === 2) {
        return state.toUpperCase()
    }

    const countryStates = states[country]
    if (!countryStates) return state

    /**
     * Normalizes a string for accent-insensitive, case-insensitive comparison.
     * Required to correctly match values like "Québec" vs "Quebec".
     */
    const normalizeString = (str: string) =>
        str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const normalizedState = normalizeString(state)
    const stateObj = countryStates.find(
        (s) => normalizeString(s.name) === normalizedState,
    )

    return stateObj?.code ?? state
}
