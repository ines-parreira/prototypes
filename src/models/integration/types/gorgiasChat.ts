// g/integrations/gorgias_chat/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase, IntegrationDecoration} from './base'

import type {Integration} from './'

export type GorgiasChatIntegration = IntegrationBase & {
    type: IntegrationType.GorgiasChat
    meta: GorgiasChatIntegrationMeta
    decoration: IntegrationDecoration & {
        position: GorgiasChatPosition
    }
}

export type GorgiasChatIntegrationMeta = {
    app_id?: string
    campaigns?: Campaign[]
    language?: string
    preferences?: {
        email_capture_enforcement: GorgiasChatEmailCaptureType
        auto_responder?: {
            enabled: boolean
            description: string
        }
        linked_email_integration?: Maybe<number>
    }
    shopify_integration_ids?: string[]
    shop_name?: Maybe<string>
    shop_type?: Maybe<string>
    shop_integration_id?: Maybe<number>
    quick_replies?: {
        enabled: boolean
        replies: string[]
    }
    self_service: {
        enabled?: boolean
        configurations?: SelfServiceConfiguration[]
    }
    position?: GorgiasChatPosition
    status?: GorgiasChatStatusEnum
}

enum GorgiasChatEmailCaptureType {
    Optional = 'optional',
    RequiredOutsideBusinessHours = 'required-outside-business-hours',
    AlwaysRequired = 'always-required',
}

export type Campaign = {
    id: string
    message: {
        author?: {
            avatar_url: string
            email: string
            name: string
        }
        html: string
        text: string
    }
    name: string
    triggers: Record<string, unknown>
}

export type SelfServiceConfiguration = {
    base_url: string
    enabled: boolean
    integration_id?: number
}

export const isGorgiasChatIntegration = createTypeGuard<
    Maybe<Integration>,
    GorgiasChatIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.GorgiasChat ? input : undefined
)

export enum GorgiasChatPositionAlignmentEnum {
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
}

export interface GorgiasChatPosition {
    alignment: GorgiasChatPositionAlignmentEnum
    offsetX: number
    offsetY: number
}

export enum GorgiasChatStatusEnum {
    ONLINE = 'online',
    OFFLINE = 'offline',
    HIDDEN = 'hidden',
    HIDDEN_OUTSIDE_BUSINESS_HOURS = 'hidden-outside-business-hours',
}
