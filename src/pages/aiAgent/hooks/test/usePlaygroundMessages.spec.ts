import { act, renderHook } from '@testing-library/react-hooks'

import { useSubmitPlaygroundTicket } from 'models/aiAgent/queries'
import {
    AiAgentMessageType,
    MessageType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import {
    AI_AGENT,
    DEFAULT_PLAYGROUND_CUSTOMER,
    PLAYGROUND_CUSTOMER_MOCK,
} from 'pages/aiAgent/constants'

import { PlaygroundChannels } from '../../components/PlaygroundChat/PlaygroundChat.types'
import { playgroundMessageFixture } from '../../fixtures/playgroundMessages.fixture'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import { getSubmitPlaygroundTicketResponseFixture } from '../../fixtures/submitPlaygroundTicketResponse.fixture'
import { getTicketCustomer } from '../../utils/playground-ticket.util'
import { usePlaygroundMessages } from '../usePlaygroundMessages'

jest.mock('models/aiAgent/queries', () => ({
    useSubmitPlaygroundTicket: jest.fn(),
}))
const mockedUseSubmitPlaygroundTicket = jest.mocked(useSubmitPlaygroundTicket)

jest.mock('../../utils/playground-ticket.util', () => ({
    getTicketCustomer: jest.fn(),
}))
const mockedGetTicketCustomer = jest.mocked(getTicketCustomer)

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

const defaultParams = {
    storeData: getStoreConfigurationFixture(),
    gorgiasDomain: 'acme',
    accountId: 1,
    httpIntegrationId: 1,
    currentUserFirstName: 'Acme',
    channel: 'email' as const,
}

describe('usePlaygroundMessages hook', () => {
    beforeEach(() => {
        mockedGetTicketCustomer.mockReturnValue(
            Promise.resolve(PLAYGROUND_CUSTOMER_MOCK),
        )
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: () =>
                Promise.resolve({
                    data: getSubmitPlaygroundTicketResponseFixture(),
                }),
            isLoading: false,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)

        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))
    })

    it('should return initial message', () => {
        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

        expect(result.current.messages.length).toBe(1)
        expect(result.current.messages[0]).toMatchInlineSnapshot(`
            {
              "content": "Hi Acme!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question.",
              "createdDatetime": "2020-01-01T00:00:00.000Z",
              "sender": "AI Agent",
              "type": "MESSAGE",
            }
        `)
    })

    it('should submit a ticket', async () => {
        const onSubmit = jest.fn(() =>
            Promise.resolve({
                data: getSubmitPlaygroundTicketResponseFixture(),
            }),
        )
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )
        const message = playgroundMessageFixture
        await act(async () => {
            await result.current.onMessageSend(message, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(onSubmit).toHaveBeenCalledWith([
            {
                account_id: 1,
                body_text: message.content,
                created_datetime: message.createdDatetime,
                customer_email: 'oliver.smith@foobar.com',
                domain: 'acme',
                channel: 'email',
                from_agent: true,
                _playground_options: {
                    shopName: defaultParams.storeData.storeName,
                },
                http_integration_id: 1,
                subject: '',
                customer: PLAYGROUND_CUSTOMER_MOCK,
                meta: undefined,
                messages: [
                    {
                        bodyText: message.content,
                        createdDatetime: message.createdDatetime,
                        fromAgent: true,
                        meta: undefined,
                    },
                ],
                _action_serialized_state: undefined,
            },
            new AbortController(),
        ])

        // Initial message + user message + AI response
        expect(result.current.messages.length).toBe(3)
    })

    it('should use mock playground customer when customer is not found', async () => {
        mockedGetTicketCustomer.mockReturnValue(Promise.reject())
        const onSubmit = jest.fn(() =>
            Promise.resolve({
                data: getSubmitPlaygroundTicketResponseFixture(),
            }),
        )
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)
        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )
        const message = playgroundMessageFixture
        await act(async () => {
            await result.current.onMessageSend(message, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(onSubmit).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    customer: PLAYGROUND_CUSTOMER_MOCK,
                }),
            ]),
        )
    })

    it('should add error message when error occurs', async () => {
        const onSubmit = () => Promise.reject(new Error('Error'))
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)
        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )
        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(result.current.messages.length).toBe(3)
        expect(result.current.messages[2]).toEqual(
            expect.objectContaining({
                type: MessageType.ERROR,
            }),
        )
    })

    it('should not add internal note when postProcess internal note is empty string', async () => {
        const onSubmit = () =>
            Promise.resolve({
                data: {
                    generate: {
                        output: {
                            generated_message: 'Message',
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                    qa: {
                        output: {
                            validate_outcome: true,
                            validate_generated_message: true,
                        },
                    },
                    postProcessing: {
                        internalNote: '',
                        htmlReply: 'reply',
                    },
                },
            })
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(result.current.messages.length).toBe(4)
        expect(result.current.messages.map((m) => m.type)).toEqual([
            'MESSAGE',
            'MESSAGE',
            'MESSAGE',
            'TICKET_EVENT',
        ])
    })

    it('should add internal note when postProcess internal note is not empty string', async () => {
        const onSubmit = () =>
            Promise.resolve({
                data: {
                    generate: {
                        output: {
                            generated_message: 'Message',
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                    qa: {
                        output: {
                            validate_outcome: true,
                            validate_generated_message: true,
                        },
                    },
                    postProcessing: {
                        internalNote: 'internal note',
                        htmlReply: 'reply',
                    },
                },
            })
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)
        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )
        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })
        expect(result.current.messages.length).toBe(5)
        expect(result.current.messages.map((m) => m.type)).toEqual([
            'MESSAGE',
            'MESSAGE',
            'MESSAGE',
            'INTERNAL_NOTE',
            'TICKET_EVENT',
        ])
    })

    describe('when channel is chat', () => {
        it('should not throw error when mock data and no email integration', async () => {
            const { result } = renderHook(() =>
                usePlaygroundMessages({
                    ...defaultParams,
                    storeData: getStoreConfigurationFixture({
                        monitoredEmailIntegrations: [],
                    }),
                    channel: 'chat',
                }),
            )
            await act(async () => {
                await result.current.onMessageSend(playgroundMessageFixture, {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                })
            })

            // Should be more than 1 message if onMessageSend succeeded
            expect(result.current.messages).not.toBe(1)
        })

        it('should change initial message when channel changed', () => {
            const { result, rerender } = renderHook(
                ({ channel }: { channel: PlaygroundChannels }) =>
                    usePlaygroundMessages({ ...defaultParams, channel }),
                { initialProps: { channel: 'chat' } },
            )
            expect(result.current.messages[0]).toEqual(
                expect.objectContaining({
                    type: MessageType.MESSAGE,
                    sender: AI_AGENT,
                    content:
                        'Hi Acme<br/><br/>Welcome to your AI Agent test area.<br/><br/>You can use this to send messages to AI Agent in the same way your customers do and test how it responds. If you want to improve the response, you can edit your resources and re-test your question.',
                }),
            )
            rerender({ channel: 'email' })
            expect(result.current.messages[0]).toEqual(
                expect.objectContaining({
                    type: MessageType.MESSAGE,
                    sender: AI_AGENT,
                    content:
                        'Hi Acme!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question.',
                }),
            )
        })

        it('should return wait for close ticket confirmation', async () => {
            const onSubmit = () =>
                Promise.resolve({
                    data: getSubmitPlaygroundTicketResponseFixture({
                        postProcessing: {
                            internalNote: '',
                            htmlReply: null,
                            chatTicketMessageMeta: {
                                ai_agent_message_type:
                                    AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION,
                            },
                        },
                        qa: {
                            output: {
                                validate_outcome: false,
                                validate_generated_message: false,
                            },
                        },
                    }),
                })
            mockedUseSubmitPlaygroundTicket.mockReturnValue({
                mutateAsync: onSubmit,
            } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)
            const { result } = renderHook(() =>
                usePlaygroundMessages({ ...defaultParams, channel: 'chat' }),
            )
            await act(async () => {
                await result.current.onMessageSend(playgroundMessageFixture, {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                })
            })

            expect(result.current.messages.length).toBe(5)
            expect(result.current.isWaitingResponse).toBeTruthy()
            expect(result.current.messages[4]).toEqual(
                expect.objectContaining({
                    type: MessageType.TICKET_EVENT,
                    outcome: TicketOutcome.WAIT,
                }),
            )
        })

        it('should send "Hey there" message when chat channel and this is first customer message', async () => {
            const { result } = renderHook(() =>
                usePlaygroundMessages({ ...defaultParams, channel: 'chat' }),
            )

            await act(async () => {
                await result.current.onMessageSend(playgroundMessageFixture, {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                })
            })

            const greetingMessage = result.current.messages[2]
            expect(result.current.messages.length).toBe(5)
            expect(greetingMessage).toEqual(
                expect.objectContaining({
                    content: 'Hey there 👋',
                    type: MessageType.MESSAGE,
                    sender: AI_AGENT,
                }),
            )
        })
    })

    describe('when channel is email', () => {
        it('should throw error when no email integration', async () => {
            const { result } = renderHook(() =>
                usePlaygroundMessages({
                    ...defaultParams,
                    storeData: getStoreConfigurationFixture({
                        monitoredEmailIntegrations: [],
                    }),
                }),
            )
            try {
                await act(async () => {
                    await result.current.onMessageSend(
                        playgroundMessageFixture,
                        {
                            customer: DEFAULT_PLAYGROUND_CUSTOMER,
                        },
                    )
                })
            } catch (e) {
                if (e instanceof Error) {
                    expect(e.message).toBe(
                        'Monitored Email Integration not found in storeConfiguration',
                    )
                }
            }
        })

        it('should not add "Hey there" message with first customer message', async () => {
            const { result } = renderHook(() =>
                usePlaygroundMessages({ ...defaultParams, channel: 'email' }),
            )

            await act(async () => {
                await result.current.onMessageSend(playgroundMessageFixture, {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                })
            })

            expect(result.current.messages.length).toBe(3)
        })
    })
})
