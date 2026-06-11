import type { TicketPartial as ApiTicketPartial } from 'models/ticket/types'

import type { TicketPartial } from '../types'

export function transformApiTicketPartial(t: ApiTicketPartial): TicketPartial {
    return {
        ...t,
        updated_datetime: (t.updated_datetime
            ? new Date(t.updated_datetime)
            : new Date()
        ).getTime(),
    }
}
