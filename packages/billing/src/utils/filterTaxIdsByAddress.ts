import { TAX_ID_VALIDATION } from '../constants'
import { TaxIdType } from '../types'

export type TaxIdValues = Partial<Record<TaxIdType, string>>

export const filterTaxIdsByAddress = (
    taxIds: TaxIdValues,
    address: {
        country?: string
        state?: string | null
    },
) => {
    return Object.fromEntries(
        Object.entries(taxIds).map(([type, value]) => {
            const validation = TAX_ID_VALIDATION[type as TaxIdType]

            if (
                address.country &&
                validation?.countries.includes(address.country)
            ) {
                const states = validation.states

                if (
                    !states ||
                    (address.state && states.includes(address.state))
                ) {
                    return [type, value]
                }
            }

            return [type, undefined]
        }),
    ) as TaxIdValues
}
