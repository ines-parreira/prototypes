import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {FacebookIntegrationSetupContainer} from '../FacebookIntegrationSetup'
import {
    ADS_MANAGEMENT,
    ADS_READ,
    ADVERTISE_ROLE,
    ANALYZE_ROLE,
    BUSINESS_MANAGEMENT,
    INSTAGRAM_BASIC,
    INSTAGRAM_MANAGE_COMMENTS,
    INSTAGRAM_MANAGE_MESSAGES,
    MODERATE_ROLE,
    PAGES_MANAGE_ADS,
    PAGES_MANAGE_ENGAGEMENT,
    PAGES_MANAGE_METADATA,
    PAGES_MANAGE_POSTS,
    PAGES_MESSAGING,
    PAGES_MESSAGING_SUBSCRIPTIONS,
    PAGES_READ_ENGAGEMENT,
    PAGES_READ_USER_CONTENT,
    PAGES_SHOW_LIST,
    PERMISSIONS_PER_INTEGRATION_META_SETTING,
    READ_PAGE_MAILBOXES,
} from '../../utils'

const allPermissions = [
    PAGES_MANAGE_ADS,
    PAGES_MANAGE_METADATA,
    PAGES_READ_ENGAGEMENT,
    PAGES_READ_USER_CONTENT,
    PAGES_MANAGE_POSTS,
    PAGES_MANAGE_ENGAGEMENT,
    BUSINESS_MANAGEMENT,
    PAGES_SHOW_LIST,
    READ_PAGE_MAILBOXES,
    PAGES_MESSAGING,
    PAGES_MESSAGING_SUBSCRIPTIONS,
    INSTAGRAM_BASIC,
    INSTAGRAM_MANAGE_COMMENTS,
    INSTAGRAM_MANAGE_MESSAGES,
    ADS_READ,
    ADS_MANAGEMENT,
].join(',')

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
        currentPlan: fromJS({
            features: {
                instagram_dm: {enabled: true},
            },
        }),
        currentAccount: fromJS({
            domain: 'acme',
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

    it('should render the integration as enabled with canModerate enabled because it has MODERATE_ROLE', () => {
        const integrations = onboardingIntegrations
            .setIn([0, 'meta', 'instagram', 'id'], 'foo')
            .setIn(
                [0, 'meta', 'roles'],
                [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(',')
            )
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={integrations}
            />
        ).setState({
            selectedIntegrations: fromJS({}).set(
                integrations.getIn([0, 'id']),
                integrations.get(0).setIn(
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

    it('should render the integration with canModerate disabled because there is no MODERATE_ROLE', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations
                    .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                    .setIn(
                        [0, 'meta', 'roles'],
                        [ADVERTISE_ROLE, ANALYZE_ROLE].join(',')
                    )}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render the integration as enabled and save button as enabled because the integration is selected', () => {
        const integrations = onboardingIntegrations
            .setIn(
                [0, 'meta', 'roles'],
                [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(',')
            )
            .setIn(
                [0, 'meta', 'oauth', 'scope'],
                [
                    PAGES_MANAGE_ADS,
                    PAGES_MANAGE_METADATA,
                    PAGES_READ_ENGAGEMENT,
                    PAGES_READ_USER_CONTENT,
                    PAGES_MANAGE_POSTS,
                    PAGES_MANAGE_ENGAGEMENT,
                    BUSINESS_MANAGEMENT,
                    PAGES_SHOW_LIST,
                    READ_PAGE_MAILBOXES,
                    PAGES_MESSAGING,
                    PAGES_MESSAGING_SUBSCRIPTIONS,
                    INSTAGRAM_BASIC,
                    INSTAGRAM_MANAGE_COMMENTS,
                    INSTAGRAM_MANAGE_MESSAGES,
                    ADS_READ,
                    ADS_MANAGEMENT,
                ].join(',')
            )
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={integrations}
            />
        ).setState({
            selectedIntegrations: fromJS({}).set(
                integrations.getIn([0, 'id']),
                integrations.get(0).setIn(
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

        component.update()
        expect(component).toMatchSnapshot()
    })

    it('should render the integration as enabled with Instagram enabled because it has an Instagram id', () => {
        const integrationsWithIG = onboardingIntegrations
            .setIn([0, 'meta', 'instagram', 'id'], 'foo')
            .setIn(
                [0, 'meta', 'roles'],
                [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(',')
            )
            .setIn(
                [0, 'meta', 'oauth', 'scope'],
                [
                    PAGES_MANAGE_ADS,
                    PAGES_MANAGE_METADATA,
                    PAGES_READ_ENGAGEMENT,
                    PAGES_READ_USER_CONTENT,
                    PAGES_MANAGE_POSTS,
                    PAGES_MANAGE_ENGAGEMENT,
                    BUSINESS_MANAGEMENT,
                    PAGES_SHOW_LIST,
                    READ_PAGE_MAILBOXES,
                    PAGES_MESSAGING,
                    PAGES_MESSAGING_SUBSCRIPTIONS,
                    INSTAGRAM_BASIC,
                    INSTAGRAM_MANAGE_COMMENTS,
                    INSTAGRAM_MANAGE_MESSAGES,
                    ADS_READ,
                    ADS_MANAGEMENT,
                ].join(',')
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

    it.each([
        // Messenger enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['messenger_enabled'].join(','),
        // Messenger disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['messenger_enabled']
            .slice(0, -1)
            .join(','),
        // Posts && History enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['posts_enabled'].join(','),
        // Posts && History disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['posts_enabled']
            .slice(0, -1)
            .join(','),
        // Mentions enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled'].join(','),
        // Mentions disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled']
            .slice(0, -1)
            .join(','),
        // Instagram comments enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_comments_enabled'
        ].join(','),
        // Instagram comments disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['instagram_comments_enabled']
            .slice(0, -1)
            .join(','),
        // Instagram mentions enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_mentions_enabled'
        ].join(','),
        // Instagram mentions disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['instagram_mentions_enabled']
            .slice(0, -1)
            .join(','),
        // Instagram ads enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['instagram_ads_enabled'].join(
            ','
        ),
        // Instagram ads disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['instagram_ads_enabled']
            .slice(0, -1)
            .join(','),
        // Instagram direct message enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_direct_message_enabled'
        ].join(','),
        // Instagram direct message disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_direct_message_enabled'
        ]
            .slice(0, -1)
            .join(','),
        // Facebook recommendations enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'recommendations_enabled'
        ].join(','),
        // Facebook recommendations disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING['recommendations_enabled']
            .slice(0, -1)
            .join(','),
        // Instagram DM disabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_direct_message_enabled'
        ]
            .slice(0, -1)
            .join(','),
        // Instagram DM enabled
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            'instagram_direct_message_enabled'
        ].join(','),
    ])(
        'should render the integration with meta settings enabled/disabled based on permissions',
        (permissions) => {
            const integrations = onboardingIntegrations
                .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                .setIn(
                    [0, 'meta', 'roles'],
                    [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(',')
                )
                .setIn([0, 'meta', 'oauth', 'scope'], permissions)
                .setIn(
                    [
                        0,
                        'meta',
                        'instagram',
                        'instagram_direct_message_allowed',
                    ],
                    true
                )
            const component = shallow(
                <FacebookIntegrationSetupContainer
                    {...minProps}
                    integrations={integrations}
                />
            ).setState({
                selectedIntegrations: fromJS({}).set(
                    onboardingIntegrations.getIn([0, 'id']),
                    onboardingIntegrations.get(0).setIn(
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
        }
    )

    it('should render the integration list without showing mentions cause the domain doesnt support it', () => {
        const component = shallow(
            <FacebookIntegrationSetupContainer
                {...minProps}
                currentAccount={fromJS({domain: 'notacme'})}
                integrations={onboardingIntegrations}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it.each([
        [
            'account eligible to IG DM and has the feature (Render an enabled IG DM setting)',
            [true, true],
        ],
        [
            "account eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with an upgrade button)",
            [true, false],
        ],
        [
            'account not eligible to IG DM and has the feature (Render a disabled IG DM setting with a warning)',
            [false, true],
        ],
        [
            "account not eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with a warning)",
            [false, false],
        ],
    ])(
        'should render an integration for: %s',
        (_, [isIGAccountEligible, planHasInstagramDmFeature]) => {
            const integrations = onboardingIntegrations
                .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                .setIn(
                    [0, 'meta', 'roles'],
                    [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(',')
                )
                .setIn([0, 'meta', 'oauth', 'scope'], allPermissions)
                .setIn(
                    [
                        0,
                        'meta',
                        'instagram',
                        'instagram_direct_message_allowed',
                    ],
                    isIGAccountEligible
                )

            const currentAccount = fromJS({
                domain: 'acme',
            })

            const currentPlan = fromJS({
                name: planHasInstagramDmFeature ? 'non-legacy' : 'legacy',
                features: {
                    instagram_dm: {enabled: planHasInstagramDmFeature},
                },
            })

            const component = shallow(
                <FacebookIntegrationSetupContainer
                    {...minProps}
                    integrations={integrations}
                    currentPlan={currentPlan}
                    currentAccount={currentAccount}
                />
            )

            expect(component).toMatchSnapshot()
        }
    )
})
