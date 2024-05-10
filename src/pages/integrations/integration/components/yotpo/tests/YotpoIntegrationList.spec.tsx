import React from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {
    SMILE_INTEGRATION_TYPE,
    SUCCESS_AUTHENTICATION_STATUS,
    YOTPO_INTEGRATION_TYPE,
} from 'constants/integration'
import {RootState, StoreDispatch} from 'state/types'

import YotpoIntegrationList from 'pages/integrations/integration/components/yotpo/YotpoIntegrationList'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<YotpoIntegrationList/>', () => {
    const defaultState = {}
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('render()', () => {
        it('should render the Yotpo integration', () => {
            const {container} = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <YotpoIntegrationList
                            integrations={fromJS([
                                {
                                    type: YOTPO_INTEGRATION_TYPE,
                                    id: 1,
                                    name: 'Yotpo',
                                    meta: {
                                        oauth: {
                                            status: SUCCESS_AUTHENTICATION_STATUS,
                                        },
                                        import_state: {is_over: true},
                                    },
                                },
                            ])}
                            loading={fromJS({})}
                            redirectUri={
                                'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                            }
                        />
                    </Provider>
                </MemoryRouter>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a loader because the integration is loading', () => {
            const {container} = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <YotpoIntegrationList
                            integrations={fromJS([
                                {
                                    type: YOTPO_INTEGRATION_TYPE,
                                    id: 1,
                                    name: 'Yotpo',
                                    meta: {
                                        oauth: {
                                            status: SUCCESS_AUTHENTICATION_STATUS,
                                        },
                                        import_state: {is_over: false},
                                    },
                                },
                            ])}
                            loading={fromJS({updateIntegration: true})}
                            redirectUri={
                                'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                            }
                        />
                    </Provider>
                </MemoryRouter>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render an integration cause the one passed is not a Yotpo integration', () => {
            const {container} = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <YotpoIntegrationList
                            integrations={fromJS([
                                {
                                    type: SMILE_INTEGRATION_TYPE,
                                    id: 1,
                                    name: 'Invalid',
                                    meta: {
                                        oauth: {
                                            status: SUCCESS_AUTHENTICATION_STATUS,
                                        },
                                        import_state: {is_over: false},
                                    },
                                },
                            ])}
                            loading={fromJS({})}
                            redirectUri={
                                'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                            }
                        />
                    </Provider>
                </MemoryRouter>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a deactivated integration that can be reenabled', () => {
            const {container} = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <YotpoIntegrationList
                            integrations={fromJS([
                                {
                                    type: YOTPO_INTEGRATION_TYPE,
                                    id: 1,
                                    name: 'Yotpo',
                                    meta: {
                                        oauth: {
                                            status: SUCCESS_AUTHENTICATION_STATUS,
                                        },
                                        import_state: {is_over: true},
                                    },
                                    deactivated_datetime: '2018-01-01 10:12',
                                },
                            ])}
                            loading={fromJS({})}
                            redirectUri={
                                'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                            }
                        />
                    </Provider>
                </MemoryRouter>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
