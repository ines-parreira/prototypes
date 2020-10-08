// @flow
import {
    INTEGRATION_DATA_ITEM_TYPES_MAP,
    INTEGRATION_TYPES_MAP,
} from '../../constants/integration.ts'
import type {
    Product as IntegrationProduct,
    Variant as IntegrationVariant,
} from '../../constants/integrations/types/shopify'
import type {ContentType, HttpMethod} from '../api'
import type {AuditLogEventType} from '../event'

export type IntegrationType = $Values<typeof INTEGRATION_TYPES_MAP>

export type IntegrationDataItemType = $Values<
    typeof INTEGRATION_DATA_ITEM_TYPES_MAP
>

export type Product = IntegrationProduct
export type Variant = IntegrationVariant

export type IntegrationDataItem<T> = {
    id: number,
    integration_id: number,
    integration_type: IntegrationType,
    external_id: string,
    item_type: IntegrationDataItemType,
    search: string,
    data: T,
    created_datetime: string,
    updated_datetime: string,
    deleted_datetime: ?string,
}

type IntegrationConnectionType = 'facebook-page'

type IntegrationConnection = {
    data: {
        access_token: string,
        id: string,
        user_access_token: string,
    },
    id: number,
    type: IntegrationConnectionType,
    user: {
        id: number,
        name: string,
    },
    user_id: number,
}

type IntegrationDecoration = {
    avatar_team_picture_url: ?string,
    avatar_type: string,
    conversation_color: string,
    introduction_text: string,
    main_color: string,
    offline_introduction_text: string,
}

type IntegrationFacebook = {
    about: ?string,
    callback_url: string,
    category: string,
    id: number,
    name: string,
    page_id: string,
    picture: ?{
        data: {
            height: number,
            is_silhouette: boolean,
            url: string,
            width: number,
        },
    },
    settings: {
        import_history_enabled: boolean,
        instagram_ads_enabled: boolean,
        instagram_comments_enabled: boolean,
        messenger_enabled: boolean,
        posts_enabled: boolean,
    },
}

type IntegrationHttp = {
    execution_oder: number,
    form: any,
    headers: {
        'Content-Type'?: ContentType,
        'content-type'?: ContentType,
    },
    id: number,
    method: HttpMethod,
    request_content_type: ContentType,
    response_content_type: ContentType,
    triggers: {
        [key: ?AuditLogEventType]: boolean,
    },
    url: string,
}

export type Integration = {
    connections: IntegrationConnection[],
    created_datetime: string,
    deactivated_datetime: ?string,
    decoration: ?IntegrationDecoration,
    deleted_datetime: ?string,
    description: ?string,
    facebook: ?IntegrationFacebook,
    http: ?IntegrationHttp,
    id: number,
    locked_datetime: ?string,
    mappings: ?({id: number}[]),
    meta: {},
    name: string,
    type: IntegrationType,
    updated_datetime: string,
    uri: string,
    user: {
        id: number,
    },
}
