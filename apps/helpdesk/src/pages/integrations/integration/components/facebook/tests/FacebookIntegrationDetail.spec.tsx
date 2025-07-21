import React, { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { merge } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FACEBOOK_INTEGRATION_TYPE } from 'constants/integration'
import { Language } from 'constants/languages'
import { basicMonthlyHelpdeskPlan } from 'fixtures/productPrices'
import { IntegrationType } from 'models/integration/constants'
import {
    FacebookIntegration,
    FacebookIntegrationSettings,
} from 'models/integration/types'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import { FacebookIntegrationDetail } from '../FacebookIntegrationDetail'
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
    PAGES_READ_ENGAGEMENT,
    PAGES_READ_USER_CONTENT,
    PAGES_SHOW_LIST,
    PERMISSIONS_PER_INTEGRATION_META_SETTING,
} from '../utils'

const minProps: ComponentProps<typeof FacebookIntegrationDetail> = {
    integration: fromJS({}),
    loading: fromJS({
        integration: null,
        updateIntegration: null,
    }),
    currentAccount: fromJS({
        domain: 'acme',
    }),
    currentHelpdeskProduct: basicMonthlyHelpdeskPlan,
    updateOrCreateIntegration: jest.fn(),
    deleteIntegration: jest.fn(),
    hasInstagramDMFeature: true,
}

const defaultFacebookIntegrationSettings: FacebookIntegrationSettings = {
    posts_enabled: false,
    mentions_enabled: false,
    recommendations_enabled: false,
    messenger_enabled: false,
    import_history_enabled: false,
    instagram_comments_enabled: false,
    instagram_direct_message_enabled: false,
    instagram_mentions_enabled: false,
    instagram_ads_enabled: false,
}

const baseInstagramMeta = {
    id: '',
    name: null,
    username: '',
    actor_ids: null,
    followers_count: null,
    instagram_direct_message_allowed: null,
}

const baseIntegrationMeta = {
    oauth: null,
    roles: '',
    can_be_onboarded: true,
    preferences: {},
    page_id: '',
    name: '',
    language: '',
    about: null,
    category: null,
    settings: defaultFacebookIntegrationSettings,
    shopify_integration_ids: [],
    history_sync: null,
    picture: null,
    instagram: baseInstagramMeta,
}

const baseIntegration: FacebookIntegration = {
    id: 1,
    type: IntegrationType.Facebook,
    created_datetime: '',
    deactivated_datetime: null,
    decoration: null,
    deleted_datetime: null,
    description: null,
    locked_datetime: null,
    mappings: null,
    name: '',
    updated_datetime: '',
    uri: '',
    user: {
        id: 0,
    },
    meta: baseIntegrationMeta,
    managed: false,
}

const checkBoxNameEquivalents = {
    messenger_enabled: 'Messenger',
    posts_enabled: 'Posts, comments and ad comments',
    mentions_enabled: 'Mentions',
    instagram_comments_enabled: 'Comments',
    instagram_mentions_enabled: 'Mentions',
    instagram_ads_enabled: 'Ads',
    instagram_direct_message_enabled_alt: 'Direct messages',
    instagram_direct_message_enabled: 'Direct messages icon',
    recommendations_enabled: 'Recommendations',
}

describe('<FacebookIntegrationDetail/>', () => {
    let store: MockStoreEnhanced

    beforeEach(() => {
        jest.resetAllMocks()
        const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
            [thunk],
        )
        store = mockStore({})
        Date.now = jest.fn(() => 42)
    })

    it('should update the integration on form submit', () => {
        const integration = merge(baseIntegration, {
            meta: {
                oauth: {
                    scope: 'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                },
                instagram: {
                    id: '178941234975',
                },
                language: Language.Spanish,
                name: 'My facebook page',
                settings: {
                    posts_enabled: true,
                    mentions_enabled: true,
                    messenger_enabled: true,
                    import_history_enabled: true,
                    instagram_comments_enabled: false,
                },
            },
        })

        render(
            <Provider store={store}>
                <FacebookIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            </Provider>,
        )

        fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
            target: { value: Language.Danish },
        })

        screen.getByRole('button', { name: 'Save changes' }).click()

        expect(minProps.updateOrCreateIntegration).toHaveBeenCalledTimes(1)
        expect(minProps.updateOrCreateIntegration).toHaveBeenCalledWith(
            fromJS(
                merge(integration, {
                    meta: {
                        language: Language.Danish,
                    },
                }),
            ),
        )
    })

    it('should render a loading state because the integration is loading', () => {
        const integration = merge(baseIntegration, {
            id: 1,
            type: FACEBOOK_INTEGRATION_TYPE,
        })

        const { container } = render(
            <Provider store={store}>
                <FacebookIntegrationDetail
                    {...minProps}
                    integration={integration}
                    loading={fromJS({ integration: integration.id })}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render nothing because the passed integration is empty', () => {
        const { container } = render(
            <Provider store={store}>
                <FacebookIntegrationDetail {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render an integration with canModerate enabled', () => {
        const integration = merge(baseIntegration, {
            meta: {
                roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(','),
                oauth: {
                    scope: [
                        PAGES_MANAGE_ADS,
                        PAGES_MANAGE_METADATA,
                        PAGES_READ_ENGAGEMENT,
                        PAGES_READ_USER_CONTENT,
                        PAGES_MANAGE_POSTS,
                        PAGES_MANAGE_ENGAGEMENT,
                        BUSINESS_MANAGEMENT,
                        PAGES_SHOW_LIST,
                        PAGES_MESSAGING,
                        INSTAGRAM_BASIC,
                        INSTAGRAM_MANAGE_COMMENTS,
                        ADS_READ,
                        ADS_MANAGEMENT,
                    ].join(','),
                },
                instagram: {
                    id: '178941234975',
                },
                name: 'My facebook page',
            },
        })

        render(
            <Provider store={store}>
                <FacebookIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            </Provider>,
        )

        expect(
            screen.queryByText(
                /to be able to enable features for this integration you need/,
            ),
        ).toBeNull()
    })

    it('should render an integration with canModerate disabled because there is no MODERATE_ROLE', () => {
        const integration = merge(baseIntegration, {
            meta: {
                roles: [ADVERTISE_ROLE, ANALYZE_ROLE].join(','),
                oauth: {
                    scope: [
                        PAGES_MANAGE_ADS,
                        PAGES_MANAGE_METADATA,
                        PAGES_READ_ENGAGEMENT,
                        PAGES_READ_USER_CONTENT,
                        PAGES_MANAGE_POSTS,
                        PAGES_MANAGE_ENGAGEMENT,
                        BUSINESS_MANAGEMENT,
                        PAGES_SHOW_LIST,
                        PAGES_MESSAGING,
                        INSTAGRAM_BASIC,
                        INSTAGRAM_MANAGE_COMMENTS,
                        ADS_READ,
                        ADS_MANAGEMENT,
                    ].join(','),
                },
                instagram: {
                    id: '178941234975',
                },
                name: 'My facebook page',
            },
        })

        render(
            <Provider store={store}>
                <FacebookIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                /to be able to enable features for this integration you need/,
            ),
        )
    })

    it(
        'should render an integration with instagram disabled because the scope of the integration does not ' +
            'include instagram permissions',
        () => {
            const integration = merge(baseIntegration, {
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: [
                            PAGES_MANAGE_ADS,
                            PAGES_MANAGE_METADATA,
                            PAGES_READ_ENGAGEMENT,
                            PAGES_READ_USER_CONTENT,
                            PAGES_MANAGE_POSTS,
                            PAGES_MANAGE_ENGAGEMENT,
                            BUSINESS_MANAGEMENT,
                            PAGES_SHOW_LIST,
                            PAGES_MESSAGING,
                            ADS_READ,
                            ADS_MANAGEMENT,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    name: 'My facebook page',
                },
            })

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(
                screen
                    .getByRole('checkbox', {
                        name: checkBoxNameEquivalents[
                            'instagram_direct_message_enabled'
                        ],
                    })
                    .getAttribute('disabled'),
            ).not.toBeNull()
        },
    )

    it.each([
        ['messenger_enabled', 0],
        ['posts_enabled', 0],
        ['mentions_enabled', 0],
        ['instagram_comments_enabled', 0],
        ['instagram_mentions_enabled', 1],
        ['instagram_ads_enabled', 0],
        ['recommendations_enabled', 0],
    ])(
        'should render an integration with meta settings enabled based on permissions',
        (permission, position) => {
            const integration = merge(baseIntegration, {
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: PERMISSIONS_PER_INTEGRATION_META_SETTING[
                            permission as keyof typeof PERMISSIONS_PER_INTEGRATION_META_SETTING
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    name: 'My facebook page',
                    settings: {
                        instagram_ads_enabled: true,
                    },
                },
            })

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(
                screen
                    .getAllByRole('checkbox', {
                        name: checkBoxNameEquivalents[
                            permission as keyof typeof checkBoxNameEquivalents
                        ],
                    })
                    [position].getAttribute('disabled'),
            ).toBeNull()
        },
    )

    it.each([
        ['messenger_enabled', 0],
        ['posts_enabled', 0],
        ['mentions_enabled', 0],
        ['instagram_comments_enabled', 0],
        ['instagram_mentions_enabled', 1],
        ['instagram_ads_enabled', 0],
        ['recommendations_enabled', 0],
    ])(
        'should render an integration with meta settings disabled based on permissions',
        (permission, position) => {
            const integration = merge(baseIntegration, {
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: PERMISSIONS_PER_INTEGRATION_META_SETTING[
                            permission as keyof typeof PERMISSIONS_PER_INTEGRATION_META_SETTING
                        ]
                            .slice(0, -1)
                            .join(','),
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    name: 'My facebook page',
                    settings: {
                        instagram_ads_enabled: true,
                    },
                },
            })

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(
                screen
                    .getAllByRole('checkbox', {
                        name: checkBoxNameEquivalents[
                            permission as keyof typeof checkBoxNameEquivalents
                        ],
                    })
                    [position].getAttribute('disabled'),
            ).not.toBeNull()

            expect(screen.getByText(/some features are disabled/))
        },
    )

    it(
        'should render an integration with instagram disabled because the page has no associated instagram' +
            'account',
        () => {
            const integration = merge(baseIntegration, {
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: [
                            PAGES_MANAGE_ADS,
                            PAGES_MANAGE_METADATA,
                            PAGES_READ_ENGAGEMENT,
                            PAGES_READ_USER_CONTENT,
                            PAGES_MANAGE_POSTS,
                            PAGES_MANAGE_ENGAGEMENT,
                            BUSINESS_MANAGEMENT,
                            PAGES_SHOW_LIST,
                            PAGES_MESSAGING,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                            ADS_READ,
                            ADS_MANAGEMENT,
                        ].join(','),
                    },
                    instagram: {
                        id: null,
                    },
                    name: 'My facebook page',
                },
            })

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(screen.getByText(/You cannot activate Instagram/))
        },
    )

    it('should render an integration with instagram ads enabled', () => {
        const integration = merge(baseIntegration, {
            meta: {
                roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(','),
                oauth: {
                    scope: [
                        PAGES_MANAGE_ADS,
                        PAGES_MANAGE_METADATA,
                        PAGES_READ_ENGAGEMENT,
                        PAGES_READ_USER_CONTENT,
                        PAGES_MANAGE_POSTS,
                        PAGES_MANAGE_ENGAGEMENT,
                        BUSINESS_MANAGEMENT,
                        PAGES_SHOW_LIST,
                        PAGES_MESSAGING,
                        INSTAGRAM_BASIC,
                        INSTAGRAM_MANAGE_COMMENTS,
                        ADS_READ,
                        ADS_MANAGEMENT,
                    ].join(','),
                },
                instagram: {
                    id: '178941234975',
                },
                name: 'My facebook page',
                settings: {
                    instagram_ads_enabled: true,
                },
            },
        })

        render(
            <Provider store={store}>
                <FacebookIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            </Provider>,
        )

        expect(
            screen.getByRole('checkbox', {
                name: checkBoxNameEquivalents.instagram_ads_enabled,
            }),
        ).toBeChecked()
    })

    it(
        'should render an integration with instagram enabled and loading buttons because the integration ' +
            'is being submitted',
        () => {
            const integration = merge(baseIntegration, {
                meta: {
                    name: 'My facebook page',
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: [
                            PAGES_MANAGE_ADS,
                            PAGES_MANAGE_METADATA,
                            PAGES_READ_ENGAGEMENT,
                            PAGES_READ_USER_CONTENT,
                            PAGES_MANAGE_POSTS,
                            PAGES_MANAGE_ENGAGEMENT,
                            BUSINESS_MANAGEMENT,
                            PAGES_SHOW_LIST,
                            PAGES_MESSAGING,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                    },
                },
            })

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        loading={fromJS({
                            updateIntegration: integration.id,
                        })}
                        integration={integration}
                    />
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: 'Save changes' }),
            ).toBeAriaDisabled()
        },
    )

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
            "account not eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with an upgrade button)",
            [false, false],
        ],
    ])(
        'should render an integration for: %s',
        async (_, [isIGAccountEligible, priceHasInstagramDmFeature]) => {
            const integration = merge(baseIntegration, {
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ',',
                    ),
                    oauth: {
                        scope: [
                            PAGES_MANAGE_ADS,
                            PAGES_MANAGE_METADATA,
                            PAGES_READ_ENGAGEMENT,
                            PAGES_READ_USER_CONTENT,
                            PAGES_MANAGE_POSTS,
                            PAGES_MANAGE_ENGAGEMENT,
                            BUSINESS_MANAGEMENT,
                            PAGES_SHOW_LIST,
                            PAGES_MESSAGING,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                            INSTAGRAM_MANAGE_MESSAGES,
                            ADS_READ,
                            ADS_MANAGEMENT,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                        instagram_direct_message_allowed: isIGAccountEligible,
                    },
                    name: 'My facebook page',
                },
            })

            const currentAccount: Map<any, any> = fromJS({
                domain: 'acme',
            })

            const currentHelpdeskProduct = {
                ...basicMonthlyHelpdeskPlan,
                features: {
                    ...basicMonthlyHelpdeskPlan.features,
                    [AccountFeature.InstagramDirectMessage]: {
                        enabled: priceHasInstagramDmFeature,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                        currentAccount={currentAccount}
                        currentHelpdeskProduct={currentHelpdeskProduct}
                        hasInstagramDMFeature={priceHasInstagramDmFeature}
                    />
                </Provider>,
            )

            if (isIGAccountEligible && priceHasInstagramDmFeature) {
                await waitFor(() =>
                    expect(
                        screen
                            .getByRole('checkbox', {
                                name: checkBoxNameEquivalents.instagram_direct_message_enabled_alt,
                            })
                            .getAttribute('disabled'),
                    ).toBeNull(),
                )
            } else if (!isIGAccountEligible && priceHasInstagramDmFeature) {
                expect(
                    screen
                        .getByRole('checkbox', {
                            name: checkBoxNameEquivalents.instagram_direct_message_enabled,
                        })
                        .getAttribute('disabled'),
                ).not.toBeNull()
            } else {
                expect(
                    screen
                        .getByRole('checkbox', {
                            name: checkBoxNameEquivalents.instagram_direct_message_enabled_alt,
                        })
                        .getAttribute('disabled'),
                ).not.toBeNull()
            }
        },
    )
})
