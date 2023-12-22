import {TicketPartial as ApiTicketPartial} from 'models/ticket/types'

import {TicketPartial} from '../types'

export default function transformApiTicketPartial(
    t: ApiTicketPartial
): TicketPartial {
    return {
        ...t,
        updated_datetime: (t.updated_datetime
            ? new Date(t.updated_datetime)
            : new Date()
        ).getTime(),
    }
}
