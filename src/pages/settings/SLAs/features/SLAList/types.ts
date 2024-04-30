import {TicketChannel} from 'business/types/ticket'

export type UISLAPolicy = {
    uuid: string
    name: string
    channels: TicketChannel[] | null
    isActive: boolean
    updatedDatetime: string | null
}

export enum TableColumn {
    PolicyName = 'policy_name',
    UpdatedDatetime = 'updated_datetime',
    Channels = 'channels',
}
