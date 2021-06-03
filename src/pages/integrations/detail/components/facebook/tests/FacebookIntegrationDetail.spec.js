import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import thunk from 'redux-thunk'

import configureMockStore from 'redux-mock-store'

import {FACEBOOK_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/facebook.ts'
import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../constants/integration.ts'
import {
    DANISH_LANGUAGE,
    SPANISH_LANGUAGE,
} from '../../../../../../constants/languages.ts'
import {FacebookIntegrationDetail} from '../FacebookIntegrationDetail'
import {
    ADS_MANAGEMENT,
    ADS_READ,
    ADVERTISE_ROLE,
    ANALYZE_ROLE,
    BUSINESS_MANAGEMENT,
    FACEBOOK_USER_TYPES,
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
} from '../utils'

const defaultProps = {
    actions: {
        updateOrCreateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
    },
    loading: fromJS({
        integration: null,
        updateIntegration: null,
    }),
}

const defaultFacebookIntegrationSettings = {
    posts_enabled: true,
    recommendations_enabled: true,
    messenger_enabled: true,
    import_history_enabled: true,
    instagram_comments_enabled: false,
    instagram_direct_message_enabled: false,
    instagram_mentions_enabled: false,
    instagram_ads_enabled: false,
}

describe('<FacebookIntegrationDetail/>', () => {
    let store

    beforeEach(() => {
        jest.resetAllMocks()
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)
        store = mockStore({})
    })

    describe('componentWillMount()', () => {
        it('should not set anything in the state because no integration was passed', () => {
            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={fromJS({})}
                />
            )

            expect(component.state('settings')).toEqual(
                defaultFacebookIntegrationSettings
            )
            expect(component.state('language')).toEqual(
                FACEBOOK_LANGUAGE_DEFAULT
            )
        })

        it('should only set settings in the state because there is no language in the integration', () => {
            const newSettings = {
                posts_enabled: false,
                messenger_enabled: true,
                import_history_enabled: false,
                instagram_comments_enabled: true,
                instagram_ads_enabled: false,
                instagram_direct_message_enabled: false,
                instagram_mentions_enabled: undefined,
            }

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={fromJS({
                        meta: {
                            settings: newSettings,
                        },
                    })}
                />
            )

            expect(component.state('settings')).toEqual(newSettings)
            expect(component.state('language')).toEqual(
                FACEBOOK_LANGUAGE_DEFAULT
            )
        })

        it('should only set language in the state because there is no settings in the integration', () => {
            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={fromJS({
                        meta: {
                            language: SPANISH_LANGUAGE,
                        },
                    })}
                />
            )

            expect(component.state('settings')).toEqual(
                defaultFacebookIntegrationSettings
            )
            expect(component.state('language')).toEqual(SPANISH_LANGUAGE)
        })

        it('should set both language and settings in the integration', () => {
            const newSettings = {
                posts_enabled: false,
                messenger_enabled: true,
                import_history_enabled: false,
                instagram_comments_enabled: true,
                instagram_ads_enabled: false,
                instagram_direct_message_enabled: false,
                instagram_mentions_enabled: undefined,
                recommendations_enabled: undefined,
            }

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={fromJS({
                        meta: {
                            language: SPANISH_LANGUAGE,
                            settings: newSettings,
                        },
                    })}
                />
            )

            expect(component.state('settings')).toEqual(newSettings)
            expect(component.state('language')).toEqual(SPANISH_LANGUAGE)
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not update the state because the new integration passed is empty', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
                    name: 'My facebook page',
                    settings: {
                        posts_enabled: true,
                        messenger_enabled: true,
                        import_history_enabled: true,
                        instagram_comments_enabled: false,
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            const prevState = component.state()

            component.instance().componentWillReceiveProps({
                ...defaultProps,
                integration: fromJS({}),
            })

            expect(component.state()).toEqual(prevState)
        })

        it('should update the state with the settings of the new integration object passed', () => {
            const oldIntegration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
                    name: 'My facebook page',
                    settings: {
                        import_history_enabled: true,
                        instagram_ads_enabled: false,
                        instagram_comments_enabled: false,
                        instagram_direct_message_enabled: false,
                        instagram_mentions_enabled: undefined,
                        messenger_enabled: true,
                        posts_enabled: true,
                        recommendations_enabled: undefined,
                    },
                },
            })

            const newIntegration = oldIntegration
                .setIn(
                    ['meta', 'settings'],
                    fromJS({
                        import_history_enabled: false,
                        instagram_ads_enabled: true,
                        instagram_comments_enabled: true,
                        instagram_direct_message_enabled: false,
                        instagram_mentions_enabled: undefined,
                        messenger_enabled: true,
                        posts_enabled: false,
                        recommendations_enabled: undefined,
                    })
                )
                .setIn(['meta', 'language'], DANISH_LANGUAGE)

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={oldIntegration}
                />
            )

            const prevState = component.state()

            expect(prevState.settings).toEqual(
                oldIntegration.getIn(['meta', 'settings']).toJS()
            )
            expect(prevState.language).toEqual(
                oldIntegration.getIn(['meta', 'language'])
            )

            component.instance().componentWillReceiveProps({
                ...defaultProps,
                integration: newIntegration,
            })

            const expectedState = fromJS(prevState)
                .set('settings', newIntegration.getIn(['meta', 'settings']))
                .set('language', newIntegration.getIn(['meta', 'language']))
                .toJS()

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_onSettingChange()', () => {
        it('should update the `posts_enabled` setting in the state because its checkbox was toggled', () => {
            const postsEnabled = true
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
                    name: 'My facebook page',
                    settings: {
                        import_history_enabled: true,
                        instagram_ads_enabled: false,
                        instagram_comments_enabled: false,
                        instagram_direct_message_enabled: false,
                        instagram_mentions_enabled: undefined,
                        messenger_enabled: true,
                        posts_enabled: postsEnabled,
                        recommendations_enabled: undefined,
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            const prevState = component.state()

            expect(prevState.settings).toEqual(
                integration.getIn(['meta', 'settings']).toJS()
            )

            component
                .instance()
                ._onSettingChange(!postsEnabled, 'posts_enabled')

            const expectedState = fromJS(prevState)
                .setIn(['settings', 'posts_enabled'], !postsEnabled)
                .toJS()

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_handleSubmit', () => {
        it('should update the integration on form submit', () => {
            const newSettings = {
                posts_enabled: true,
                messenger_enabled: false,
                import_history_enabled: true,
                instagram_comments_enabled: true,
            }

            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
                    name: 'My facebook page',
                    settings: {
                        posts_enabled: true,
                        messenger_enabled: true,
                        import_history_enabled: true,
                        instagram_comments_enabled: false,
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            component.setState({
                settings: newSettings,
                language: DANISH_LANGUAGE,
            })

            component.instance()._handleSubmit({preventDefault: jest.fn()})

            expect(
                defaultProps.actions.updateOrCreateIntegration
            ).toHaveBeenCalledTimes(1)
            expect(
                defaultProps.actions.updateOrCreateIntegration
            ).toHaveBeenCalledWith(
                integration.mergeDeep({
                    meta: {language: DANISH_LANGUAGE, settings: newSettings},
                })
            )
        })
    })

    describe('render()', () => {
        it('should render a loading state because the integration is loading', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                    loading={fromJS({integration: integration.get('id')})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a loading state because the passed integration is empty', () => {
            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={fromJS({})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it.each([
            ...FACEBOOK_USER_TYPES,
            {
                name: 'Custom/Unknown',
                roles: [ADVERTISE_ROLE],
            },
        ])(
            'should render an integration with facebookUserTypes',
            (facebookUserType) => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        roles: facebookUserType.roles.join(','),
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
                                READ_PAGE_MAILBOXES,
                                PAGES_MESSAGING,
                                PAGES_MESSAGING_SUBSCRIPTIONS,
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

                const component = shallow(
                    <FacebookIntegrationDetail
                        store={store}
                        {...defaultProps}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render an integration with canModerate enabled', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ','
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
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

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an integration with canModerate disabled because there is no MODERATE_ROLE', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
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

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it.each([
            // Messenger enabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING['messenger_enabled'].join(
                ','
            ),
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
            // Instagram comments enabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_comments_enabled'
            ].join(','),
            // Instagram comments disabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_comments_enabled'
            ]
                .slice(0, -1)
                .join(','),
            // Instagram mentions enabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_mentions_enabled'
            ].join(','),
            // Instagram mentions disabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_mentions_enabled'
            ]
                .slice(0, -1)
                .join(','),
            // Instagram ads enabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_ads_enabled'
            ].join(','),
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
        ])(
            'should render an integration with meta settings enabled/disabled based on permissions',
            (permissions) => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        roles: [
                            ADVERTISE_ROLE,
                            ANALYZE_ROLE,
                            MODERATE_ROLE,
                        ].join(','),
                        oauth: {
                            scope: permissions,
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

                const component = shallow(
                    <FacebookIntegrationDetail
                        store={store}
                        {...defaultProps}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render an integration with instagram disabled because the scope of the integration does not ' +
                'include instagram permissions',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        roles: [
                            ADVERTISE_ROLE,
                            ANALYZE_ROLE,
                            MODERATE_ROLE,
                        ].join(','),
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
                                READ_PAGE_MAILBOXES,
                                PAGES_MESSAGING,
                                PAGES_MESSAGING_SUBSCRIPTIONS,
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

                const component = shallow(
                    <FacebookIntegrationDetail
                        store={store}
                        {...defaultProps}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render an integration with instagram disabled because the page has no associated instagram' +
                'account',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        roles: [
                            ADVERTISE_ROLE,
                            ANALYZE_ROLE,
                            MODERATE_ROLE,
                        ].join(','),
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
                                READ_PAGE_MAILBOXES,
                                PAGES_MESSAGING,
                                PAGES_MESSAGING_SUBSCRIPTIONS,
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

                const component = shallow(
                    <FacebookIntegrationDetail
                        store={store}
                        {...defaultProps}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render an integration with instagram enabled', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ','
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    name: 'My facebook page',
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an integration with instagram ads enabled', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ','
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
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

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it(
            'should render an integration with instagram enabled and loading buttons because the integration ' +
                'is being submitted',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        name: 'My facebook page',
                        roles: [
                            ADVERTISE_ROLE,
                            ANALYZE_ROLE,
                            MODERATE_ROLE,
                        ].join(','),
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
                                READ_PAGE_MAILBOXES,
                                PAGES_MESSAGING,
                                PAGES_MESSAGING_SUBSCRIPTIONS,
                                INSTAGRAM_BASIC,
                                INSTAGRAM_MANAGE_COMMENTS,
                            ].join(','),
                        },
                        instagram: {
                            id: '178941234975',
                        },
                    },
                })

                const component = shallow(
                    <FacebookIntegrationDetail
                        store={store}
                        {...defaultProps}
                        loading={fromJS({
                            updateIntegration: integration.get('id'),
                        })}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it.each([true, false])(
            'should render an integration with a warning next to a disabled IG DM setting because the IG account is not eligible yet',
            (hasLegacyPlan) => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        roles: [
                            ADVERTISE_ROLE,
                            ANALYZE_ROLE,
                            MODERATE_ROLE,
                        ].join(','),
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
                                READ_PAGE_MAILBOXES,
                                PAGES_MESSAGING,
                                PAGES_MESSAGING_SUBSCRIPTIONS,
                                INSTAGRAM_BASIC,
                                INSTAGRAM_MANAGE_COMMENTS,
                                INSTAGRAM_MANAGE_MESSAGES,
                                ADS_READ,
                                ADS_MANAGEMENT,
                            ].join(','),
                        },
                        instagram: {
                            id: '178941234975',
                            instagram_direct_message_allowed: false,
                        },
                        name: 'My facebook page',
                    },
                })

                const component = shallow(
                    <FacebookIntegrationDetail
                        accountHasLegacyPlan={hasLegacyPlan}
                        store={store}
                        {...defaultProps}
                        integration={integration}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render an integration with an enabled IG DM setting', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ','
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                            INSTAGRAM_MANAGE_MESSAGES,
                            ADS_READ,
                            ADS_MANAGEMENT,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                        instagram_direct_message_allowed: true,
                    },
                    name: 'My facebook page',
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    store={store}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an integration with an enabled IG DM setting and an upgrade button because the account has a legacy plan', () => {
            const integration = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    roles: [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(
                        ','
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
                            READ_PAGE_MAILBOXES,
                            PAGES_MESSAGING,
                            PAGES_MESSAGING_SUBSCRIPTIONS,
                            INSTAGRAM_BASIC,
                            INSTAGRAM_MANAGE_COMMENTS,
                            INSTAGRAM_MANAGE_MESSAGES,
                            ADS_READ,
                            ADS_MANAGEMENT,
                        ].join(','),
                    },
                    instagram: {
                        id: '178941234975',
                        instagram_direct_message_allowed: true,
                    },
                    name: 'My facebook page',
                },
            })

            const currentAccount = fromJS({
                domain: 'acme',
            })

            const currentPlan = fromJS({
                name: 'legacy',
            })

            const component = shallow(
                <FacebookIntegrationDetail
                    currentAccount={currentAccount}
                    currentPlan={currentPlan}
                    accountHasLegacyPlan={true}
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
