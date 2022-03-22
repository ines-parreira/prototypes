import {
    selfServiceConfigurationUpdated,
    selfServiceConfigurationFetched,
    selfServiceConfigurationsFetched,
} from '../actions'
import reducer from '../reducer'
import {
    selfServiceConfiguration1,
    selfServiceConfiguration2,
} from '../../../../fixtures/self_service_configurations'

describe('selfServiceConfigurations reducer', () => {
    describe('selfServiceConfigurationUpdated action', () => {
        it('should replace an existing tag in the state', () => {
            const updatedSelfServiceConfigurationMock = {
                ...selfServiceConfiguration1,
                shop_name: 'myMockedStoreName',
            }

            const newState = reducer(
                {'1': selfServiceConfiguration1},
                selfServiceConfigurationUpdated(
                    updatedSelfServiceConfigurationMock
                )
            )
            expect(newState).toMatchInlineSnapshot(`
                Object {
                  "1": Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "created_datetime": "2021-02-07T06:07:46.097905+00:00",
                    "deactivated_datetime": null,
                    "id": 1,
                    "quick_response_policies": Array [],
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": true,
                    },
                    "return_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "shop_name": "myMockedStoreName",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-02-07T09:07:46.097905+00:00",
                  },
                }
            `)
        })
    })

    describe('selfServiceConfigurationFetched action', () => {
        it('should add a new selfServiceConfiguration to the state', () => {
            const newState = reducer(
                {},
                selfServiceConfigurationFetched(selfServiceConfiguration1)
            )
            expect(newState).toMatchInlineSnapshot(`
                Object {
                  "1": Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "created_datetime": "2021-02-07T06:07:46.097905+00:00",
                    "deactivated_datetime": null,
                    "id": 1,
                    "quick_response_policies": Array [],
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": true,
                    },
                    "return_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "shop_name": "mystore",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-02-07T09:07:46.097905+00:00",
                  },
                }
            `)
        })
    })

    describe('selfServiceConfigurationsFetched action', () => {
        it('should add the selfServiceConfigurations to the state', () => {
            const newState = reducer(
                {},
                selfServiceConfigurationsFetched([
                    selfServiceConfiguration1,
                    selfServiceConfiguration2,
                ])
            )
            expect(newState).toMatchInlineSnapshot(`
                Object {
                  "1": Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "created_datetime": "2021-02-07T06:07:46.097905+00:00",
                    "deactivated_datetime": null,
                    "id": 1,
                    "quick_response_policies": Array [],
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": true,
                    },
                    "return_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "shop_name": "mystore",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-02-07T09:07:46.097905+00:00",
                  },
                  "2": Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "created_datetime": "2021-02-20T08:15:46.097905+00:00",
                    "deactivated_datetime": "2021-02-20T08:30:46.097905+00:00",
                    "id": 2,
                    "quick_response_policies": Array [],
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": true,
                    },
                    "return_order_policy": Object {
                      "eligibilities": Array [],
                      "enabled": true,
                      "exceptions": Array [],
                    },
                    "shop_name": "otherstore",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-02-20T08:20:46.097905+00:00",
                  },
                }
            `)
        })
    })
})
