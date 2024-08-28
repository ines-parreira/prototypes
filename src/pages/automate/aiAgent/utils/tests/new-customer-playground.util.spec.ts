import {createMockHttpIntegrationPayload} from '../new-customer-playground.util'

describe('new-customer-playground util', () => {
    it('should create mock http payload', () => {
        const result = createMockHttpIntegrationPayload({
            body_text: 'test',
            subject: '',
            domain: 'test-gorgias',
            messages: [],
            created_datetime: '123',
            integration: {
                id: 2,
                address: 'Test Address',
            },
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
                "integration_id": "2",
                "intents": "[]",
                "meta": "",
                "source": "{"from":{"address":"oliver.smith@foobar.com","name":"Oliver Smith"},"to":[{"address":"Test Address","name":""}],"type":"email"}",
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
})
