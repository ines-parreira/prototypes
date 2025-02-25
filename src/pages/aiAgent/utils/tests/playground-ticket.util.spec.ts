import { AxiosResponse } from 'axios'

import { getAiAgentCustomer } from 'models/aiAgentPlayground/resources'
import { GetPlaygroundCustomerResponse } from 'models/aiAgentPlayground/types'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
    PLAYGROUND_CUSTOMER_MOCK,
} from '../../constants'
import {
    createMockHttpIntegrationPayload,
    getTicketCustomer,
} from '../playground-ticket.util'

jest.mock('models/aiAgentPlayground/resources', () => ({
    getAiAgentCustomer: jest.fn(),
}))
const mockGetAiAgentCustomer = jest.mocked(getAiAgentCustomer)

describe('playground-ticket util', () => {
    it('should create mock http payload', () => {
        const result = createMockHttpIntegrationPayload({
            body_text: 'test',
            subject: '',
            domain: 'test-gorgias',
            from_agent: false,
            messages: [],
            created_datetime: '123',
            channel: 'email',
            customer: PLAYGROUND_CUSTOMER_MOCK,
        })

        expect(result.ticket.id).toBe('123')
        expect(result).toMatchInlineSnapshot(`
            {
              "message": {
                "attachments": [],
                "body_html": "",
                "body_text": "test",
                "channel": "email",
                "created_datetime": "123",
                "from_agent": false,
                "id": 233881,
                "integration_id": -1,
                "intents": [],
                "meta": {},
                "sender": {
                  "email": "oliver.smith@foobar.com",
                  "firstname": "Oliver",
                  "id": 601409,
                  "lastname": "Smith",
                  "meta": {
                    "name_set_via": "shopify",
                  },
                  "name": "Oliver Smith",
                },
                "source": {
                  "from": {
                    "address": "oliver.smith@foobar.com",
                    "name": "Oliver Smith",
                  },
                  "to": [
                    {
                      "address": "playground@gorgias.com",
                      "name": "",
                    },
                  ],
                  "type": "email",
                },
                "subject": "",
              },
              "ticket": {
                "account": {
                  "domain": "test-gorgias",
                },
                "channel": "email",
                "created_datetime": "123",
                "customer": {
                  "email": "oliver.smith@foobar.com",
                  "firstname": "Oliver",
                  "id": "601409",
                  "integrations": "{"shopify":{"customer":{},"last_order":null,"orders":[]}}",
                  "lastname": "Smith",
                  "name": "Oliver Smith",
                },
                "id": "123",
                "messages": "[]",
                "subject": "",
                "tags": "[]",
              },
            }
        `)
    })

    describe('getTicketCustomer', () => {
        it('should return mock customer', async () => {
            const expected = {
                name: CustomerHttpIntegrationDataMock.name,
                email: CustomerHttpIntegrationDataMock.address,
                firstname: CustomerHttpIntegrationDataMock.firstname,
                lastname: CustomerHttpIntegrationDataMock.lastname,
                integrations: '{}',
                id: '0',
            }

            const result = await getTicketCustomer({
                customer_email: DEFAULT_PLAYGROUND_CUSTOMER.email,
                account_id: 0,
                http_integration_id: 0,
            })

            expect(result).toEqual(expected)
        })

        it('should return customer from API', async () => {
            mockGetAiAgentCustomer.mockResolvedValue(
                Promise.resolve({
                    data: {
                        ticket: {
                            customer: {
                                name: 'Oliver Smith',
                                email: 'oliver@mail.com',
                                firstname: 'Oliver',
                                lastname: 'Smith',
                                integrations: '{}',
                                id: 601409,
                            },
                        },
                    },
                }) as unknown as AxiosResponse<GetPlaygroundCustomerResponse>,
            )

            const result = await getTicketCustomer({
                customer_email: 'test@mail.com',
                account_id: 0,
                http_integration_id: 0,
            })

            expect(result).toEqual({
                name: 'Oliver Smith',
                email: 'oliver@mail.com',
                firstname: 'Oliver',
                lastname: 'Smith',
                integrations: '{}',
                id: '601409',
            })
        })
    })
})
