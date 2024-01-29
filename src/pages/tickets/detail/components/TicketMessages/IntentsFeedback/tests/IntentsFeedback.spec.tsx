import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {logEvent} from 'common/segment'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import client from 'models/api/resources'
import {message} from 'models/ticket/tests/mocks'
import {TicketMessageIntent} from 'models/ticket/types'

import {IntentsFeedback} from '../IntentsFeedback'

jest.mock('common/segment')
jest.mock('state/ticket/actions')

const mockStore = configureMockStore([thunk])

const logEventMock = logEvent as jest.Mock

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

    const minProps: ComponentProps<typeof IntentsFeedback> = {
        message: message,
        allIntents: window.GORGIAS_CONSTANTS.INTENTS,
    }

    const state = {
        currentAccount: fromJS(account),
        currentUser: fromJS(user),
    }

    const store = mockStore(state)

    describe('Single initial intent', () => {
        beforeEach(() => {
            jest.resetAllMocks()
            postMock.mockResolvedValue({data: {intents: messageIntents}})
            message.intents = messageIntents
        })

        it('should render active and available intents', () => {
            const {container} = render(
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should add an intent on click add', () => {
            const {getAllByText, container} = render(
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
            )
            fireEvent.click(getAllByText('add')[0])
            expect(container).toMatchSnapshot()
        })
        it('should remove an intent on click remove', () => {
            const {getAllByText, container} = render(
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
            )
            fireEvent.click(getAllByText('close')[0])
            expect(container).toMatchSnapshot()
        })
        it('should send the unsaved intents to the backend on dropdown toggle', () => {
            const {getAllByText, getByRole} = render(
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
            )
            fireEvent.click(getAllByText('add')[0])
            fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
            expect(postMock.mock.calls.length).toBe(1)
            expect(postMock.mock.calls).toMatchSnapshot()
        })
        it('should not call the API if no change was made to active intents', () => {
            const {getAllByText, getByRole} = render(
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
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
                <Provider store={store}>
                    <IntentsFeedback {...minProps} />
                </Provider>
            )
            fireEvent.click(getAllByText('add')[0])
            fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
            expect(postMock).not.toHaveBeenCalled()
        })

        describe('Segment tracking', () => {
            it('should send event on menu toggle', async () => {
                const {getByRole} = render(
                    <Provider store={store}>
                        <IntentsFeedback {...minProps} />
                    </Provider>
                )
                fireEvent.click(getByRole('button'))
                await waitFor(() => expect(logEventMock).toHaveBeenCalled())
                expect(logEventMock.mock.calls).toMatchSnapshot()
            })

            it('should send event on curation', async () => {
                const {getAllByText, getByRole} = render(
                    <Provider store={store}>
                        <IntentsFeedback {...minProps} />
                    </Provider>
                )
                fireEvent.click(getAllByText('close')[0])
                fireEvent.mouseLeave(getByRole('menu', {hidden: true}))
                await waitFor(() => expect(logEventMock).toHaveBeenCalled())
                expect(logEventMock.mock.calls).toMatchSnapshot()
            })
        })
    })
})
