import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {Router} from 'react-router-dom'
import {History} from 'history'

import {mockIncomingConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import IncomingPhoneCall from '../IncomingPhoneCall'

jest.mock('twilio-client')

describe('<IncomingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    let history: History
    let wrapper: React.ComponentType
    const integrationId = 1
    const ticketId = 2
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
        history = ({
            location: {},
            push: jest.fn(),
            listen: jest.fn(),
        } as unknown) as History

        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: {emoji: '❤️'},
                    },
                ],
            }),
        })

        wrapper = (props) => (
            <Router history={history}>
                <Provider store={store}>{props?.children}</Provider>
            </Router>
        )
    })

    it('should render', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {container} = render(
            <IncomingPhoneCall connection={connection} />,
            {wrapper}
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should accept call', () => {
        const connection = mockIncomingConnection(
            integrationId,
            ticketId
        ) as Connection

        const {getByTestId} = render(
            <IncomingPhoneCall connection={connection} />,
            {wrapper}
        )

        fireEvent.click(getByTestId('accept-call-button'))
        expect(connection.accept).toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith(`/app/ticket/${ticketId}`)
    })

    it('should decline call', (done) => {
        const connection = mockIncomingConnection(
            integrationId,
            ticketId
        ) as Connection

        mockedServer.onPost('/integrations/phone/call/declined').reply(201)

        const {getByTestId} = render(
            <IncomingPhoneCall connection={connection} />,
            {wrapper}
        )

        fireEvent.click(getByTestId('decline-call-button'))
        expect(connection.ignore).toHaveBeenCalled()
        expect(history.push).not.toHaveBeenCalled()

        process.nextTick(() => {
            expect(mockedServer.history).toMatchSnapshot()
            done()
        })
    })

    it('should open ticket page', () => {
        const connection = mockIncomingConnection(
            integrationId,
            ticketId
        ) as Connection

        const {getByTestId} = render(
            <IncomingPhoneCall connection={connection} />,
            {wrapper}
        )

        fireEvent.click(getByTestId('incoming-phone-call'))
        expect(history.push).toHaveBeenCalledWith(`/app/ticket/${ticketId}`)
    })
})
