import {act, renderHook} from '@testing-library/react-hooks'
import {useSubmitPlaygroundTicket} from 'models/aiAgent/queries'
import {TicketOutcome} from 'models/aiAgentPlayground/types'
import {usePlaygroundMessages} from '../usePlaygroundMessages'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {getSubmitPlaygroundTicketResponseFixture} from '../../fixtures/submitPlaygroundTicketResponse.fixture'
import {PlaygroundChannels} from '../../components/PlaygroundChat/PlaygroundChat.types'

jest.mock('models/aiAgent/queries', () => ({
    useSubmitPlaygroundTicket: jest.fn(),
}))

const defaultParams = {
    storeData: getStoreConfigurationFixture(),
    gorgiasDomain: 'acme',
    accountId: 1,
    httpIntegrationId: 1,
    currentUserFirstName: 'Acme',
    channel: 'email' as const,
}

const mockedUseSubmitPlaygroundTicket = jest.mocked(useSubmitPlaygroundTicket)

describe('usePlaygroundMessages hook', () => {
    beforeEach(() => {
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
        const {result} = renderHook(() => usePlaygroundMessages(defaultParams))

        expect(result.current.messages.length).toBe(1)
        expect(result.current.messages[0]).toMatchInlineSnapshot(`
            {
              "createdDatetime": "2020-01-01T00:00:00.000Z",
              "message": "Hi Acme!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question.",
              "sender": "AI Agent",
              "type": "MESSAGE",
            }
        `)
    })

    it('should submit a ticket', async () => {
        const onSubmit = jest.fn(() =>
            Promise.resolve({data: getSubmitPlaygroundTicketResponseFixture()})
        )
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: onSubmit,
        } as unknown as ReturnType<typeof useSubmitPlaygroundTicket>)

        const {result} = renderHook(() => usePlaygroundMessages(defaultParams))
        await act(async () => {
            await result.current.onMessageSend({message: 'test'})
        })

        expect(onSubmit).toHaveBeenCalledWith([
            {
                account_id: 1,
                body_text: 'test',
                created_datetime: '2020-01-01T00:00:00.000Z',
                email_integration_id: 11,
                customer_email: 'oliver.smith@foobar.com',
                domain: 'acme',
                channel: 'email',
                _playground_options: {
                    shopName: defaultParams.storeData.storeName,
                },
                http_integration_id: 1,
                messages: [
                    {
                        bodyText: 'test',
                        createdDatetime: '2020-01-01T00:00:00.000Z',
                        fromAgent: false,
                    },
                ],
                subject: '',
                use_mock_context: true,
                _action_serialized_state: undefined,
            },
            new AbortController(),
        ])

        // Initial message + user message + AI response
        expect(result.current.messages.length).toBe(3)
    })

    it('should throw error when no email integration', async () => {
        const {result} = renderHook(() =>
            usePlaygroundMessages({
                ...defaultParams,
                storeData: getStoreConfigurationFixture({
                    monitoredEmailIntegrations: [],
                }),
            })
        )

        try {
            await act(async () => {
                await result.current.onMessageSend({message: 'test'})
            })
        } catch (e) {
            if (e instanceof Error) {
                expect(e.message).toBe('No email integration')
            }
        }
    })

    it('should change initial message when channel changed', () => {
        const {result, rerender} = renderHook(
            ({channel}: {channel: PlaygroundChannels}) =>
                usePlaygroundMessages({...defaultParams, channel}),
            {initialProps: {channel: 'chat'}}
        )
        expect(result.current.messages[0].message).toMatchInlineSnapshot(
            `"Hi Acme<br/><br/>Welcome to your AI Agent test area.<br/><br/>You can use this to send messages to AI Agent in the same way your customers do and test how it responds. If you want to improve the response, you can edit your resources and re-test your question."`
        )
        rerender({channel: 'email'})
        expect(result.current.messages[0].message).toMatchInlineSnapshot(
            `"Hi Acme!<br/><br/>Welcome to your AI Agent test area.<br/><br/>Your test area lets you search for an <b>existing customer</b> to see how your AI Agent would respond <b>based on your resources and the customer’s order history.</b><br/><br/>If you want to improve the response, you can edit your resources and re-test your question."`
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

        const {result} = renderHook(() => usePlaygroundMessages(defaultParams))

        await act(async () => {
            await result.current.onMessageSend({message: 'test'})
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
        const {result} = renderHook(() => usePlaygroundMessages(defaultParams))
        await act(async () => {
            await result.current.onMessageSend({message: 'test'})
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

    it('should not throw error when mock data and no email integration', async () => {
        const {result} = renderHook(() =>
            usePlaygroundMessages({
                ...defaultParams,
                storeData: getStoreConfigurationFixture({
                    monitoredEmailIntegrations: [],
                }),
                channel: 'chat',
            })
        )
        await act(async () => {
            await result.current.onMessageSend({message: 'test'})
        })

        expect(result.current.messages.length).toBe(3)
    })

    it('should throw error when no http integration', async () => {
        const {result} = renderHook(() =>
            usePlaygroundMessages({
                ...defaultParams,
                storeData: getStoreConfigurationFixture({
                    monitoredEmailIntegrations: [],
                }),
            })
        )
        try {
            await act(async () => {
                await result.current.onMessageSend({
                    customerEmail: 'customer@mail.com',
                    message: 'test',
                })
            })
        } catch (e) {
            if (e instanceof Error) {
                expect(e.message).toBe(
                    'Monitored Email Integration not found in storeConfiguration'
                )
            }
        }
    })
})
