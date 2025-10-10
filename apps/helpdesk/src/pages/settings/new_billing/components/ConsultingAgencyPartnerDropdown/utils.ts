type PartnerOption = {
    value: string
    label: string
}

/**
 * Converts a Partner or BPOPartner enum object to an array of dropdown options
 * The enum values are domain names (e.g., "a.community", "absoluteweb.com")
 */
export function convertPartnerEnumToOptions(
    partnerEnum: Record<string, string>,
): PartnerOption[] {
    return Object.values(partnerEnum).map((value) => ({
        value,
        label: value,
    }))
}
