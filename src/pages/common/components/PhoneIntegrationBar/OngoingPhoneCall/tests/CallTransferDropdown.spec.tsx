import {
    VoiceCallTransferReceiverType,
    VoiceCallTransferType,
    useTransferCall,
    useListUsers,
} from '@gorgias/api-queries'
import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'
import React, {ComponentProps, createRef} from 'react'
import {Provider} from 'react-redux'

import * as notificationActions from 'state/notifications/actions'
import {mockIncomingCall} from 'tests/twilioMocks'
import {mockStore} from 'utils/testing'

import CallTransferDropdown from '../CallTransferDropdown'
import {getAvailabilityBadgeColor, mergeAgentData} from '../utils'

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: ({name, badgeColor}: {name: string; badgeColor?: string}) => (
        <div>
            {name}
            <div data-testid="badge">{badgeColor}</div>
        </div>
    ),
}))
jest.mock('pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/utils')
jest.mock('@gorgias/api-queries')

const mockUseTransferCall = useTransferCall as jest.Mock
const mockUseListUsers = useListUsers as jest.Mock
const mockGetAvailabilityBadgeColor = getAvailabilityBadgeColor as jest.Mock
const mockMergeAgentData = mergeAgentData as jest.Mock

describe('CallTransferDropdown', () => {
    const setIsOpen = jest.fn()
    const onTransferInitiated = jest.fn()

    const baseProps = {
        isOpen: true,
        setIsOpen,
        onTransferInitiated,
        target: createRef<HTMLElement>(),
        call: mockIncomingCall() as Call,
    }

    const allAgents = [
        {id: 1, name: 'Agent 1'},
        {id: 2, name: 'Agent 2'},
        {id: 3, name: 'Agent 3'},
        {id: 4, name: 'Agent 4'},
    ]

    const renderComponent = (
        props: ComponentProps<typeof CallTransferDropdown> = baseProps
    ) =>
        render(
            <Provider
                store={mockStore({
                    agents: fromJS({
                        all: allAgents,
                    }),
                    currentUser: fromJS({
                        id: 2,
                    }),
                } as any)}
            >
                <CallTransferDropdown {...props} />
            </Provider>
        )

    beforeEach(() => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        mockUseListUsers.mockReturnValue({
            data: {
                data: [],
            },
        })
        mockMergeAgentData.mockReturnValue(allAgents)
    })

    afterEach(cleanup)

    it(`renders the dropdown body when isOpen is true and doesn't display current agent`, () => {
        renderComponent()

        expect(mockMergeAgentData).toHaveBeenCalledWith(
            allAgents.filter((agent) => agent.id !== 2),
            undefined
        )
    })

    it('renders the dropdown body with the correct agent availability status', () => {
        const agentsWithStatus = [
            {
                id: 1,
                name: 'Agent 1',
                availability_status: {
                    status: 'online',
                },
            },
        ]

        mockUseListUsers.mockReturnValue({
            data: {
                data: agentsWithStatus,
            },
        })

        mockGetAvailabilityBadgeColor.mockImplementation(
            (status: string) => status
        )
        mockMergeAgentData.mockReturnValue([
            {
                id: 1,
                name: 'Agent 1',
                status: 'online',
            },
        ])

        renderComponent()

        const agent1 = screen.getByText('Agent 1')
        expect(agent1).toBeInTheDocument()
        expect(within(agent1).getByTestId('badge')).toHaveTextContent('online')
    })

    it('does not render the dropdown body when isOpen is false', () => {
        renderComponent({...baseProps, isOpen: false})

        expect(screen.queryByText('Agents')).not.toBeInTheDocument()
    })

    it('calls the setIsOpen function when the target element is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByTestId('floating-overlay'))
        expect(setIsOpen).toHaveBeenCalled()
    })

    it(`doesn't select more than one agent`, () => {
        renderComponent()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        expect(within(agent1).getByText(/done/i)).toBeVisible()

        const agent3 = screen.getByRole('option', {
            name: /agent 3/i,
        })
        fireEvent.click(agent3)
        expect(within(agent3).getByText(/done/i)).toBeVisible()
        expect(within(agent1).queryByText(/done/i)).toBeNull()
    })

    it('only enables the transfer button when an agent is selected', () => {
        renderComponent()

        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).toBeAriaDisabled()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).toBeAriaEnabled()
    })

    it('calls the onTransferInitiated function when the transfer button is clicked', () => {
        renderComponent()
        ;(mockUseTransferCall as jest.MockedFunction<typeof useTransferCall>)
            .mock.calls[0][0]?.mutation?.onSuccess!(
            '' as any,
            '' as any,
            '' as any
        )

        expect(onTransferInitiated).toHaveBeenCalled()
        expect(setIsOpen).toHaveBeenLastCalledWith(false)
    })

    it('displays warning notification on transfer failure if status is 400', () => {
        const notify = jest.spyOn(notificationActions, 'notify')
        renderComponent()
        ;(mockUseTransferCall as jest.MockedFunction<typeof useTransferCall>)
            .mock.calls[0][0]?.mutation?.onError!(
            {
                response: {
                    data: {
                        error: {
                            msg: 'Call transfer could not be attempted because the agent is offline or unavailable for calls. The customer is still on the line.',
                        },
                    },
                    status: 400,
                },
            },
            '' as any,
            '' as any
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'Call transfer could not be attempted because the agent is offline or unavailable for calls. The customer is still on the line.',
            status: 'info',
        })
    })

    it('displays error notification on transfer failure if status is not 400', () => {
        const notify = jest.spyOn(notificationActions, 'notify')
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent()
        ;(mockUseTransferCall as jest.MockedFunction<typeof useTransferCall>)
            .mock.calls[0][0]?.mutation?.onError!(
            {
                response: {
                    data: {
                        error: {
                            msg: 'Call transfer failed because an error occurred. Please try again.',
                        },
                    },
                    status: 500,
                },
            },
            '' as any,
            '' as any
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'Call transfer failed because an error occurred. Please try again.',
            status: 'error',
        })
    })

    it('displays default error notification on transfer failure if no message', () => {
        const notify = jest.spyOn(notificationActions, 'notify')
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent()
        ;(mockUseTransferCall as jest.MockedFunction<typeof useTransferCall>)
            .mock.calls[0][0]?.mutation?.onError!(
            {
                response: {
                    status: 500,
                },
            },
            '' as any,
            '' as any
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'Call transfer failed because an error occurred. Please try again.',
            status: 'error',
        })
    })

    it("calls the 'transfer-call' endpoint with the correct data", () => {
        const mockMutate = jest.fn()
        mockUseTransferCall.mockReturnValue({
            mutate: mockMutate,
        })
        renderComponent()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        fireEvent.click(screen.getByRole('button', {name: /transfer call/i}))
        expect(mockMutate).toHaveBeenCalledWith({
            data: {
                type: VoiceCallTransferType.Cold,
                receiver_type: VoiceCallTransferReceiverType.Agent,
                receiver_id: 1,
                call_sid: 'fake-call-sid',
            },
        })
    })
})
