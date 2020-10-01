//@flow
import memoizeOne from 'memoize-one'

import {
    FACEBOOK_COMMENT_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
} from '../../config/ticket.ts'

import type {TicketMessage} from './types'

export const isTicketMessage = (obj: any) => obj.isMessage

export const isTicketEvent = (obj: any) => obj.isEvent

export const isTicketSatisfactionSurvey = (obj: any) => obj.isSatisfactionSurvey

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
            INSTAGRAM_COMMENT_SOURCE,
            INSTAGRAM_AD_COMMENT_SOURCE,
        ].includes(message.source.type)
        const isFacebookComment =
            message.source && message.source.type === FACEBOOK_COMMENT_SOURCE
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
        if (message.source.type === FACEBOOK_COMMENT_SOURCE) {
            if (message.meta && message.meta.deleted_datetime) {
                return true
            }
        }
    }
    return false
}
