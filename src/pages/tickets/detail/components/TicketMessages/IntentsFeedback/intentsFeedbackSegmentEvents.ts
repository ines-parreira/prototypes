import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker.js'

type BaseIntentFeedbackProps = {
    account_domain: string
    user_id: number
    ticket_id: number
    message_id: number
}

export type DropdownOpenEventProps = BaseIntentFeedbackProps

type UserSubmissionEventProps = BaseIntentFeedbackProps & {
    is_first_curation: boolean
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
    CONFIRM_INTENT = 'confirm-intent',
}

export const logUserSubmissionEvent = (event: UserSubmissionEventProps) => {
    segmentTracker.logEvent(
        segmentTracker.EVENTS.INTENT_FEEDBACK_USER_SUBMISSION,
        event
    )
}

export const logDropdownOpenEvent = (event: DropdownOpenEventProps) => {
    segmentTracker.logEvent(
        segmentTracker.EVENTS.INTENT_FEEDBACK_DROPDOWN_OPEN,
        event
    )
}
