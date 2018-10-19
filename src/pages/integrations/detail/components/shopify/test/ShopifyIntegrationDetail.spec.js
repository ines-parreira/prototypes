import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ShopifyIntegrationDetail from '../ShopifyIntegrationDetail'

const mockStore = configureMockStore([thunk])
const _noop = () => {}

describe('ShopifyIntegrationDetail', () => {
    let store

    const commonProps = {
        redirectUri: 'gorgias.io',
        location: {},
        notify: _noop,
        actions: {
            activateIntegration: _noop,
            deactivateIntegration: _noop,
            deleteIntegration: _noop,
        },
        loading: fromJS({}),
    }

    beforeEach(() => {
        store = mockStore({})
    })

    it('should render the page to create a new integration', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({})}
                isUpdate={false}
                store={store}
                {...commonProps}
            />
        ).dive().dive()

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration being created with the name of another existing integration', () => {
        const name = 'foo'
        store = mockStore({
            integrations: fromJS({integrations: [{type: 'shopify', meta: {shop_name: name}}]})
        })

        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({})}
                isUpdate={false}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page to update an existing integration', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: true
                        }
                    }
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for a deactivated integration', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: true
                        }
                    },
                    deactivated_datetime: '2018-01-01T18:52:17'
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which needs a scope update', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: true
                        },
                        need_scope_update: true
                    }
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration for which the sync is not over', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: false
                        }
                    }
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration which is being updated (submit is in progress)', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: true
                        }
                    }
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
                loading={fromJS({
                    updateIntegration: true
                })}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })

    it('should render the page for an integration for which the authentication is still pending', () => {
        const component = shallow(
            <ShopifyIntegrationDetail
                integration={fromJS({
                    id: 1,
                    name: 'foo',
                    meta: {
                        sync_state: {
                            is_initialized: true
                        },
                        oauth: {
                            status: 'pending'
                        }
                    }
                })}
                isUpdate={true}
                store={store}
                {...commonProps}
            />
        ).dive().dive().setState({name})

        expect(component).toMatchSnapshot()
    })
})
