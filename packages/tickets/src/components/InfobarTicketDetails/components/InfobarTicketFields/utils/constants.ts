import type { ValueOf } from '@repo/types'

import { ManagedTicketFieldType } from '@gorgias/helpdesk-types'

import type { CustomFieldValue } from '../../../../InfobarCustomerFields/types'
import type { VisibleTicketField } from '../hooks/useFilteredTicketFields'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const AITicketManagedTypes = {
    AiIntent: ManagedTicketFieldType.AiIntent,
    AiOutcome: ManagedTicketFieldType.AiOutcome,
    AiSales: ManagedTicketFieldType.AiSales,
    AiDiscount: ManagedTicketFieldType.AiDiscount,
    ManagedSentiment: ManagedTicketFieldType.ManagedSentiment,
} as const satisfies Record<string, ManagedTicketFieldType>

export type AITicketManagedType = ValueOf<typeof AITicketManagedTypes>

export type FieldEventHandlerParams = {
    field: VisibleTicketField
    nextValue: CustomFieldValue | undefined
}
