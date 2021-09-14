import React from 'react'
import {render, fireEvent, act} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {SelfServiceView} from '../SelfServiceView'
import {
    SelfServiceConfiguration,
    ShopType,
} from '../../../../../models/selfServiceConfiguration/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {
    fetchSelfServiceConfigurations,
    updateSelfServiceConfiguration,
} from '../../../../../models/selfServiceConfiguration/resources'
import {SelfServiceConfigurationsState} from '../../../../../state/entities/selfServiceConfigurations/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const fetchSelfServiceConfigurationsMock = fetchSelfServiceConfigurations as jest.MockedFunction<
    typeof fetchSelfServiceConfigurations
>
const updateSelfServiceConfigurationMock = updateSelfServiceConfiguration as jest.MockedFunction<
    typeof updateSelfServiceConfiguration
>

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
        report_issue_policy: {
            enabled: false,
            cases: [],
        },
        track_order_policy: {
            enabled: false,
        },
        cancel_order_policy: {
            enabled: false,
        },
        return_order_policy: {
            enabled: false,
        },
    }))
}

describe('<SelfServiceView/>', () => {
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
            editor: {
                isEditingLink: false,
            },
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
            selfServiceConfigurations: {
                loading: false,
            },
        },
        integrations: fromJS({}),
    }

    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(Date.prototype, 'toISOString').mockImplementation(
            () => '2021-01-26T00:30:00Z'
        )
    })

    describe('render()', () => {
        it('should render the default message when there is no active shopify integration', () => {
            fetchSelfServiceConfigurationsMock.mockImplementationOnce(() => {
                return Promise.resolve({
                    data: [],
                })
            })

            const {container} = render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                    })}
                >
                    <SelfServiceView />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should render a row for each shopify integration, 2 active and 1 inactive ssp services', () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(3)
            const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
                3
            )

            fetchSelfServiceConfigurationsMock.mockImplementationOnce(() => {
                return Promise.resolve({
                    data: selfServiceConfigurations,
                })
            })

            act(() => {
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
                        <SelfServiceView />
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            })
        })
    })

    describe('ToggleButton.onChange()', () => {
        it('should send an updateSelfServiceConfigurations action and the ssp for the store with id 1 will get deactivated', () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(4)
            const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
                4
            )

            act(() => {
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
                        <SelfServiceView />
                    </Provider>
                )

                expect(container).toMatchSnapshot()

                fireEvent.click(getAllByTestId('toggle-button')[0]) // selecting the 1st store (id = 1)
                expect(updateSelfServiceConfigurationMock.mock.calls[0])
                    .toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "cancel_order_policy": Object {
                          "enabled": false,
                        },
                        "created_datetime": "2021-01-26T00:29:00Z",
                        "deactivated_datetime": "2021-01-26T00:30:00Z",
                        "id": 1,
                        "report_issue_policy": Object {
                          "cases": Array [],
                          "enabled": false,
                        },
                        "return_order_policy": Object {
                          "enabled": false,
                        },
                        "shop_name": "mystore1",
                        "track_order_policy": Object {
                          "enabled": false,
                        },
                        "type": "shopify",
                        "updated_datetime": "2021-01-26T00:29:30Z",
                      },
                    ]
                `)
            })
        })

        it('should send an updateSelfServiceConfigurations action and the ssp for the store with id 2 will get activated', () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(4)
            const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
                4
            )

            act(() => {
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
                        <SelfServiceView />
                    </Provider>
                )

                expect(container).toMatchSnapshot()

                fireEvent.click(getAllByTestId('toggle-button')[1]) // selecting the 2nd store (id = 2)
                expect(updateSelfServiceConfigurationMock.mock.calls[0])
                    .toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "cancel_order_policy": Object {
                          "enabled": false,
                        },
                        "created_datetime": "2021-01-26T00:29:00Z",
                        "deactivated_datetime": null,
                        "id": 2,
                        "report_issue_policy": Object {
                          "cases": Array [],
                          "enabled": false,
                        },
                        "return_order_policy": Object {
                          "enabled": false,
                        },
                        "shop_name": "mystore2",
                        "track_order_policy": Object {
                          "enabled": false,
                        },
                        "type": "shopify",
                        "updated_datetime": "2021-01-26T00:29:30Z",
                      },
                    ]
                `)
            })
        })
    })
})
