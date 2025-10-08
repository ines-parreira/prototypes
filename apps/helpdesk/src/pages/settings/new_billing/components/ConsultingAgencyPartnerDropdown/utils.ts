type PartnerOption = {
    value: string
    label: string
}

/**
 * Converts a Partner or BPOPartner enum object to an array of dropdown options
 * The enum values are domain names (e.g., "a.community", "absoluteweb.com")
 * We format them as human-readable labels
 */
export function convertPartnerEnumToOptions(
    partnerEnum: Record<string, string>,
): PartnerOption[] {
    return Object.values(partnerEnum).map((value) => ({
        value,
        label: formatPartnerLabel(value),
    }))
}

/**
 * Formats a partner domain name into a readable label
 * Examples:
 * - "a.community" → "A Community"
 * - "absoluteweb.com" → "Absoluteweb"
 * - "athena-hub.com" → "Athena Hub"
 */
function formatPartnerLabel(domain: string): string {
    // Remove common generic and country-code TLDs
    const withoutTld = domain.replace(
        /\.(com|co|io|net|org|edu|gov|mil|int|info|biz|name|pro|de|uk|us|ca|au|fr|it|es|nl|be|ch|at|se|no|dk|fi|pl|ru|jp|cn|in|br|mx|ar|cl|pe|za|nz|sg|my|th|vn|ph|id|tw|hk|kr|is|ie|pt|gr|tr|ro|hu|cz|sk|bg|hr|si|lt|lv|ee|cy|mt|lu|co\.uk|com\.au|co\.nz|co\.za|com\.br|com\.mx|co\.in)$/,
        '',
    )

    // Replace dots, hyphens and underscores with spaces
    const withSpaces = withoutTld.replace(/[.\-_]/g, ' ')

    // Capitalize each word
    return withSpaces
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
