import {ApiTicketPartial, TicketPartial} from '../types'

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
