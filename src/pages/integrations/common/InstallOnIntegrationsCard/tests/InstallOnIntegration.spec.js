import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {
    SHOPIFY_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
} from '../../../../../constants/integration.ts'
import history from '../../../../history.ts'
import InstallOnIntegrationsCard from '../InstallOnIntegrationsCard'

jest.mock('../../../../history.ts')

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
        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
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
                    <InstallOnIntegrationsCard {...defaultProps} />
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
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {shopify_integration_ids: []},
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCard
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
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {
                        shopify_integration_ids: [targetIntegration.get('id')],
                    },
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCard
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
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    name: 'my chat',
                    meta: {
                        shopify_integration_ids: [targetIntegration.get('id')],
                    },
                })

                const updateOrCreateIntegration = jest.fn()

                const component = shallow(
                    <InstallOnIntegrationsCard
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
                <InstallOnIntegrationsCard {...defaultProps} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render all integrations because the Show more button was clicked', () => {
            const component = shallow(
                <InstallOnIntegrationsCard {...defaultProps} />
            )

            component.find({children: 'Show more'}).simulate('click')

            expect(component).toMatchSnapshot()
        })
    })
})
