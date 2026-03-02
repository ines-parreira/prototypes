import { isObject } from 'lodash'
import _get from 'lodash/get'
import memoizeOne from 'memoize-one'
import moment from 'moment'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { MessageMetadataType } from 'models/ticket/types'
import type {
    GorgiasContactFormTicketMeta,
    Source,
    SourceAddress,
    TicketEvent,
    TicketMessage as TicketMessage_DEPRECATED,
} from 'models/ticket/types'

export const isTicketMessage = (
    obj: Record<string, unknown>,
): obj is TicketMessage_DEPRECATED => obj.isMessage as boolean

export const isTicketEvent = (
    obj: Record<string, unknown>,
): obj is TicketEvent => obj.isEvent as boolean

export function isSource(input: unknown): input is Source {
    const maybeSource = input as Source
    return isObject(maybeSource) && typeof maybeSource?.type === 'string'
}

export function isTicketMessageSourceType(
    input: unknown,
): input is TicketMessageSourceType {
    return Object.values<string>(TicketMessageSourceType).includes(
        input as string,
    )
}

export function isTicketChannel(input: unknown): input is TicketChannel {
    return Object.values<string>(TicketChannel).includes(input as string)
}

export const isTicketContactReasonSuggestion = (obj: Record<string, unknown>) =>
    obj.isContactReasonSuggestion as boolean

export const isTicketSatisfactionSurvey = (obj: Record<string, unknown>) =>
    obj.isSatisfactionSurvey as boolean

export const isTicketRuleSuggestion = (obj: Record<string, unknown>) =>
    obj.isRuleSuggestion as boolean

export const hasFailedAction = memoizeOne(
    (message: TicketMessage_DEPRECATED | TicketMessage): boolean => {
        if (!message.actions) {
            return false
        }
        return !!message.actions.find((action) => action.status === 'error')
    },
)

export const hasPendingAction = (
    message: TicketMessage_DEPRECATED | TicketMessage,
): boolean => {
    if (!message.actions) {
        return false
    }
    return !!message.actions.find((action) => action.status === 'pending')
}

export const isPending = (
    message: TicketMessage_DEPRECATED | TicketMessage,
): boolean => {
    if (message.source && message.source.type === 'email') {
        return false
    }
    return (
        (hasPendingAction(message) && !hasFailedAction(message)) ||
        (message as TicketMessage_DEPRECATED).isPending ||
        false
    )
}

export const isFailed = (
    message: TicketMessage_DEPRECATED | TicketMessage,
): boolean => {
    return !!(
        !isPending(message) &&
        (hasFailedAction(message) || message.failed_datetime)
    )
}

export const isGorgiasContactFormTicketMeta = (
    ticketMetaObj: unknown,
): ticketMetaObj is { gorgias_contact_form: GorgiasContactFormTicketMeta } => {
    return (
        typeof _get(
            ticketMetaObj,
            ['gorgias_contact_form', 'contact_form_id'],
            null,
        ) === 'number'
    )
}

export const isTicketMessageHidden = (
    message: TicketMessage_DEPRECATED | TicketMessage,
): boolean => {
    if (message && message.source && message.source.type) {
        const isInstagramComment = [
            TicketMessageSourceType.InstagramComment,
            TicketMessageSourceType.InstagramAdComment,
        ].includes(message.source.type as TicketMessageSourceType)
        const isFacebookComment =
            message.source &&
            (message.source.type === TicketMessageSourceType.FacebookComment ||
                message.source.type ===
                    TicketMessageSourceType.FacebookReviewComment)
        if (isInstagramComment || isFacebookComment) {
            if (
                message.meta &&
                (message.meta as Record<string, unknown>).hidden_datetime
            ) {
                return true
            }
        }
    }
    return false
}

export const isTicketMessageDeleted = (
    message: TicketMessage_DEPRECATED | TicketMessage,
): boolean => {
    if (message && message.source && message.source.type) {
        if (
            message.source.type === TicketMessageSourceType.FacebookComment ||
            message.source.type ===
                TicketMessageSourceType.FacebookReviewComment
        ) {
            if (
                message.meta &&
                (message.meta as Record<string, unknown>).deleted_datetime
            ) {
                return true
            }
        }
    }
    return false
}

export const shouldMessagesBeGrouped = (
    msg1: TicketMessage_DEPRECATED,
    msg2: TicketMessage_DEPRECATED,
): boolean => {
    if (!isTicketMessage(msg1) || !isTicketMessage(msg2)) {
        return false
    }

    // Signal messages types were introduced for communication between ai-agent and chat
    // These are empty messages that should not be displayed nor should they impact visibility of other messages. Therefore we enforce that they're never grouped
    if (
        msg1.meta?.type === MessageMetadataType.Signal ||
        msg2.meta?.type === MessageMetadataType.Signal
    ) {
        return false
    }

    const groupingChannels = [
        TicketChannel.FacebookMessenger,
        TicketChannel.Chat,
    ]
    const groupingDuration = moment.duration('PT5M')

    const msg1Created = moment(msg1.created_datetime)
    const msg2Created = moment(msg2.created_datetime)

    return (
        msg1.sender.id === msg2.sender.id &&
        msg1.channel === msg2.channel &&
        msg1.public === msg2.public &&
        msg1.from_agent === msg2.from_agent &&
        groupingChannels.includes(msg1.channel) &&
        msg2Created.isBefore(msg1Created.add(groupingDuration))
    )
}

export function isSourceAddress(input: unknown): input is SourceAddress {
    const sourceAddress = input as SourceAddress
    return (
        isObject(sourceAddress) &&
        typeof sourceAddress?.name === 'string' &&
        typeof sourceAddress?.address === 'string'
    )
}
