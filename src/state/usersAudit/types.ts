import {Map} from 'immutable'

import {
    AuditLogEventObjectType,
    AuditLogEventType,
} from '../../models/event/types'

export type UserAudit = {
    created_datetime: string
    id: number
    object_id: number
    object_type: AuditLogEventObjectType
    type: AuditLogEventType
    user_id: number
}

export type UsersAuditState = Map<any, any>
