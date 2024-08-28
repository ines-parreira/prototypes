import {act, renderHook} from '@testing-library/react-hooks'
import {useSubmitPlaygroundTicket} from 'models/aiAgent/queries'
import {usePlaygroundMessages} from '../usePlaygroundMessages'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {getSubmitPlaygroundTicketResponseFixture} from '../../fixtures/submitPlaygroundTicketResponse.fixture'

jest.mock('models/aiAgent/queries', () => ({
    useSubmitPlaygroundTicket: jest.fn(),
}))

const defaultParams = {
    storeData: getStoreConfigurationFixture(),
    gorgiasDomain: 'acme',
    accountId: 1,
    httpIntegrationId: 1,
    currentUserFirstName: 'Acme',
}

const mockedUseSubmitPlaygroundTicket = jest.mocked(useSubmitPlaygroundTicket)

describe('usePlaygroundMessages hook', () => {
    beforeEach(() => {
        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: Promise.resolve({
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
        const onSubmit = jest.fn()
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
                customer_email: 'oliver.smith@foobar.com',
                domain: 'acme',
                email_integration_address: '',
                email_integration_id: 11,
                http_integration_id: 1,
                messages: [
                    {
                        bodyText: 'test',
                        createdDatetime: '2020-01-01T00:00:00.000Z',
                        fromAgent: false,
                        meta: '',
                    },
                ],
                subject: '',
                meta: '',
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
            await result.current.onMessageSend({message: 'test'})
        } catch (e) {
            if (e instanceof Error) {
                expect(e.message).toBe('No email integration')
            }
        }
    })
})
