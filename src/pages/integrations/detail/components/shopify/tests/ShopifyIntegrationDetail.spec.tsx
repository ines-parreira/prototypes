import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {ShopifyIntegrationDetail} from '../ShopifyIntegrationDetail'

describe('ShopifyIntegrationDetail', () => {
    const minProps: ComponentProps<typeof ShopifyIntegrationDetail> = {
        integration: fromJS({}),
        isUpdate: false,
        loading: fromJS({}),
        redirectUri: 'gorgias.io',
        location: {
            search: '?message=&message_type=info',
            hash: fromJS({}),
            pathname: fromJS({}),
            state: fromJS({}),
        },
        history: fromJS({}),
        match: fromJS({}),
        getExistingShopifyIntegration: jest.fn().mockReturnValue(fromJS({})),
        notify: jest.fn(),
        deleteIntegration: jest.fn(),
        fetchIntegration: jest.fn(),
        triggerCreateSuccess: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the page to create a new integration', () => {
        const component = shallow(<ShopifyIntegrationDetail {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration being created with the name of another existing integration', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
                getExistingShopifyIntegration={jest
                    .fn()
                    .mockReturnValue(
                        fromJS({type: 'shopify', meta: {shop_name: name}})
                    )}
                integration={fromJS({
                    integrations: [{type: 'shopify', meta: {shop_name: name}}],
                })}
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page to update an existing integration', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
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
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for a deactivated integration', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
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
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which needs a scope update', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
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
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration for which the sync is not over', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
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
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which is being updated (submit is in progress)', () => {
        const name = 'foo'
        const component = shallow(
            <ShopifyIntegrationDetail
                {...minProps}
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
                {...minProps}
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
            />
        ).setState({name})

        expect(component).toMatchSnapshot()
    })
})
