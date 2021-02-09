import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import FacebookIntegrationSetup from '../FacebookIntegrationSetup'
import {initialState} from '../../../../../../../state/integrations/reducers.ts'

const mockStore = configureMockStore([thunk])

describe('FacebookIntegrationSetup', () => {
    const commonProps = {
        loading: fromJS({
            updateIntegration: false,
        }),
        actions: {
            fetchFacebookOnboardingIntegrations: () => Promise.resolve(),
            activateFacebookOnboardingPage: () => Promise.resolve(),
            fetchIntegrations: () => Promise.resolve(),
        },
    }

    const onboardingIntegrations = fromJS({
        data: [
            {
                id: 1,
                meta: {
                    name: 'My page',
                    about: 'A page about stuff',
                    picture: {
                        data: {url: 'https://gorgias.io/page-image-link.png'},
                    },
                },
            },
        ],
        meta: {
            page: 1,
            nb_pages: 1,
            per_page: 1,
            item_count: 1,
        },
    })

    const notEmptyInitialState = initialState.setIn(
        ['extra', 'facebook', 'onboardingIntegrations'],
        onboardingIntegrations
    )

    it('should render an empty list because there is no integrations to display', () => {
        const component = shallow(
            <FacebookIntegrationSetup
                store={mockStore({integrations: initialState})}
                {...commonProps}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render integrations because there is available data and and it is not loading', () => {
        const component = shallow(
            <FacebookIntegrationSetup
                store={mockStore({integrations: notEmptyInitialState})}
                {...commonProps}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render a loader because integrations are currently being fetched', () => {
        const component = shallow(
            <FacebookIntegrationSetup
                store={mockStore({integrations: notEmptyInitialState})}
                {...commonProps}
            />
        )
            .dive()
            .setState({
                isLoading: true,
            })

        expect(component).toMatchSnapshot()
    })

    it('should render the integration as enabled and save button as enabled because the integration is selected', () => {
        const component = shallow(
            <FacebookIntegrationSetup
                store={mockStore({integrations: notEmptyInitialState})}
                {...commonProps}
            />
        )
            .dive()
            .setState({
                selectedIntegrations: fromJS({}).set(
                    onboardingIntegrations.getIn(['data', 0, 'id']),
                    onboardingIntegrations.getIn(['data', 0]).setIn(
                        ['meta', 'settings'],
                        fromJS({
                            messenger_enabled: true,
                            posts_enabled: true,
                            instagram_comments_enabled: false,
                            instagram_mentions_enabled: false,
                        })
                    )
                ),
            })

        expect(component).toMatchSnapshot()
    })

    it('should render the integration as enabled with Instagram enabled because it has an Instagram id', () => {
        const component = shallow(
            <FacebookIntegrationSetup
                store={mockStore({
                    integrations: notEmptyInitialState.setIn(
                        [
                            'extra',
                            'facebook',
                            'onboardingIntegrations',
                            'data',
                            0,
                            'meta',
                            'instagram',
                            'id',
                        ],
                        'foo'
                    ),
                })}
                {...commonProps}
            />
        )
            .dive()
            .setState({
                selectedIntegrations: fromJS({}).set(
                    onboardingIntegrations.getIn(['data', 0, 'id']),
                    onboardingIntegrations.getIn(['data', 0]).setIn(
                        ['meta', 'settings'],
                        fromJS({
                            messenger_enabled: true,
                            posts_enabled: true,
                            instagram_comments_enabled: true,
                            instagram_mentions_enabled: true,
                        })
                    )
                ),
            })

        expect(component).toMatchSnapshot()
    })
})
