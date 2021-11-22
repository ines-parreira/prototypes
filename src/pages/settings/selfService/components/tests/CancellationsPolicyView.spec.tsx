import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {useParams} from 'react-router-dom'

import {CancellationsPolicyView} from '../CancellationsPolicyView'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../../models/selfServiceConfiguration/types'
import {SelfServiceConfigurationsState} from '../../../../../state/entities/selfServiceConfigurations/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {updateSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const updateSelfServiceConfigurationMock =
    updateSelfServiceConfiguration as jest.MockedFunction<
        typeof updateSelfServiceConfiguration
    >
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

jest.mock('../../../../../models/selfServiceConfiguration/resources')
jest.mock('react-router')

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `myStore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `myStore${i + 1}`,
        created_datetime: '2021-01-26T00:29:00Z',
        updated_datetime: '2021-01-26T00:29:30Z',
        deactivated_datetime: i % 2 === 0 ? null : '2021-01-26T00:30:00Z',
        // track_order && return_order policies enabled for mystore1 and mystore3
        // report_issue && cancel_order policies enabled for mystore2 and mystore4
        report_issue_policy: {
            enabled: i % 2 !== 0,
            cases: [],
        },
        track_order_policy: {
            enabled: i % 2 === 0,
        },
        cancel_order_policy: {
            enabled: i % 2 !== 0,
            eligibilities: [
                {
                    key: 'gorgias_order_status',
                    value: ['unfulfilled'],
                    operator: 'oneOf',
                },
            ],
        },
        return_order_policy: {
            enabled: i % 2 === 0,
        },
    }))
}

describe('<CancellationsPolicyView/>', () => {
    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    const defaultState = {
        currentAccount: fromJS({
            features: {
                automation_return_flow: {enabled: true},
                automation_cancellations_flow: {enabled: true},
                automation_track_order_flow: {enabled: true},
                automation_report_issue_flow: {enabled: true},
            },
            created_datetime: '2021-08-01T00:00:00Z',
        }),
        entities: {
            macros: {},
            rules: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenters: {},
            helpCenterArticles: {},
            selfServiceConfigurations: {},
        },
        integrations: fromJS({}),
    }

    describe('render()', () => {
        it('should render the eligibility window option as unfulfilled', () => {
            useParamsMock.mockReturnValue({
                shopName: 'myStore1',
                integrationType: 'shopify',
            })

            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        entities: {
                            ...defaultState.entities,
                            selfServiceConfigurations:
                                selfServiceConfigurations.reduce(
                                    (
                                        configurations: SelfServiceConfigurationsState,
                                        configuration: SelfServiceConfiguration
                                    ) => ({
                                        ...configurations,
                                        [configuration.id]: configuration,
                                    }),
                                    {} as Partial<SelfServiceConfiguration>
                                ),
                        },
                    })}
                >
                    <CancellationsPolicyView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('onSubmit()', () => {
        it('should set the eligibility option to processing fulfillment and make the update request', () => {
            useParamsMock.mockReturnValue({
                shopName: 'myStore1',
                integrationType: 'shopify',
            })

            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        entities: {
                            ...defaultState.entities,
                            selfServiceConfigurations:
                                selfServiceConfigurations.reduce(
                                    (
                                        configurations: SelfServiceConfigurationsState,
                                        configuration: SelfServiceConfiguration
                                    ) => ({
                                        ...configurations,
                                        [configuration.id]: configuration,
                                    }),
                                    {} as Partial<SelfServiceConfiguration>
                                ),
                        },
                    })}
                >
                    <CancellationsPolicyView />
                </Provider>
            )

            expect(container).toMatchSnapshot()

            const newlySelectedOption = screen.getByText(
                /Processing Fulfillment/
            )
            const submitButton = screen.getByText(/Save changes/)

            fireEvent.click(newlySelectedOption)
            fireEvent.click(submitButton)

            expect(updateSelfServiceConfigurationMock.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [
                        Object {
                          "key": "gorgias_order_status",
                          "operator": "oneOf",
                          "value": Array [
                            "unfulfilled",
                            "processing_fulfillment",
                          ],
                        },
                      ],
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": null,
                    "id": 1,
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": true,
                    },
                    "shop_name": "myStore1",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-01-26T00:29:30Z",
                  },
                ]
            `)
        })
    })
})
