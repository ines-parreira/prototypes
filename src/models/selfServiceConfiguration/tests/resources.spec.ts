import MockAdapter from 'axios-mock-adapter'

import client from '../../api/index.js'
import {
    fetchSelfServiceConfigurations,
    fetchSelfServiceConfiguration,
    updateSelfServiceConfiguration,
} from '../resources'
import {
    selfServiceConfiguration1,
    selfServiceConfiguration2,
} from '../../../fixtures/self_service_configurations'

const mockedServer = new MockAdapter(client)

describe('selfServiceConfiguration resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchSelfServiceConfigurations', () => {
        it('should resolve with a SelfServiceConfiguration list on success', async () => {
            mockedServer.onGet('/api/self_service_configurations/').reply(200, {
                data: [selfServiceConfiguration1, selfServiceConfiguration2],
            })
            const res = await fetchSelfServiceConfigurations()
            expect(res).toMatchSnapshot()
        })
    })

    describe('fetchSelfServiceConfiguration', () => {
        it('should resolve with a SelfServiceConfiguration on success', async () => {
            mockedServer
                .onGet('/api/self_service_configurations/1')
                .reply(200, selfServiceConfiguration1)
            const res = await fetchSelfServiceConfiguration('1')
            expect(res).toMatchInlineSnapshot(`
                Object {
                  "cancel_order_policy": Object {
                    "enabled": true,
                  },
                  "created_datetime": "2021-02-07T06:07:46.097905+00:00",
                  "deactivated_datetime": null,
                  "id": 1,
                  "report_issue_policy": Object {
                    "cases": Array [],
                    "enabled": true,
                  },
                  "return_order_policy": Object {
                    "enabled": true,
                  },
                  "shop_name": "mystore",
                  "track_order_policy": Object {
                    "enabled": true,
                  },
                  "type": "shopify",
                  "updated_datetime": "2021-02-07T09:07:46.097905+00:00",
                }
            `)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/self_service_configurations/1')
                .reply(503, {message: 'error'})
            return expect(fetchSelfServiceConfiguration('1')).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('updateSelfServiceConfiguration', () => {
        it('should resolve with the updated selfServiceConfiguration on success', async () => {
            mockedServer
                .onPut('/api/self_service_configurations/2')
                .reply(200, selfServiceConfiguration2)
            const res = await updateSelfServiceConfiguration(
                selfServiceConfiguration2
            )
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })
    })
})
