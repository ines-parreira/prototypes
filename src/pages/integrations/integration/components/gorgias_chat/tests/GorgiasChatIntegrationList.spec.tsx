import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map, List} from 'immutable'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import GorgiasChatIntegrationList from '../GorgiasChatIntegrationList'

import {
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../models/integration/types'

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
                    status: GorgiasChatStatusEnum.ONLINE,
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
        integrations: fromJS({integrations: props.integrations}),
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display correcty the list of chat integrations', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should display associated Shopify store to chat integration', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>
        )
        expect(getByText(/my associated Shopify store/)).toBeDefined()
    })

    it('should display disconnected icon if Shopify store is disconnected', () => {
        const {getByAltText} = render(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>
        )
        expect(getByAltText(/warning icon/)).toBeDefined()
    })
})
