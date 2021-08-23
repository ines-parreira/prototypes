import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {mockIncomingConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import OngoingPhoneCall from '../OngoingPhoneCall'
import {CallRecordingStatus} from '../../constants'

jest.mock('twilio-client')

describe('<OngoingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    const mockedServer = new MockAdapter(client)
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const integration = {
        id: integrationId,
        name: 'My Phone Integration',
        meta: {
            emoji: '❤️',
            preferences: {
                record_inbound_calls: true,
                record_outbound_calls: true,
            },
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()

        store = mockStore({
            twilio: {
                device: null,
                connection: null,
                isDialing: false,
                isRinging: false,
                isRecording: false,
            },
            integrations: fromJS({
                integrations: [integration],
            }),
        })
    })

    it('should render', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {container} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should mute call', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('mute-call-button'))
        expect(connection.mute).toHaveBeenCalled()
    })

    it('should end call', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('end-call-button'))
        expect(connection.disconnect).toHaveBeenCalled()
    })

    it('should start recording', async () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const url = `/api/integrations/${integrationId}/calls/fake-call-sid/recording`

        mockedServer.onPut(url).reply(200, {
            status: CallRecordingStatus.InProgress,
        })

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('record-call-button'))

        await waitFor(() => {
            expect(mockedServer.history).toMatchObject({
                put: [{url}],
            })
        })
    })
})
