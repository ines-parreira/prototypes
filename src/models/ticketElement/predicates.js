//@flow
import type {TicketMessage} from './types'
import memoizeOne from 'memoize-one'

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
    return (hasPendingAction(message) && !hasFailedAction(message)) || message.isPending || false
}

export const isFailed = (message: TicketMessage): boolean => {
    return !!(!isPending(message) && (hasFailedAction(message) || message.failed_datetime))
}
