import { Cadence } from '../types'

export function getCadenceName(cadence: Cadence): string {
    switch (cadence) {
        case Cadence.Month:
            return 'Monthly'
        case Cadence.Quarter:
            return 'Quarterly'
        case Cadence.Year:
            return 'Yearly'
        default: {
            const __: never = cadence
            throw new Error(`Invalid cadence value: ${__}`)
        }
    }
}
