import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'

import {fromJS} from 'immutable'

import {IntentsFeedbackContainer} from '../IntentsFeedback'
import {message} from '../../../../../../../models/ticket/tests/mocks'
import {account} from '../../../../../../../fixtures/account'
import {user} from '../../../../../../../fixtures/users'
import {sendIntentFeedbackSuccess} from '../../../../../../../state/ticket/actions'
import {TicketMessageIntent} from '../../../../../../../models/ticket/types'
import {logEvent} from '../../../../../../../store/middlewares/segmentTracker'
import client from '../../../../../../../models/api/resources'

jest.mock('../../../../../../../state/ticket/actions')

jest.mock('../../../../../../../store/middlewares/segmentTracker')

const logEventMock = logEvent as jest.Mock

const sendIntentFeedbackSuccessMock = sendIntentFeedbackSuccess as jest.Mocked<
    typeof sendIntentFeedbackSuccess
>
const postMock = jest.spyOn(client, 'post')

window.GORGIAS_CONSTANTS = {
    INTENTS: {
        'foo/intent': 'foo intent description',
        'bar/intent': 'bar intent description',
        'baz/intent': 'baz intent description',
        'other/intent': 'other intent description',
    },
}
describe('<IntentsFeedback />', () => {
    const messageIntents: TicketMessageIntent[] = [
        {
            name: 'foo/intent',
            is_user_feedback: true,
            rejected: false,
        },
    ]

    const minProps: ComponentProps<typeof IntentsFeedbackContainer> = {
        message: message,
        notify: jest.fn(),
        sendIntentFeedbackSuccess: sendIntentFeedbackSuccessMock,
        allIntents: window.GORGIAS_CONSTANTS.INTENTS,
        account: fromJS(account),
        user: fromJS(user),
    }

    describe('Single initial intent', () => {
        beforeEach(() => {
            jest.resetAllMocks()
            postMock.mockResolvedValue({data: {intents: messageIntents}})
            message.intents = messageIntents
        })

        it('should render active and available intents', () => {
            const {container} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should add an intent on click add', () => {
            const {getAllByText, container} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            fireEvent.click(getAllByText('add')[0])
            expect(container).toMatchSnapshot()
        })
        it('should remove an intent on click remove', () => {
            const {getAllByText, container} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            fireEvent.click(getAllByText('close')[0])
            expect(container).toMatchSnapshot()
        })
        it('should send the unsaved intents to the backend on dropdown toggle', () => {
            const {getAllByText, getByRole} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            fireEvent.click(getAllByText('add')[0])
            fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
            expect(postMock.mock.calls.length).toBe(1)
            expect(postMock.mock.calls).toMatchSnapshot()
        })
        it('should not call the API if no change was made to active intents', () => {
            const {getAllByText, getByRole} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            fireEvent.click(getAllByText('add')[0]) // add bar/intent
            fireEvent.click(getAllByText('close')[0]) // remove bar/intent
            fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
            expect(postMock).not.toHaveBeenCalled()
        })
    })

    describe('Multiple initial intents', () => {
        const messageIntents: TicketMessageIntent[] = [
            {
                name: 'foo/intent',
                is_user_feedback: false,
                rejected: null,
            },
            {
                name: 'bar/intent',
                is_user_feedback: false,
                rejected: null,
            },
            {
                name: 'baz/intent',
                is_user_feedback: false,
                rejected: null,
            },
        ]

        beforeEach(() => {
            jest.resetAllMocks()
            postMock.mockResolvedValue({data: {intents: messageIntents}})
            message.intents = messageIntents
        })

        it('should not be able to add intent when three are active', () => {
            const {getAllByText, getByRole} = render(
                <IntentsFeedbackContainer {...minProps} />
            )
            fireEvent.click(getAllByText('add')[0])
            fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
            expect(postMock).not.toHaveBeenCalled()
        })

        describe('Segment tracking', () => {
            it('should send event on menu toggle', async () => {
                const {getByRole} = render(
                    <IntentsFeedbackContainer {...minProps} />
                )
                fireEvent.click(getByRole('button'))
                await waitFor(() => expect(logEventMock).toHaveBeenCalled())
                expect(logEventMock.mock.calls).toMatchSnapshot()
            })

            it('should send event on curation', async () => {
                const {getAllByText, getByRole} = render(
                    <IntentsFeedbackContainer {...minProps} />
                )
                fireEvent.click(getAllByText('close')[0])
                fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
                await waitFor(() => expect(logEventMock).toHaveBeenCalled())
                expect(logEventMock.mock.calls).toMatchSnapshot()
            })
        })
    })
})
