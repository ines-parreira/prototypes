import React, {ComponentProps} from 'react'
import {cleanup, fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {Router} from 'react-router-dom'
import {History} from 'history'

import {mockFlags} from 'jest-launchdarkly-mock'
import {mockIncomingCall} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import IncomingPhoneCall from '../IncomingPhoneCall'
import * as hooks from '../../hooks'

jest.mock('@twilio/voice-sdk')

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({agentId}: {agentId: number}) =>
            <div>VoiceCallAgentLabel {agentId}</div>
)

describe('<IncomingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    let history: History
    const integrationId = 1
    const ticketId = 2
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const renderComponent = (props: ComponentProps<typeof IncomingPhoneCall>) =>
        render(
            <Router history={history}>
                <Provider store={store}>
                    <IncomingPhoneCall {...props} />
                </Provider>
            </Router>
        )

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
        history = {
            location: {
                pathname: '/app',
            },
            push: jest.fn(),
            listen: jest.fn(),
        } as unknown as History

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

        mockFlags({})
        cleanup()
    })

    it('should accept call', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        const {getByTestId} = renderComponent({call})

        fireEvent.click(getByTestId('accept-call-button'))
        expect(call.accept).toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith(`/app/ticket/${ticketId}`)
    })

    it('should reject call on decline', (done) => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        mockedServer.onPost('/integrations/phone/call/declined').reply(201)
        mockedServer.onPost('/integrations/phone/call/cancelled').reply(201)

        const {getByTestId} = renderComponent({call})

        fireEvent.click(getByTestId('decline-call-button'))
        expect(call.reject).toHaveBeenCalled()
        expect(call.emit).toHaveBeenCalledWith('cancel')
        expect(history.push).not.toHaveBeenCalled()

        process.nextTick(() => {
            const serverHistoryPostRequests = mockedServer.history.post
            const lastPostRequest =
                serverHistoryPostRequests[serverHistoryPostRequests.length - 1]

            expect(JSON.parse(lastPostRequest.data)).toEqual({
                ticket_id: ticketId,
                call_sid: call.customParameters.get('call_sid'),
            })
            expect(lastPostRequest.url).toEqual(
                '/integrations/phone/call/declined'
            )
            done()
        })
    })

    it('should open ticket page', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        const {getByTestId} = renderComponent({call})

        fireEvent.click(getByTestId('incoming-phone-call'))
        expect(history.push).toHaveBeenCalledWith(`/app/ticket/${ticketId}`)
    })

    it('should not open ticket page if current page is WhatsApp migration', () => {
        history.location.pathname =
            '/app/settings/integrations/whatsapp/migration'

        const call = mockIncomingCall(integrationId, ticketId) as Call

        const {getByTestId} = renderComponent({call})

        fireEvent.click(getByTestId('incoming-phone-call'))
        expect(history.push).not.toHaveBeenCalled()
    })

    it('should display waiting time', () => {
        const call = mockIncomingCall(integrationId) as Call
        jest.useFakeTimers()

        const {getByText} = renderComponent({call})

        expect(getByText('Waiting for 00:00')).toBeInTheDocument()
        jest.advanceTimersByTime(1000)
        expect(getByText('Waiting for 00:01')).toBeInTheDocument()
        jest.advanceTimersByTime(3000)
        expect(getByText('Waiting for 00:04')).toBeInTheDocument()
    })

    it('should display "incoming transfer"', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: 3,
        })

        const {getByText} = renderComponent({call})

        expect(getByText('Incoming transfer...')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 3')).toBeInTheDocument()
    })

    it('should not display "incoming transfer" if transferFromAgentId is null', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
        })

        const {queryByText, getByText} = renderComponent({call})

        expect(queryByText('Incoming transfer...')).toBeNull()
        expect(getByText('Incoming call...')).toBeInTheDocument()
    })
})
