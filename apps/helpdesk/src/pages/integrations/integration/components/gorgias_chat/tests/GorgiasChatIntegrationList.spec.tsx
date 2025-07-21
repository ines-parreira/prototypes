import React from 'react'

import { render } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { RootState, StoreDispatch } from 'state/types'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../models/integration/types'
import GorgiasChatIntegrationList from '../GorgiasChatIntegrationList'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<GorgiasChatIntegrationList />', () => {
    const props = {
        loading: fromJS({
            integrations: false,
        }),
        integrations: fromJS([
            {
                id: 1,
                name: 'my chat enabled',
                type: IntegrationType.GorgiasChat,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                    shop_name: 'my associated Shopify store',
                    shop_type: IntegrationType.Shopify,
                    shop_integration_id: 3,
                    status: GorgiasChatStatusEnum.ONLINE,
                    wizard: {
                        status: GorgiasChatCreationWizardStatus.Published,
                        step: GorgiasChatCreationWizardSteps.Installation,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
            },
            {
                id: 3,
                name: 'my associated Shopify store',
                type: IntegrationType.Shopify,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                    wizard: {
                        status: GorgiasChatCreationWizardStatus.Published,
                        step: GorgiasChatCreationWizardSteps.Installation,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
                deactivated_datetime: new Date('2020-12-17'),
            },
        ]) as List<Map<any, any>>,
    }
    const defaultState = {
        integrations: fromJS({ integrations: props.integrations }),
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))
    })

    it('should display correcty the list of chat integrations', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should display associated Shopify store to chat integration', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(getByText(/my associated Shopify store/)).toBeDefined()
    })

    it('should display disconnected icon if Shopify store is disconnected', () => {
        const { getByAltText } = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(getByAltText(/warning icon/)).toBeDefined()
    })
})
