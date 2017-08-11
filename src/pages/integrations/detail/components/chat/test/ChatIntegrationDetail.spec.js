import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import ChatIntegrationDetail from './../ChatIntegrationDetail'
import configureStore from './../../../../../../store/configureStore'

describe('ChatIntegrationDetail component', () => {
    const minStore = {
        integrations: fromJS({
            integrations: [{
                id: 1,
                name: 'mylittleintegration',
                type: 'shopify'
            }]
        })
    }

    const minProps = {
        store: configureStore(minStore),
        actions: {}
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display correctly when creating a new chat integration', () => {
        const component = shallow(
            <ChatIntegrationDetail
                {...minProps}
                loading={fromJS({updateIntegration: false})}
                integration={fromJS({})}
                currentUser={fromJS({})}
                isUpdate={false}
            />
        ).find('ChatIntegrationDetail').dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly when updating an existing integration', () => {
        const component = shallow(
            <ChatIntegrationDetail
                {...minProps}
                loading={fromJS({updateIntegration: false})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: 'smooch_inside'
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationDetail').dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly when integration is loading', () => {
        const component = shallow(
            <ChatIntegrationDetail
                {...minProps}
                loading={fromJS({updateIntegration: 2})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: 'smooch_inside'
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationDetail').dive()

        expect(component).toMatchSnapshot()
    })

    it('should display the Shopify integrations on which it is installed', () => {
        const component = shallow(
            <ChatIntegrationDetail
                {...minProps}
                loading={fromJS({updateIntegration: 2})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: 'smooch_inside',
                    meta: {
                        shopify_integration_ids: [minStore.integrations.getIn(['integrations', 0, 'id'])]
                    }
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationDetail').dive()

        expect(component).toMatchSnapshot()
    })

    it('should not raise an error if there\'s no Shopify integration matching a saved id', () => {
        const component = shallow(
            <ChatIntegrationDetail
                {...minProps}
                loading={fromJS({updateIntegration: 2})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: 'smooch_inside',
                    meta: {
                        // an id which doesn't exist
                        shopify_integration_ids: [789645341]
                    }
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationDetail').dive()

        expect(component).toMatchSnapshot()
    })
})
