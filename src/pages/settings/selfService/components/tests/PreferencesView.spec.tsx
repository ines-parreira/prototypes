import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import {PreferencesView} from '../PreferencesView'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../../models/selfServiceConfiguration/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {updateSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'
import {SelfServiceConfigurationsState} from '../../../../../state/entities/selfServiceConfigurations/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const updateSelfServiceConfigurationMock = updateSelfServiceConfiguration as jest.MockedFunction<
    typeof updateSelfServiceConfiguration
>
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

jest.mock('../../../../common/components/ToggleButton', () => {
    return ({
        value,
        onChange,
    }: {
        value: string
        onChange: (param: boolean) => null
    }) => {
        return (
            <div
                data-testid="toggle-button"
                onClick={() => {
                    onChange(!Boolean(value))
                }}
            >{`ToggleButtonMock value=${value}`}</div>
        )
    }
})
jest.mock('../../../../../models/selfServiceConfiguration/resources')
jest.mock('react-router')

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `mystore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `mystore${i + 1}`,
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
        },
        return_order_policy: {
            enabled: i % 2 === 0,
        },
    }))
}

describe('<SelfServicePreferencesView/>', () => {
    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    const defaultState = {
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
        ui: {
            stats: {
                fetchingMap: {},
            },
            ticketNavbar: {
                optimisticAccountSettings: {
                    views: {},
                    view_sections: {},
                },
                optimisticUserSettings: {
                    views: {},
                    view_sections: {},
                },
            },
            views: {
                activeViewId: 0,
            },
        },
        integrations: fromJS({}),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render the 4 policy rows, 2 active and 2 inactive', () => {
            useParamsMock.mockReturnValue({
                shopName: shopifyIntegrations[0]['meta']['shop_name'],
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
                            selfServiceConfigurations: selfServiceConfigurations.reduce(
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
                    <PreferencesView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('ToggleButton.onChange()', () => {
        it('should deactivate the report issue policy on the mystore3 store', () => {
            // make sure return order policy is enabled before toggling
            expect(
                selfServiceConfigurations[2]['return_order_policy']['enabled']
            ).toBeTruthy()

            useParamsMock.mockReturnValue({
                shopName: shopifyIntegrations[2]['meta']['shop_name'],
                integrationType: 'shopify',
            })

            const {container, getAllByTestId} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        entities: {
                            ...defaultState.entities,
                            selfServiceConfigurations: selfServiceConfigurations.reduce(
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
                    <PreferencesView />
                </Provider>
            )

            expect(container).toMatchSnapshot()

            fireEvent.click(getAllByTestId('toggle-button')[2]) // selecting the return order policy toggle button
            expect(updateSelfServiceConfigurationMock.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": null,
                    "id": 3,
                    "report_issue_policy": Object {
                      "cases": Array [],
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": false,
                    },
                    "shop_name": "mystore3",
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
