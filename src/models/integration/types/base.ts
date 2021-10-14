import {ContentType, HttpMethod} from '../../api/types'
import {AuditLogEventType} from '../../event/types'

export type IntegrationBase = {
    created_datetime: string
    deactivated_datetime: Maybe<string>
    decoration: Maybe<IntegrationDecoration>
    deleted_datetime: Maybe<string>
    description: Maybe<string>
    http: Maybe<HttpIntegrationMeta>
    id: number
    locked_datetime: Maybe<string>
    mappings: Maybe<{id: number}[]>
    name: string
    updated_datetime: string
    uri: string
    user: {
        id: number
    }
}

export type IntegrationDecoration = {
    avatar_team_picture_url: Maybe<string>
    avatar_type: string
    conversation_color: string
    introduction_text: string
    main_color: string
    offline_introduction_text: string
}

type HttpIntegrationMeta = {
    execution_order: number
    form: Maybe<unknown>
    headers: {
        'Content-Type'?: ContentType
        'content-type'?: ContentType
    }
    id: number
    method: HttpMethod
    request_content_type: ContentType
    response_content_type: ContentType
    triggers: {
        [key in typeof AuditLogEventType[keyof typeof AuditLogEventType]]?: boolean
    }
    url: string
}
