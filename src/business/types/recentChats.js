//@flow
import type {TicketChannel, TicketStatus} from './ticket'

export type RecentChatTicket = {
    id: number,
    channel: TicketChannel,
    customer: {
        id: number,
        name: string,
        email: string,
    },
    last_message_datetime: string,
    is_unread: boolean,
    status: TicketStatus,
    assignee_user_id: ?number,
    spam: boolean,
    trashed_datetime: string,
    deleted_datetime: string,

    last_message_from_agent: ?boolean,
    last_message_body_text: ?string,
}
