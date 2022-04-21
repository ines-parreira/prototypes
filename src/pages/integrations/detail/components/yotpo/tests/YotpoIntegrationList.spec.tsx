import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {
    SMILE_INTEGRATION_TYPE,
    SUCCESS_AUTHENTICATION_STATUS,
    YOTPO_INTEGRATION_TYPE,
} from 'constants/integration'

import YotpoIntegrationList from '../YotpoIntegrationList'

describe('<YotpoIntegrationList/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('render()', () => {
        it('should render the Yotpo integration', () => {
            const component = shallow(
                <YotpoIntegrationList
                    integrations={fromJS([
                        {
                            type: YOTPO_INTEGRATION_TYPE,
                            id: 1,
                            name: 'Yotpo',
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                import_state: {is_over: true},
                            },
                        },
                    ])}
                    loading={fromJS({})}
                    redirectUri={
                        'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                    }
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the integration is loading', () => {
            const component = shallow(
                <YotpoIntegrationList
                    integrations={fromJS([
                        {
                            type: YOTPO_INTEGRATION_TYPE,
                            id: 1,
                            name: 'Yotpo',
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                import_state: {is_over: false},
                            },
                        },
                    ])}
                    loading={fromJS({updateIntegration: true})}
                    redirectUri={
                        'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                    }
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render an integration cause the one passed is not a Yotpo integration', () => {
            const component = shallow(
                <YotpoIntegrationList
                    integrations={fromJS([
                        {
                            type: SMILE_INTEGRATION_TYPE,
                            id: 1,
                            name: 'Invalid',
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                import_state: {is_over: false},
                            },
                        },
                    ])}
                    loading={fromJS({})}
                    redirectUri={
                        'https://reviews.yotpo.com/#/app_market_authorization?app_market_mode&application_id=test'
                    }
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a deactivated integration that can be reenabled', () => {
            const component = shallow(
                <YotpoIntegrationList
                    integrations={fromJS([
                        {
                            type: YOTPO_INTEGRATION_TYPE,
                            id: 1,
                            name: 'Yotpo',
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
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
            )

            expect(component).toMatchSnapshot()
        })
    })
})
