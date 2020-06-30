import React from 'react'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import OutlookIntegrationSetup from '../OutlookIntegrationSetup'

const mockStore = configureMockStore([thunk])

describe('<OutlookIntegrationSetup/>', () => {
    describe('render()', () => {
        const actions = {
            activateOnboardingIntegrations: jest.fn(),
            fetchOutlookOnboardingIntegrations: () => Promise.resolve(),
        }

        const integrations = fromJS({
            extra: {
                outlook: {
                    onboardingIntegrations: {
                        data: [],
                        meta: {
                            item_count: 0,
                            nb_pages: 1,
                            page: 1,
                        },
                    },
                },
            },
        })

        it('should render the list of integrations with 0 address', () => {
            const component = shallow(
                <OutlookIntegrationSetup
                    store={mockStore({integrations})}
                    loading={fromJS({updateIntegration: false})}
                    actions={actions}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render the list of integrations with 1 address', () => {
            const component = shallow(
                <OutlookIntegrationSetup
                    store={mockStore({
                        integrations: integrations
                            .setIn(
                                [
                                    'extra',
                                    'outlook',
                                    'onboardingIntegrations',
                                    'data',
                                ],
                                fromJS([
                                    {
                                        id: 1,
                                        meta: {address: 'email1@foo.com'},
                                        name: 'Address 1',
                                    },
                                ])
                            )
                            .setIn(
                                [
                                    'extra',
                                    'outlook',
                                    'onboardingIntegrations',
                                    'meta',
                                    'item_count',
                                ],
                                1
                            ),
                    })}
                    loading={fromJS({updateIntegration: false})}
                    actions={actions}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render the list of integrations with 2 addresses', () => {
            const component = shallow(
                <OutlookIntegrationSetup
                    store={mockStore({
                        integrations: integrations
                            .setIn(
                                [
                                    'extra',
                                    'outlook',
                                    'onboardingIntegrations',
                                    'data',
                                ],
                                fromJS([
                                    {
                                        id: 1,
                                        meta: {address: 'email1@foo.com'},
                                        name: 'Address 1',
                                    },
                                    {
                                        id: 2,
                                        meta: {address: 'email2@foo.com'},
                                        name: 'Address 2',
                                    },
                                ])
                            )
                            .setIn(
                                [
                                    'extra',
                                    'outlook',
                                    'onboardingIntegrations',
                                    'meta',
                                    'item_count',
                                ],
                                2
                            ),
                    })}
                    loading={fromJS({updateIntegration: false})}
                    actions={actions}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })
})
