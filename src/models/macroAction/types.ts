import {HttpMethod} from '../api/types'
import type {User} from '../../config/types/user'
import type {Team} from '../../state/teams/types'

export enum MacroActionName {
    AddAttachments = 'addAttachments',
    AddInternalNote = 'addInternalNote',
    AddTags = 'addTags',
    Http = 'http',
    RechargeActivateLastSubscription = 'rechargeActivateLastSubscription',
    RechargeCancelLastSubscription = 'rechargeCancelLastSubscription',
    RechargeRefundLastCharge = 'rechargeRefundLastCharge',
    RechargeRefundLastOrder = 'rechargeRefundLastOrder',
    SetAssignee = 'setAssignee',
    SetResponseText = 'setResponseText',
    SetStatus = 'setStatus',
    SetSubject = 'setSubject',
    SetTeamAssignee = 'setTeamAssignee',
    ShopifyCancelLastOrder = 'shopifyCancelLastOrder',
    ShopifyCancelOrder = 'shopifyCancelOrder',
    ShopifyDuplicateLastOrder = 'shopifyDuplicateLastOrder',
    ShopifyEditShippingAddressLastOrder = 'shopifyEditShippingAddressOfLastOrder',
    ShopifyRefundShippingCostLastOrder = 'shopifyRefundShippingCostOfLastOrder',
    ShopifyFullRefundLastOrder = 'shopifyFullRefundLastOrder',
    ShopifyPartialRefundLastOrder = 'shopifyPartialRefundLastOrder',
    ShopifyEditNoteLastOrder = 'shopifyEditNoteOfLastOrder',
    SnoozeTicket = 'snoozeTicket',
    SnoozeTicketDuration = 'snoozeTicketDuration',
}

export enum MacroActionType {
    User = 'user',
}

export type MacroAction = {
    arguments: {
        attachments?: MacroActionAttachment[]
        body_html?: string
        body_text?: string
        tags?: string
        method?: HttpMethod
        headers?: Record<string, unknown>[]
        url?: string
        params?: Record<string, unknown>[]
        status?: string
        assignee_user?: User
        assignee_team?: Team
        subject?: string
        snooze_timedelta?: string
        to?: string
        cc?: string
        bcc?: string
        from?: string
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
export const actionTypeToName: {[key: string]: string} = {
    http: 'Http',
    shopify: 'Shopify',
    addInternalNote: 'Internal note',
}
