import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT} from '../../../../../../../config/integrations/smooch_inside'
import {SHOPIFY_INTEGRATION_TYPE, SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../../../constants/integration'

import ChatIntegrationAppearance from './../ChatIntegrationAppearance'
import configureStore from './../../../../../../../store/configureStore'

describe('ChatIntegrationAppearance component', () => {
    const minStore = {
        integrations: fromJS({
            integrations: [{
                id: 1,
                name: 'mylittleintegration',
                type: SHOPIFY_INTEGRATION_TYPE
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
            <ChatIntegrationAppearance
                {...minProps}
                loading={fromJS({updateIntegration: false})}
                integration={fromJS({})}
                currentUser={fromJS({})}
                isUpdate={false}
            />
        ).find('ChatIntegrationAppearance').dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly when updating an existing integration', () => {
        const component = shallow(
            <ChatIntegrationAppearance
                {...minProps}
                loading={fromJS({updateIntegration: false})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    }
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationAppearance').dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly when integration is loading', () => {
        const component = shallow(
            <ChatIntegrationAppearance
                {...minProps}
                loading={fromJS({updateIntegration: 2})}
                integration={fromJS({
                    id: 2,
                    name: 'hellosmoochintegration',
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    }
                })}
                currentUser={fromJS({})}
                isUpdate={true}
            />
        ).find('ChatIntegrationAppearance').dive()

        expect(component).toMatchSnapshot()
    })
})
