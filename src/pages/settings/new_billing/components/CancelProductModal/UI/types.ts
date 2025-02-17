import {Cadence} from 'models/billing/types'

export type SummaryItemData = {
    title: string
    label: string | null
    cadence: Cadence
    quotaAmount: number
    counter: string
    amount: string
    strickenOut: boolean
}
