import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {FacebookIntegrationSetupContainer} from '../FacebookIntegrationSetup'

describe('FacebookIntegrationSetup', () => {
    const minProps = {
        loading: fromJS({
            updateIntegration: false,
        }),
        actions: {
            fetchFacebookOnboardingIntegrations: () => Promise.resolve(),
            activateFacebookOnboardingPage: () => Promise.resolve(),
            fetchIntegrations: () => Promise.resolve(),
        },
        integrations: fromJS([]),
        pagination: fromJS({
            page: 1,
            nb_pages: 1,
            per_page: 1,
            item_count: 1,
        }),
    }

    const onboardingIntegrations = fromJS([
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
    ])

    it('should render an empty list because there is no integrations to display', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer {...minProps} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render integrations because there is available data and and it is not loading', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a loader because integrations are currently being fetched', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations}
            />
        ).setState({
            isLoading: true,
        })

        expect(component).toMatchSnapshot()
    })

    it('should render the integration as enabled and save button as enabled because the integration is selected', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations}
            />
        ).setState({
            selectedIntegrations: fromJS({}).set(
                onboardingIntegrations.getIn([0, 'id']),
                onboardingIntegrations.get(0).setIn(
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
        const integrationsWithIG = onboardingIntegrations.setIn(
            [0, 'meta', 'instagram', 'id'],
            'foo'
        )

        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={integrationsWithIG}
            />
        ).setState({
            selectedIntegrations: fromJS({}).set(
                integrationsWithIG.getIn([0, 'id']),
                integrationsWithIG.get(0).setIn(
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
