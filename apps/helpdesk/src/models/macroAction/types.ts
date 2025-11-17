import type { TicketPriority } from '@gorgias/helpdesk-types'

import type { User } from 'config/types/user'
import type { HttpMethod } from 'models/api/types'
import type { Team } from 'models/team/types'
import type { ApplyExternalTemplateActionArguments } from 'models/whatsAppMessageTemplates/types'

// partial sync with g/utils/action/constants.py
export enum MacroActionName {
    AddAttachments = 'addAttachments',
    AddInternalNote = 'addInternalNote',
    AddTags = 'addTags',
    ApplyExternalTemplate = 'applyExternalTemplate',
    ExcludeFromAutoMerge = 'excludeFromAutoMerge',
    ExcludeFromCSAT = 'excludeFromCSAT',
    ForwardByEmail = 'forwardByEmail',
    Http = 'http',
    RechargeActivateLastSubscription = 'rechargeActivateLastSubscription',
    RechargeCancelLastSubscription = 'rechargeCancelLastSubscription',
    RechargeRefundLastCharge = 'rechargeRefundLastCharge',
    RechargeRefundLastOrder = 'rechargeRefundLastOrder',
    RemoveTags = 'removeTags',
    SetAssignee = 'setAssignee',
    SetCustomFieldValue = 'setCustomFieldValue',
    SetCustomerCustomFieldValue = 'setCustomerCustomFieldValue',
    SetPriority = 'setPriority',
    SetResponseText = 'setResponseText',
    SetStatus = 'setStatus',
    SetSubject = 'setSubject',
    SetTeamAssignee = 'setTeamAssignee',
    ShopifyCancelLastOrder = 'shopifyCancelLastOrder',
    ShopifyCancelOrder = 'shopifyCancelOrder',
    ShopifyDuplicateLastOrder = 'shopifyDuplicateLastOrder',
    ShopifyEditNoteLastOrder = 'shopifyEditNoteOfLastOrder',
    ShopifyEditShippingAddressLastOrder = 'shopifyEditShippingAddressOfLastOrder',
    ShopifyFullRefundLastOrder = 'shopifyFullRefundLastOrder',
    ShopifyPartialRefundLastOrder = 'shopifyPartialRefundLastOrder',
    ShopifyRefundShippingCostLastOrder = 'shopifyRefundShippingCostOfLastOrder',
    SnoozeTicket = 'snoozeTicket',
    SnoozeTicketDuration = 'snoozeTicketDuration',
}

export type MacroResponseActionName =
    | MacroActionName.AddInternalNote
    | MacroActionName.SetResponseText
    | MacroActionName.ForwardByEmail

export enum MacroActionType {
    User = 'user',
}

// TODO extend ApplyExternalTemplate
export type MacroAction = {
    arguments: Partial<ApplyExternalTemplateActionArguments> & {
        attachments?: MacroActionAttachment[]
        body_html?: string
        body_text?: string
        tags?: string
        method?: HttpMethod
        headers?: Record<string, unknown>[]
        url?: string
        params?: Record<string, unknown>[]
        status?: string
        priority?: TicketPriority
        assignee_user?: User
        assignee_team?: Team
        subject?: string
        snooze_timedelta?: string
        to?: string
        cc?: string
        bcc?: string
        from?: string
        custom_field_id?: number
        value?: number | string | boolean
    }
    description?: string
    name: MacroActionName
    title: string
    type: MacroActionType
}

export type MacroActionAttachment = {
    url: string
    content_type?: string
    name?: string
    size?: number
}

export const actionTypeToName: { [key: string]: string } = {
    http: 'Http',
    shopify: 'Shopify',
    addInternalNote: 'Internal note',
}
