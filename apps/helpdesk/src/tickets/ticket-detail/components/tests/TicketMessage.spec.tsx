import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import type { Meta, SmartFollowUp } from 'models/ticket/types'
import { SmartFollowUpType } from 'models/ticket/types'

import type { FailedFlag, TicketMessageElement } from '../../types'
import { MessageAvatar } from '../MessageAvatar'
import { MessageBody } from '../MessageBody'
import { MessageContent } from '../MessageContent'
import { MessageError } from '../MessageError'
import { MessageHeader } from '../MessageHeader'
import { TicketMessage } from '../TicketMessage'

jest.mock('../MessageContent', () => ({
    MessageContent: jest.fn(() => <div>MessageContent</div>),
}))
jest.mock('../MessageBody', () => ({
    MessageBody: jest.fn(({ children }) => <div>body {children}</div>),
}))
jest.mock('../MessageAvatar', () => ({
    MessageAvatar: jest.fn(() => <div>MessageAvatar</div>),
}))
jest.mock('../MessageHeader', () => ({
    MessageHeader: jest.fn(() => <div>MessageHeader</div>),
}))
jest.mock('../MessageError', () => ({
    MessageError: jest.fn(() => <div>MessageError</div>),
}))
jest.mock('tickets/ticket-detail/components/MessageMetadata', () => {
    return {
        MessageMetadata: jest.fn(() => <div>Message Metadata</div>),
    }
})
jest.mock('models/ticket/predicates', () => ({
    isTicketMessageDeleted: jest.fn(() => false),
    isTicketMessageHidden: jest.fn(() => false),
}))

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SmartFollowUps',
    () => (props: { smartFollowUps: SmartFollowUp[] }) => (
        <div>
            {props.smartFollowUps.map((followUp: SmartFollowUp) => (
                <div key={followUp.text}>{followUp.text}</div>
            ))}
        </div>
    ),
)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('TicketMessage', () => {
    const mockedElement = {
        data: {
            id: 123,
        },
        datetime: '2024-01-13T14:08:53Z',
        type: 'message',
    } as TicketMessageElement

    it('should set isFailed to true when the error flag is set', () => {
        const error = { message: 'Test error', failedActions: [] }
        const elementWithError = {
            ...mockedElement,
            flags: [['failed', error] as FailedFlag],
        }
        render(<TicketMessage element={elementWithError} />)

        expect(MessageContent).toHaveBeenCalledWith(
            expect.objectContaining({
                isFailed: true,
            }),
            expect.anything(),
        )

        expect(MessageHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                isFailed: true,
            }),
            expect.anything(),
        )
    })

    it('should set isAI to true when flags include ai', () => {
        render(<TicketMessage element={{ ...mockedElement, flags: ['ai'] }} />)

        expect(MessageAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                isAI: true,
            }),
            expect.anything(),
        )

        expect(MessageHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                isAI: true,
            }),
            expect.anything(),
        )

        expect(MessageBody).toHaveBeenCalledWith(
            expect.objectContaining({
                isAI: true,
            }),
            expect.anything(),
        )
    })

    describe('MessageAvatar', () => {
        it('should render the message avatar for non-minimal messages', () => {
            render(<TicketMessage element={mockedElement} />)
            expect(MessageAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: mockedElement.data,
                }),
                expect.anything(),
            )
        })

        it('should not render the message avatar for minimal messages', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: ['minimal'] }}
                />,
            )
            expect(MessageAvatar).not.toHaveBeenCalled()
        })
    })

    describe('MessageHeader', () => {
        it('should call predicates', () => {
            render(<TicketMessage element={mockedElement} />)
            expect(isTicketMessageDeleted).toHaveBeenCalledWith(
                mockedElement.data,
            )
            expect(isTicketMessageHidden).toHaveBeenCalledWith(
                mockedElement.data,
            )
        })

        it('should render the message header for non-minimal messages', () => {
            render(<TicketMessage element={mockedElement} />)
            expect(screen.getByText('MessageHeader')).toBeInTheDocument()
            expect(MessageHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: mockedElement.data,
                    isAI: false,
                    isFailed: false,
                    isMessageDeleted: false,
                    isMessageHidden: false,
                    readonly: true,
                }),
                expect.any(Object),
            )
        })

        it('should not render the message header for minimal messages', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: ['minimal'] }}
                />,
            )
            expect(screen.queryByText('MessageHeader')).not.toBeInTheDocument()
        })
    })

    describe('MessageContent', () => {
        it('should call MessageContent with the correct props', () => {
            render(<TicketMessage element={mockedElement} />)

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: false,
                },
                expect.anything(),
            )
        })

        it('should set isFailed to false when flags do not include the error flag', () => {
            render(<TicketMessage element={{ ...mockedElement, flags: [] }} />)

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: false,
                },
                expect.anything(),
            )
        })

        it('should call MessageContent with the correct props when minimal is true', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: ['minimal'] }}
                />,
            )

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: false,
                },
                expect.anything(),
            )
        })
    })

    describe('MessageBody', () => {
        it('should render MessageBody with correct props', () => {
            render(<TicketMessage element={mockedElement} />)

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: false,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should set isAI to true when flags include ai', () => {
            render(
                <TicketMessage element={{ ...mockedElement, flags: ['ai'] }} />,
            )

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: true,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should handle undefined flags', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: undefined }}
                />,
            )

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: false,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should render MessageContent inside MessageBody', () => {
            render(<TicketMessage element={mockedElement} />)

            const messageBody = screen.getByText(/body/i)
            expect(messageBody).toBeInTheDocument()
            expect(messageBody).toHaveTextContent('MessageContent')
        })

        describe('SmartFollowUps', () => {
            const prepareMockElement = (meta: Meta) => ({
                ...mockedElement,
                data: {
                    ...mockedElement.data,
                    meta,
                },
            })

            const mockSmartFollowUps = [
                {
                    text: 'Order status',
                    type: SmartFollowUpType.DYNAMIC,
                },
            ]

            const mockedElementWithSmartFollowUps = prepareMockElement({
                smart_follow_ups: mockSmartFollowUps,
            })

            const mockedElementWithSelectedSmartFollowUp = prepareMockElement({
                smart_follow_ups: mockSmartFollowUps,
                selected_smart_follow_up_index: 0,
            })

            describe('Feature flag disabled', () => {
                beforeEach(() => {
                    jest.clearAllMocks()
                    useFlagMock.mockReturnValue(false)
                })

                it('should not render smart follow ups when feature flag is disabled', () => {
                    render(
                        <TicketMessage
                            element={mockedElementWithSmartFollowUps}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).toHaveTextContent('MessageContent')
                    expect(messageBody).not.toHaveTextContent('Order status')
                })

                it('should show message content because feature flag is disabled, even though a smart follow up has been selected', () => {
                    render(
                        <TicketMessage
                            element={mockedElementWithSelectedSmartFollowUp}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).toHaveTextContent('MessageContent')
                    expect(messageBody).not.toHaveTextContent('Order status')
                })
            })

            describe('Feature flag enabled', () => {
                beforeEach(() => {
                    jest.clearAllMocks()
                    useFlagMock.mockImplementation(
                        (flag) => flag === FeatureFlagKey.SmartFollowUps,
                    )
                })

                it('should render smart follow ups when feature flag is enabled', () => {
                    render(
                        <TicketMessage
                            element={mockedElementWithSmartFollowUps}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).toHaveTextContent('Order status')
                })

                it('should not render smart follow ups when message does not have them', () => {
                    render(
                        <TicketMessage
                            element={prepareMockElement({
                                smart_follow_ups: [],
                            })}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).not.toHaveTextContent('Order status')
                })

                it('should render message content if no smart follow ups have been selected', () => {
                    render(
                        <TicketMessage
                            element={mockedElementWithSmartFollowUps}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).toHaveTextContent('MessageContent')
                    expect(messageBody).toHaveTextContent('Order status')
                })

                it('should render message content if a smart follow up was selected, but message has no follow ups to render', () => {
                    render(
                        <TicketMessage
                            element={prepareMockElement({
                                smart_follow_ups: [],
                                selected_smart_follow_up_index: 0,
                            })}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).toHaveTextContent('MessageContent')
                    expect(messageBody).not.toHaveTextContent('Order status')
                })

                it('should not render message content if a smart follow up has been selected', () => {
                    render(
                        <TicketMessage
                            element={mockedElementWithSelectedSmartFollowUp}
                        />,
                    )

                    const messageBody = screen.getByText(/body/i)
                    expect(messageBody).toBeInTheDocument()
                    expect(messageBody).not.toHaveTextContent('MessageContent')
                    expect(messageBody).toHaveTextContent('Order status')
                })
            })
        })
    })

    describe('MessageError', () => {
        it('should call MessageError with correct props when error flag is present', () => {
            const error = { message: 'Test error', failedActions: [] }
            const elementWithError = {
                ...mockedElement,
                flags: [['failed', error] as FailedFlag],
            }
            render(<TicketMessage element={elementWithError} />)

            expect(MessageError).toHaveBeenCalledWith(
                {
                    error,
                },
                expect.anything(),
            )
        })

        it('should not call MessageError when no error flag is present', () => {
            render(<TicketMessage element={mockedElement} />)

            expect(MessageError).not.toHaveBeenCalled()
        })

        it('should not call MessageError when flags are undefined', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: undefined }}
                />,
            )

            expect(MessageError).not.toHaveBeenCalled()
        })
    })
})
