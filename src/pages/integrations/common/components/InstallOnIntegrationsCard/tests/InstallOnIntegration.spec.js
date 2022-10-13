import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {InstallOnIntegrationsCardContainer} from '../InstallOnIntegrationsCard.tsx'

import history from 'pages/history.ts'

import {
    SHOPIFY_INTEGRATION_TYPE,
    GORGIAS_CHAT_INTEGRATION_TYPE,
} from 'constants/integration.ts'

jest.mock('pages/history.ts')

const defaultProps = {
    integrationType: SHOPIFY_INTEGRATION_TYPE,
    targetIntegrations: fromJS([
        {
            id: 1,
            type: SHOPIFY_INTEGRATION_TYPE,
            name: 'my store 1',
            created_datetime: '2018-01-01 00:00:00',
        },
        {
            id: 2,
            type: SHOPIFY_INTEGRATION_TYPE,
            name: 'my store 2',
            created_datetime: '2018-01-02 00:00:00',
        },
        {
            id: 3,
            type: SHOPIFY_INTEGRATION_TYPE,
            name: 'my store 3',
            created_datetime: '2018-01-03 00:00:00',
        },
        {
            id: 4,
            type: SHOPIFY_INTEGRATION_TYPE,
            name: 'my store 4',
            created_datetime: '2018-01-04 00:00:00',
        },
    ]),
    integration: fromJS({
        id: 5,
        type: GORGIAS_CHAT_INTEGRATION_TYPE,
        name: 'my chat',
    }),
    updateOrCreateIntegration: () => {},
}

describe('<InstallOnIntegrationsCard/>', () => {
    describe('_installOnStore()', () => {
        it(
            "should redirect to the correct target integration's detail page " +
                'because it needs a scope update',
            async () => {
                const targetIntegration = fromJS({
                    id: 1,
                    type: SHOPIFY_INTEGRATION_TYPE,
                    name: 'my store 1',
                    created_datetime: '2018-01-01 00:00:00',
                    meta: {need_scope_update: true},
                })

                const component = shallow(
                    <InstallOnIntegrationsCardContainer {...defaultProps} />
                )

                await component.instance()._installOnStore(targetIntegration)

                expect(history.push).toHaveBeenCalledWith(
                    `/app/settings/integrations/${targetIntegration.get(
                        'type'
                    )}/` +
                        `${targetIntegration.get(
                            'id'
                        )}/?error=need_scope_update`
                )
            }
        )

        it(
            'should add the target integration to the list of integration to which the chat integration is ' +
                'installed, and submit the update',
            async () => {
                const targetIntegration = fromJS({
                    id: 1,
                    type: SHOPIFY_INTEGRATION_TYPE,
                    name: 'my store 1',
                    created_datetime: '2018-01-01 00:00:00',
                })

                const chatIntegration = fromJS({
                    id: 5,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {shopify_integration_ids: []},
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCardContainer
                        {...defaultProps}
                        integration={chatIntegration}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                    />
                )

                await component.instance()._installOnStore(targetIntegration)

                expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                    fromJS({
                        id: chatIntegration.get('id'),
                        type: chatIntegration.get('type'),
                        meta: {
                            shopify_integration_ids: [
                                targetIntegration.get('id'),
                            ],
                        },
                    })
                )
            }
        )

        it(
            'should not add the target integration to the list of integration to which the chat integration is ' +
                'installed because it is already there, and submit the update',
            async () => {
                const targetIntegration = fromJS({
                    id: 1,
                    type: SHOPIFY_INTEGRATION_TYPE,
                    name: 'my store 1',
                    created_datetime: '2018-01-01 00:00:00',
                })

                const chatIntegration = fromJS({
                    id: 5,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {
                        shopify_integration_ids: [targetIntegration.get('id')],
                    },
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCardContainer
                        {...defaultProps}
                        integration={chatIntegration}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                    />
                )

                await component.instance()._installOnStore(targetIntegration)

                expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                    fromJS({
                        id: chatIntegration.get('id'),
                        type: chatIntegration.get('type'),
                        meta: {
                            shopify_integration_ids: [
                                targetIntegration.get('id'),
                            ],
                        },
                    })
                )
            }
        )
    })

    describe('_removeChatFromStore()', () => {
        it(
            'should remove the id of the target integration from the list of integrations to which the chat ' +
                'integration is installed, and submit the update',
            async () => {
                const targetIntegration = fromJS({
                    id: 1,
                    type: SHOPIFY_INTEGRATION_TYPE,
                    name: 'my store 1',
                    created_datetime: '2018-01-01 00:00:00',
                })

                const chatIntegration = fromJS({
                    id: 5,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {
                        shopify_integration_ids: [targetIntegration.get('id')],
                    },
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCardContainer
                        {...defaultProps}
                        integration={chatIntegration}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                    />
                )

                await component
                    .instance()
                    ._removeFromStore(targetIntegration.get('id'))

                expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                    fromJS({
                        id: chatIntegration.get('id'),
                        type: chatIntegration.get('type'),
                        meta: {shopify_integration_ids: []},
                    })
                )
            }
        )
    })

    describe('render()', () => {
        it('should render first three passed integrations', () => {
            const component = shallow(
                <InstallOnIntegrationsCardContainer {...defaultProps} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render all integrations because the Show more button was clicked', () => {
            const component = shallow(
                <InstallOnIntegrationsCardContainer {...defaultProps} />
            )

            component.find({children: 'Show more'}).simulate('click')

            expect(component).toMatchSnapshot()
        })
    })
})
