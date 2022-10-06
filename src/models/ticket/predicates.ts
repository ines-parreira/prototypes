import memoizeOne from 'memoize-one'

import {TicketMessageSourceType} from '../../business/types/ticket'

import type {TicketMessage} from './types'

export const isTicketMessage = (obj: Record<string, unknown>) =>
    obj.isMessage as boolean

export const isTicketEvent = (obj: Record<string, unknown>) =>
    obj.isEvent as boolean

export const isTicketSatisfactionSurvey = (obj: Record<string, unknown>) =>
    obj.isSatisfactionSurvey as boolean

export const isTicketRuleSuggestion = (obj: Record<string, unknown>) =>
    obj.isRuleSuggestion as boolean

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
