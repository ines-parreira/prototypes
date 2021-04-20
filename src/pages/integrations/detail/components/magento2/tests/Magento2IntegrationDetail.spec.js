import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {Magento2IntegrationDetail} from '../Magento2IntegrationDetail'

describe('<Magento2IntegrationDetail/>', () => {
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
        loading: fromJS({}),
    }

    describe('render()', () => {
        it('should render the page to create a new integration', () => {
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({})}
                    isUpdate={false}
                    {...commonProps}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the page for an integration being created with the name of another existing integration', () => {
            const storeUrl = 'magento.gorgi.us'
            const component = shallow(
                <Magento2IntegrationDetail
                    integration={fromJS({})}
                    isUpdate={false}
                    {...commonProps}
                />
            ).setState({url: storeUrl})

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
                    {...commonProps}
                />
            ).setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

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
                    {...commonProps}
                />
            ).setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

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
                    {...commonProps}
                />
            ).setState({url: storeUrl, adminUrlSuffix: 'admin_12fg'})

            expect(component).toMatchSnapshot()
        })
    })
})
