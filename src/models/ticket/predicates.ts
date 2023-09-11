import memoizeOne from 'memoize-one'
import moment from 'moment'
import _get from 'lodash/get'

import {TicketVoiceCall} from 'models/voiceCall/types'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../business/types/ticket'

import type {
    GorgiasContactFormTicketMeta,
    TicketEvent,
    TicketMessage,
} from './types'

export const isTicketMessage = (
    obj: Record<string, unknown>
): obj is TicketMessage => obj.isMessage as boolean

export const isTicketEvent = (
    obj: Record<string, unknown>
): obj is TicketEvent => obj.isEvent as boolean

export const isTicketContactReasonSuggestion = (obj: Record<string, unknown>) =>
    obj.isContactReasonSuggestion as boolean

export const isTicketVoiceCall = (
    obj: Record<string, unknown>
): obj is TicketVoiceCall => {
    return obj.isVoiceCall as boolean
}

export const isTicketSatisfactionSurvey = (obj: Record<string, unknown>) =>
    obj.isSatisfactionSurvey as boolean

export const isTicketRuleSuggestion = (obj: Record<string, unknown>) =>
    obj.isRuleSuggestion as boolean

export const isTicketAISuggestion = (obj: Record<string, unknown>) =>
    obj.isAISuggestion as boolean

export const hasFailedAction = memoizeOne((message: TicketMessage): boolean => {
    if (!message.actions) {
        return false
    }
    return !!message.actions.find((action) => action.status === 'error')
})

export const hasPendingAction = (message: TicketMessage): boolean => {
    if (!message.actions) {
        return false
    }
    return !!message.actions.find((action) => action.status === 'pending')
}

export const isPending = (message: TicketMessage): boolean => {
    if (message.source && message.source.type === 'email') {
        return false
    }
    return (
        (hasPendingAction(message) && !hasFailedAction(message)) ||
        message.isPending ||
        false
    )
}

export const isFailed = (message: TicketMessage): boolean => {
    return !!(
        !isPending(message) &&
        (hasFailedAction(message) || message.failed_datetime)
    )
}

export const isGorgiasContactFormTicketMeta = (
    ticketMetaObj: unknown
): ticketMetaObj is {gorgias_contact_form: GorgiasContactFormTicketMeta} => {
    return (
        typeof _get(
            ticketMetaObj,
            ['gorgias_contact_form', 'contact_form_id'],
            null
        ) === 'number'
    )
}

export const isTicketMessageHidden = (message: TicketMessage): boolean => {
    if (message && message.source && message.source.type) {
        const isInstagramComment = [
            TicketMessageSourceType.InstagramComment,
            TicketMessageSourceType.InstagramAdComment,
        ].includes(message.source.type)
        const isFacebookComment =
            message.source &&
            (message.source.type === TicketMessageSourceType.FacebookComment ||
                message.source.type ===
                    TicketMessageSourceType.FacebookReviewComment)
        if (isInstagramComment || isFacebookComment) {
            if (message.meta && message.meta.hidden_datetime) {
                return true
            }
        }
    }
    return false
}

export const isTicketMessageDeleted = (message: TicketMessage): boolean => {
    if (message && message.source && message.source.type) {
        if (
            message.source.type === TicketMessageSourceType.FacebookComment ||
            message.source.type ===
                TicketMessageSourceType.FacebookReviewComment
        ) {
            if (message.meta && message.meta.deleted_datetime) {
                return true
            }
        }
    }
    return false
}

export const shouldMessagesBeGrouped = (
    msg1: TicketMessage,
    msg2: TicketMessage
): boolean => {
    if (!isTicketMessage(msg1) || !isTicketMessage(msg2)) {
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
