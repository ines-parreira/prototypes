import type { ComponentProps } from 'react'
import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Call } from '@twilio/voice-sdk'
import MockAdapter from 'axios-mock-adapter'
import type { History } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import goToTicket from 'common/utils/goToTicket'
import client from 'models/api/resources'
import * as hooks from 'pages/common/components/PhoneIntegrationBar/hooks'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockIncomingCall } from 'tests/twilioMocks'

import { MICROPHONE_PERMISSION_REQUIRED_MESSAGE } from '../../constants'
import IncomingPhoneCall from '../IncomingPhoneCall'

jest.mock('@twilio/voice-sdk')

jest.mock('common/utils/goToTicket')
const goToTicketMock = goToTicket as jest.MockedFunction<typeof goToTicket>

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
)
jest.mock(
    'pages/integrations/integration/components/voice/useMicrophonePermissions',
)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

const useMicrophonePermissionsMock = assumeMock(useMicrophonePermissions)

describe('<IncomingPhoneCall />', () => {
    let state: RootState
    let history: History
    const integrationId = 1
    const ticketId = 2
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const renderComponent = (props: ComponentProps<typeof IncomingPhoneCall>) =>
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockStore(state)}>
                    <IncomingPhoneCall {...props} />
                </Provider>
            </Router>,
        )

    beforeEach(() => {
        mockedServer.reset()
        history = {
            location: {
                pathname: '/app',
            },
            push: jest.fn(),
            listen: jest.fn(),
        } as unknown as History

        state = {
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: { emoji: '❤️' },
                    },
                ],
            }),
        } as RootState

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValue({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })

        useMicrophonePermissionsMock.mockReturnValue({
            permissionDenied: false,
        })

        cleanup()
    })

    it('should accept call and open ticket', () => {
        useFlagMock.mockReturnValue(true)
        const call = mockIncomingCall(integrationId, ticketId) as Call

        renderComponent({ call })

        fireEvent.click(screen.getByText(/Accept/))
        expect(call.accept).toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith(`/app/ticket/${ticketId}`)
    })

    it('should accept call when call-bar-restyling is disabled', () => {
        useFlagMock.mockReturnValue(false)
        const call = mockIncomingCall(integrationId, ticketId) as Call

        renderComponent({ call })

        fireEvent.click(screen.getByText(/Accept/))
        expect(call.accept).toHaveBeenCalled()
    })

    it('should reject call on decline', (done) => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        mockedServer.onPost('/integrations/phone/call/declined').reply(201)
        mockedServer.onPost('/integrations/phone/call/cancelled').reply(201)

        renderComponent({ call })

        fireEvent.click(screen.getByText(/Decline/))
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
                '/integrations/phone/call/declined',
            )
            done()
        })
    })

    it('should not open ticket page if current page is WhatsApp migration', () => {
        history.location.pathname =
            '/app/settings/integrations/whatsapp/migration'

        const call = mockIncomingCall(integrationId, ticketId) as Call

        renderComponent({ call })

        fireEvent.click(
            screen.getByText(
                state.integrations.getIn(['integrations', 0, 'name']),
            ),
        )
        expect(history.push).not.toHaveBeenCalled()
    })

    it('should navigate to ticket when clicking customer name button', async () => {
        const user = userEvent.setup()
        const call = mockIncomingCall(integrationId, ticketId) as Call

        renderComponent({ call })

        const customerNameButton = screen.getByRole('button', {
            name: /Bob/i,
        })
        await user.click(customerNameButton)

        expect(goToTicketMock).toHaveBeenCalledWith(ticketId)
    })

    it('should render customer name as plain text when ticketId is null', () => {
        const call = mockIncomingCall(integrationId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId: null,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })

        renderComponent({ call })

        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Bob/i }),
        ).not.toBeInTheDocument()
    })

    it('should display waiting time', () => {
        const call = mockIncomingCall(integrationId) as Call
        jest.useFakeTimers()

        const { getByText } = renderComponent({ call })

        expect(getByText('Waiting for 00:00')).toBeInTheDocument()
        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(getByText('Waiting for 00:01')).toBeInTheDocument()
        act(() => {
            jest.advanceTimersByTime(3000)
        })
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
            isTransferring: true,
            isPossibleSpam: false,
        })

        renderComponent({ call })

        expect(screen.getByText('Incoming transfer...')).toBeInTheDocument()
        expect(screen.getByText('VoiceCallAgentLabel 3')).toBeInTheDocument()
    })

    it('should not display "incoming transfer" if isTransferring is false', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })

        renderComponent({ call })

        expect(screen.queryByText('Incoming transfer...')).toBeNull()
        expect(screen.getByText('Incoming call...')).toBeInTheDocument()
    })

    it('should display error message when microphone permissions are not enabled', () => {
        useMicrophonePermissionsMock.mockReturnValue({ permissionDenied: true })

        const call = mockIncomingCall(integrationId) as Call

        renderComponent({ call })

        /* should check every second */
        expect(useMicrophonePermissionsMock).toHaveBeenCalledWith(1000)

        expect(
            screen.getByText(MICROPHONE_PERMISSION_REQUIRED_MESSAGE),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /Accept/ }),
        ).not.toBeAriaDisabled()
    })

    it('should not display error message when microphone permissions are enabled', () => {
        useMicrophonePermissionsMock.mockReturnValue({
            permissionDenied: false,
        })

        const call = mockIncomingCall(integrationId) as Call

        renderComponent({ call })

        expect(
            screen.queryByText(MICROPHONE_PERMISSION_REQUIRED_MESSAGE),
        ).toBeNull()
        expect(
            screen.getByRole('button', { name: /Accept/ }),
        ).not.toBeAriaDisabled()
    })

    it('should display "Maybe spam" badge when isPossibleSpam is true', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: true,
        })

        renderComponent({ call })

        expect(screen.getByText('Maybe spam')).toBeInTheDocument()
        expect(screen.getByText('Incoming call...')).toBeInTheDocument()
    })

    it('should not display "Maybe spam" badge when isPossibleSpam is false', () => {
        const call = mockIncomingCall(integrationId, ticketId) as Call

        jest.spyOn(hooks, 'useConnectionParameters').mockReturnValueOnce({
            integrationId,
            ticketId,
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })

        renderComponent({ call })

        expect(screen.queryByText('Maybe spam')).toBeNull()
        expect(screen.getByText('Incoming call...')).toBeInTheDocument()
    })
})
