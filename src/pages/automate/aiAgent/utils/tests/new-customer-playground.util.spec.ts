import {CreatePlaygroundMessage} from 'models/aiAgentPlayground/types'
import {
    createMockClientPayload,
    createMockHttpIntegrationPayload,
} from '../new-customer-playground.util'

const getMockTicketMessage = (
    props?: Partial<CreatePlaygroundMessage>
): CreatePlaygroundMessage => ({
    bodyText: 'test',
    fromAgent: false,
    createdDatetime: '123',
    meta: {},
    ...props,
})
describe('new-customer-playground util', () => {
    it('should create mock http payload', () => {
        const result = createMockHttpIntegrationPayload({
            body_text: 'test',
            subject: '',
            domain: 'test-gorgias',
            messages: [],
            created_datetime: '123',
            channel: 'email',
        })

        expect(result.ticket.id).toBe('123')
        expect(result).toMatchInlineSnapshot(`
            {
              "message": {
                "body_text": "test",
                "channel": "email",
                "created_datetime": "123",
                "from_agent": false,
                "id": "233881",
                "integration_id": "-1",
                "intents": "[]",
                "meta": {},
                "source": "{"from":{"address":"oliver.smith@foobar.com","name":"Oliver Smith"},"to":[{"address":"playground@gorgias.com","name":""}],"type":"email"}",
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

    it('should create mock client payload for chat', () => {
        const result = createMockClientPayload({
            body_text: 'test',
            subject: '',
            domain: 'test-gorgias',
            messages: [
                getMockTicketMessage({
                    meta: {
                        ai_agent_message_type: 'ai_agent_greeting',
                    },
                }),
            ],
            created_datetime: '123',
            channel: 'chat',
            use_mock_context: true,
            _playground_options: {
                shopName: 'test',
            },
            email_integration_id: -1,
            http_integration_id: -1,
            account_id: 1,
            customer_email: 'test@gorgias.com',
        })

        expect(result.messages[0].meta).toEqual({
            ai_agent_message_type: 'ai_agent_greeting',
        })
        expect(result).toMatchInlineSnapshot(`
            {
              "_playground_options": {
                "shopName": "test",
              },
              "account_id": 1,
              "body_text": "test",
              "channel": "chat",
              "created_datetime": "123",
              "customer_email": "test@gorgias.com",
              "domain": "test-gorgias",
              "email_integration_id": -1,
              "http_integration_id": -1,
              "messages": [
                {
                  "attachments": [],
                  "body_html": "",
                  "body_text": "test",
                  "channel": "chat",
                  "created_datetime": "123",
                  "from_agent": false,
                  "id": 233881,
                  "integration_id": -1,
                  "meta": {
                    "ai_agent_message_type": "ai_agent_greeting",
                  },
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
                    "bcc": [],
                    "cc": [],
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
              ],
              "subject": "",
              "use_mock_context": true,
            }
        `)
    })
})
