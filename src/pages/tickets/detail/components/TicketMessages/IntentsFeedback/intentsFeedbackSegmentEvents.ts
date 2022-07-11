import {
    logEvent,
    SegmentEvent,
} from '../../../../../../store/middlewares/segmentTracker'

type BaseIntentFeedbackProps = {
    account_domain: string
    user_id: number
    ticket_id: number
    message_id: number
}

export type DropdownOpenEventProps = BaseIntentFeedbackProps

type UserSubmissionEventProps = BaseIntentFeedbackProps & {
    previous_state: string[]
    next_state: string[]
    sub_events: UserSubmissionSubEventProps[]
}

export type UserSubmissionSubEventProps = {
    event_type: UserSubmissionSubEventType
    intent: string
}

export enum UserSubmissionSubEventType {
    REMOVE_INTENT = 'remove-intent',
    ADD_INTENT = 'add-intent',
}

export const logUserSubmissionEvent = (event: UserSubmissionEventProps) => {
    logEvent(SegmentEvent.IntentFeedbackUserSubmission, event)
}

export const logDropdownOpenEvent = (event: DropdownOpenEventProps) => {
    logEvent(SegmentEvent.IntentFeedbackDropdownOpen, event)
}
