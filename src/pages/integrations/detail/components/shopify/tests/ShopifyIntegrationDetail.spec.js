import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {ShopifyIntegrationDetail} from '../ShopifyIntegrationDetail'

describe('ShopifyIntegrationDetail', () => {
    const commonProps = {
        redirectUri: 'gorgias.io',
        location: {
            search: '?message=&message_type=info',
        },
        notify: jest.fn(),
        actions: {
            activateIntegration: jest.fn(),
            deactivateIntegration: jest.fn(),
            deleteIntegration: jest.fn(),
        },
        getExistingShopifyIntegration: jest.fn(),
        loading: fromJS({}),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the page to create a new integration', () => {
        commonProps.getExistingShopifyIntegration.mockReturnValue(fromJS({}))
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({})}
                isUpdate={false}
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration being created with the name of another existing integration', () => {
        const name = 'foo'
        commonProps.getExistingShopifyIntegration.mockReturnValue(
            fromJS({type: 'shopify', meta: {shop_name: name}})
        )
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({})}
                integrations={fromJS({
                    integrations: [{type: 'shopify', meta: {shop_name: name}}],
                })}
                isUpdate={false}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page to update an existing integration', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: true,
                            },
                        },
                    },
                })}
                isUpdate={true}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for a deactivated integration', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: true,
                            },
                        },
                    },
                    deactivated_datetime: '2018-01-01T18:52:17',
                })}
                isUpdate={true}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which needs a scope update', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: true,
                            },
                        },
                        need_scope_update: true,
                    },
                })}
                isUpdate={true}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration for which the sync is not over', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: false,
                            },
                        },
                    },
                })}
                isUpdate={true}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which is being updated (submit is in progress)', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: true,
                            },
                        },
                    },
                })}
                isUpdate={true}
                {...commonProps}
                loading={fromJS({
                    updateIntegration: true,
                })}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration for which the authentication is still pending', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        import_state: {
                            customers: {
                                is_over: true,
                            },
                        },
                        oauth: {
                            status: 'pending',
                        },
                    },
                })}
                isUpdate={true}
                {...commonProps}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })
})
