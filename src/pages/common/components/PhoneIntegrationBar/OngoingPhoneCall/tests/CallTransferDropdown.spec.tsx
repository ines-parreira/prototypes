import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps, createRef} from 'react'
import {fromJS} from 'immutable'
import {
    TransferCallBodyReceiverType,
    TransferCallBodyType,
    useTransferCall,
} from '@gorgias/api-queries'
import {Call} from '@twilio/voice-sdk'
import {mockStore} from 'utils/testing'
import * as notificationActions from 'state/notifications/actions'
import {mockIncomingCall} from 'tests/twilioMocks'
import CallTransferDropdown from '../CallTransferDropdown'

jest.mock('@gorgias/api-queries')

const mockUseTransferCall = useTransferCall as jest.Mock

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

    const renderComponent = (
        props: ComponentProps<typeof CallTransferDropdown> = baseProps
    ) =>
        render(
            <Provider
                store={mockStore({
                    agents: fromJS({
                        all: [
                            {id: 1, name: 'Agent 1'},
                            {id: 2, name: 'Agent 2'},
                            {id: 3, name: 'Agent 3'},
                            {id: 4, name: 'Agent 4'},
                        ],
                    }),
                    currentUser: fromJS({
                        id: 2,
                    }),
                } as any)}
            >
                <CallTransferDropdown {...props} />
            </Provider>
        )

    afterEach(cleanup)

    it(`renders the dropdown body when isOpen is true and doesn't display current agent`, () => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent()

        expect(screen.getByText('Agents')).toBeInTheDocument()
        expect(screen.getByText('Agent 1')).toBeInTheDocument()
        expect(screen.queryByText('Agent 2')).not.toBeInTheDocument()
        expect(screen.getByText('Agent 4')).toBeInTheDocument()
    })

    it('does not render the dropdown body when isOpen is false', () => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent({...baseProps, isOpen: false})

        expect(screen.queryByText('Agents')).not.toBeInTheDocument()
    })

    it('calls the setIsOpen function when the target element is clicked', () => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent()

        fireEvent.click(screen.getByTestId('floating-overlay'))
        expect(setIsOpen).toHaveBeenCalled()
    })

    it(`doesn't select more than one agent`, () => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
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
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
        renderComponent()

        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).toHaveAttribute('aria-disabled', 'true')

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('calls the onTransferInitiated function when the transfer button is clicked', () => {
        mockUseTransferCall.mockReturnValue({
            mutate: jest.fn(),
        })
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
                type: TransferCallBodyType.Cold,
                receiver_type: TransferCallBodyReceiverType.Agent,
                receiver_id: 1,
                call_sid: 'fake-call-sid',
            },
        })
    })
})
