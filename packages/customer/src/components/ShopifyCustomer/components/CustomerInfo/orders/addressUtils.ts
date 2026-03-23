export type Address = {
    name?: string
    address1?: string | null
    address2?: string | null
    city?: string | null
    province_code?: string | null
    country_code?: string
    country?: string | null
    zip?: string | null
}

export function getAddressParts(address: Address): string[] {
    const cityLine =
        [address.city, address.province_code].filter(Boolean).join(', ') + ','

    return [
        address.name,
        address.address1 ? `${address.address1},` : null,
        address.address2 ? `${address.address2},` : null,
        cityLine,
        `${address.country_code ?? address.country ?? ''} ${address.zip ?? ''}`.trim(),
    ].filter(Boolean) as string[]
}
