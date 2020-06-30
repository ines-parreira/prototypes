import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {MAGENTO2_INTEGRATION_TYPE} from '../../../../../../constants/integration'
import Magento2IntegrationDetail from '../Magento2IntegrationDetail'

const mockStore = configureMockStore([thunk])
const _noop = () => {}

describe('<Magento2IntegrationDetail/>', () => {
    let store

    const commonProps = {
        redirectUri: 'gorgias.io',
        location: {
            query: {
                message: '',
                message_type: 'info',
            },
        },
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

    describe('render()', () => {
        it('should render the page to create a new integration', () => {
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({})}
                    isUpdate={false}
                    store={store}
                    {...commonProps}
                />
            )
                .dive()
                .dive()

            expect(component).toMatchSnapshot()
        })

        it('should render the page for an integration being created with the name of another existing integration', () => {
            const storeUrl = 'magento.gorgi.us'
            store = mockStore({
                integrations: fromJS({
                    integrations: [
                        {
                            type: MAGENTO2_INTEGRATION_TYPE,
                            meta: {store_url: storeUrl},
                        },
                    ],
                }),
            })

            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({})}
                    isUpdate={false}
                    store={store}
                    {...commonProps}
                />
            )
                .dive()
                .dive()
                .setState({url: storeUrl})

            expect(component).toMatchSnapshot()
        })

        it('should render the page to update an existing integration', () => {
            const storeUrl = 'magento.gorgi.us'
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({
                        id: 1,
                        name: storeUrl,
                        meta: {
                            import_state: {
                                is_over: true,
                            },
                        },
                    })}
                    isUpdate={true}
                    store={store}
                    {...commonProps}
                />
            )
                .dive()
                .dive()
                .setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

            expect(component).toMatchSnapshot()
        })

        it('should render the page for a deactivated integration', () => {
            const storeUrl = 'magento.gorgi.us'
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({
                        id: 1,
                        name: storeUrl,
                        meta: {
                            import_state: {
                                is_over: true,
                            },
                        },
                        deactivated_datetime: '2018-01-01T18:52:17',
                    })}
                    isUpdate={true}
                    store={store}
                    {...commonProps}
                />
            )
                .dive()
                .dive()
                .setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

            expect(component).toMatchSnapshot()
        })

        it('should render the page for an integration for which the sync is not over', () => {
            const storeUrl = 'magento.gorgi.us'
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({
                        id: 1,
                        name: storeUrl,
                        meta: {
                            import_state: {
                                is_over: false,
                            },
                        },
                    })}
                    isUpdate={true}
                    store={store}
                    {...commonProps}
                />
            )
                .dive()
                .dive()
                .setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

            expect(component).toMatchSnapshot()
        })
    })
})
