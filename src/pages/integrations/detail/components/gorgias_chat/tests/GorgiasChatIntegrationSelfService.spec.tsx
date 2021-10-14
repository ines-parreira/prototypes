import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'

import thunk from 'redux-thunk'

import {Provider} from 'react-redux'

import {GorgiasChatIntegrationSelfServiceComponent} from '../GorgiasChatIntegrationSelfService'
import {IntegrationType} from '../../../../../../models/integration/types'
import {RootState, StoreDispatch} from '../../../../../../state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<GorgiasChatIntegrationSelfService/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const defaultState = {
        currentAccount: fromJS({
            features: {
                automation_return_flow: {enabled: true},
                automation_cancellations_flow: {enabled: true},
                automation_track_order_flow: {enabled: true},
                automation_report_issue_flow: {enabled: true},
            },
            created_datetime: '2021-08-01T00:00:00Z',
        }),
        entities: {
            macros: {},
            rules: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenters: {},
            helpCenterArticles: {},
            selfServiceConfigurations: {},
        },
        integrations: fromJS({}),
    }

    const props = {
        integration: fromJS({
            id: 7,
            name: 'my chat integration',
            type: IntegrationType.GorgiasChat,
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
        }) as Map<any, any>,
    }

    describe('render()', () => {
        it('should render the product update message', () => {
            const {container} = render(
                <Provider store={mockStore({...defaultState})}>
                    <GorgiasChatIntegrationSelfServiceComponent {...props} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
