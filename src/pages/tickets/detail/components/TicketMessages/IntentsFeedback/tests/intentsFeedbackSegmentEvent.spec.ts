import {
    logUserSubmissionEvent,
    logDropdownOpenEvent,
    DropdownOpenEventProps,
    UserSubmissionSubEventType,
} from '../intentsFeedbackSegmentEvents'
import {logEvent} from '../../../../../../../store/middlewares/segmentTracker.js'

jest.mock('../../../../../../../store/middlewares/segmentTracker.js')
const logEventMock = logEvent as jest.Mock

describe('Intents feedback segment utils', () => {
    const baseProps: DropdownOpenEventProps = {
        account_domain: 'acme',
        user_id: 1,
        ticket_id: 42,
        message_id: 314,
    }
    it('should log a submission event', () => {
        logUserSubmissionEvent({
            ...baseProps,
            is_first_curation: true,
            previous_state: [],
            next_state: ['other/no_reply'],
            sub_events: [
                {
                    event_type: UserSubmissionSubEventType.ADD_INTENT,
                    intent: 'other/no_reply',
                },
            ],
        })
        expect(logEventMock.mock.calls).toMatchSnapshot()
    })

    it('should log a dropdown open event', () => {
        logDropdownOpenEvent(baseProps)
        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
