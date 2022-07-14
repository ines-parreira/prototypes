import React, {ComponentProps, SyntheticEvent} from 'react'
import {fromJS, Map} from 'immutable'
import {shallow, mount} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'

import {FACEBOOK_LANGUAGE_DEFAULT} from 'config/integrations/facebook'
import {FACEBOOK_INTEGRATION_TYPE} from 'constants/integration'
import {DANISH_LANGUAGE, SPANISH_LANGUAGE} from 'constants/languages'
import {FacebookIntegrationSettings} from 'models/integration/types'

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

type FacebookIntegrationDetailState = {
    settings: FacebookIntegrationSettings
    language: string
    askDisableConfirmation: boolean
}
const minProps: ComponentProps<typeof FacebookIntegrationDetail> = {
    integration: fromJS({}),
    loading: fromJS({
        integration: null,
        updateIntegration: null,
    }),
    currentAccount: fromJS({
        domain: 'acme',
    }),
    currentPlan: fromJS({
        features: {
            instagram_dm: {enabled: true},
        },
    }),
    updateOrCreateIntegration: jest.fn(),
    deleteIntegration: jest.fn(),
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

describe('<FacebookIntegrationDetail/>', () => {
    let store: MockStoreEnhanced

    beforeEach(() => {
        jest.resetAllMocks()
        const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
            [thunk]
        )
        store = mockStore({})
    })

    describe('componentWillMount()', () => {
        it('should not set anything in the state because no integration was passed', () => {
            const component = shallow(
                <Provider store={store}>
                    <FacebookIntegrationDetail {...minProps} />
                </Provider>
            )
            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('settings')
            ).toEqual(defaultFacebookIntegrationSettings)
            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('language')
            ).toEqual(FACEBOOK_LANGUAGE_DEFAULT)
        })

        it('should only set settings in the state because there is no language in the integration', () => {
            const newSettings: Partial<FacebookIntegrationSettings> = {
                posts_enabled: false,
                mentions_enabled: false,
                messenger_enabled: true,
                import_history_enabled: false,
                instagram_comments_enabled: true,
                instagram_ads_enabled: false,
                instagram_direct_message_enabled: false,
                instagram_mentions_enabled: undefined,
            }

            const component = shallow(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                settings: newSettings,
                            },
                        })}
                    />
                </Provider>
            )

            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('settings')
            ).toEqual(newSettings)
            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('language')
            ).toEqual(FACEBOOK_LANGUAGE_DEFAULT)
        })

        it('should only set language in the state because there is no settings in the integration', () => {
            const component = shallow(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                language: SPANISH_LANGUAGE,
                            },
                        })}
                    />
                </Provider>
            )

            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('settings')
            ).toEqual(defaultFacebookIntegrationSettings)
            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('language')
            ).toEqual(SPANISH_LANGUAGE)
        })

        it('should set both language and settings in the integration', () => {
            const newSettings: Partial<FacebookIntegrationSettings> = {
                posts_enabled: false,
                mentions_enabled: false,
                messenger_enabled: true,
                import_history_enabled: false,
                instagram_comments_enabled: true,
                instagram_ads_enabled: false,
                instagram_direct_message_enabled: false,
                instagram_mentions_enabled: undefined,
                recommendations_enabled: undefined,
            }

            const component = shallow(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                language: SPANISH_LANGUAGE,
                                settings: newSettings,
                            },
                        })}
                    />
                </Provider>
            )

            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('settings')
            ).toEqual(newSettings)
            expect(
                component
                    .find(FacebookIntegrationDetail)
                    .dive()
                    .state('language')
            ).toEqual(SPANISH_LANGUAGE)
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not update the state because the new integration passed is empty', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope: 'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
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

            const component = shallow<FacebookIntegrationDetail>(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )
            const prevState = component
                .find(FacebookIntegrationDetail)
                .dive()
                .state()

            const instance = component
                .find(FacebookIntegrationDetail)
                .dive()
                .instance() as FacebookIntegrationDetail

            instance.componentWillReceiveProps({
                ...minProps,
                integration: fromJS({}),
            })

            expect(instance.state).toEqual(prevState)
        })

        it('should update the state with the settings of the new integration object passed', () => {
            const oldIntegration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope: 'business_management,manage_pages,instagram_basic,instagram_manage_comments',
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
                        mentions_enabled: true,
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
                        mentions_enabled: false,
                        recommendations_enabled: undefined,
                    })
                )
                .setIn(['meta', 'language'], DANISH_LANGUAGE)

            const component = shallow<FacebookIntegrationDetail>(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={oldIntegration}
                    />
                </Provider>
            )

            const prevState = component
                .find(FacebookIntegrationDetail)
                .dive()
                .state() as FacebookIntegrationDetailState

            expect(prevState.settings).toEqual(
                (
                    oldIntegration.getIn(['meta', 'settings']) as Map<any, any>
                ).toJS()
            )
            expect(prevState.language).toEqual(
                oldIntegration.getIn(['meta', 'language'])
            )

            const instance = component
                .find(FacebookIntegrationDetail)
                .dive()
                .instance() as FacebookIntegrationDetail

            instance.componentWillReceiveProps({
                ...minProps,
                integration: newIntegration,
            })

            const expectedState = (fromJS(prevState) as Map<any, any>)
                .set('settings', newIntegration.getIn(['meta', 'settings']))
                .set('language', newIntegration.getIn(['meta', 'language']))
                .toJS() as FacebookIntegrationDetailState

            expect(instance.state).toEqual(expectedState)
        })
    })

    describe('_onSettingChange()', () => {
        it('should update the `posts_enabled` setting in the state because its checkbox was toggled', () => {
            const postsEnabled = true
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope: 'business_management,manage_pages,instagram_basic,instagram_manage_comments',
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
                        mentions_enabled: true,
                        recommendations_enabled: undefined,
                    },
                },
            })

            const component = shallow<FacebookIntegrationDetail>(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )

            const prevState = component
                .find(FacebookIntegrationDetail)
                .dive()
                .state() as FacebookIntegrationDetailState

            expect(prevState.settings).toEqual(
                (
                    integration.getIn(['meta', 'settings']) as Map<any, any>
                ).toJS()
            )
            const instance = component
                .find(FacebookIntegrationDetail)
                .dive()
                .instance() as FacebookIntegrationDetail

            instance._onSettingChange(!postsEnabled, 'posts_enabled')

            const expectedState = (fromJS(prevState) as Map<any, any>)
                .setIn(['settings', 'posts_enabled'], !postsEnabled)
                .toJS() as FacebookIntegrationDetailState

            expect(instance.state).toEqual(expectedState)
        })
    })

    describe('_handleSubmit', () => {
        it('should update the integration on form submit', () => {
            const newSettings: FacebookIntegrationDetailState['settings'] = {
                posts_enabled: true,
                mentions_enabled: false,
                recommendations_enabled: false,
                messenger_enabled: false,
                import_history_enabled: true,
                instagram_comments_enabled: true,
                instagram_mentions_enabled: false,
                instagram_ads_enabled: false,
                instagram_direct_message_enabled: false,
            }

            const integration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                name: 'My facebook page',
                meta: {
                    oauth: {
                        scope: 'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    language: SPANISH_LANGUAGE,
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

            const component = shallow<FacebookIntegrationDetail>(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )
            const instance: FacebookIntegrationDetail = component
                .find(FacebookIntegrationDetail)
                .dive()
                .instance() as FacebookIntegrationDetail

            instance.setState({
                settings: newSettings,
                language: DANISH_LANGUAGE,
            })

            instance._handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as SyntheticEvent)

            expect(minProps.updateOrCreateIntegration).toHaveBeenCalledTimes(1)
            expect(minProps.updateOrCreateIntegration).toHaveBeenCalledWith(
                integration.mergeDeep({
                    meta: {language: DANISH_LANGUAGE, settings: newSettings},
                })
            )
        })
    })

    describe('render()', () => {
        it('should render a loading state because the integration is loading', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
            })

            const component = mount(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                        loading={fromJS({integration: integration.get('id')})}
                    />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a loading state because the passed integration is empty', () => {
            const component = mount(
                <Provider store={store}>
                    <FacebookIntegrationDetail {...minProps} />
                </Provider>
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
                const integration: Map<any, any> = fromJS({
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
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )

        it('should render an integration with canModerate enabled', () => {
            const integration: Map<any, any> = fromJS({
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
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )

            expect(
                component.find(FacebookIntegrationDetail).dive()
            ).toMatchSnapshot()
        })

        it('should render an integration with canModerate disabled because there is no MODERATE_ROLE', () => {
            const integration: Map<any, any> = fromJS({
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
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )

            expect(
                component.find(FacebookIntegrationDetail).dive()
            ).toMatchSnapshot()
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
            // Mentions enabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled'].join(
                ','
            ),
            // Mentions disabled
            PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled']
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
                const integration: Map<any, any> = fromJS({
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
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )

        it(
            'should render an integration with instagram disabled because the scope of the integration does not ' +
                'include instagram permissions',
            () => {
                const integration: Map<any, any> = fromJS({
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
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )

        it(
            'should render an integration with instagram disabled because the page has no associated instagram' +
                'account',
            () => {
                const integration: Map<any, any> = fromJS({
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
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )

        it('should render an integration with instagram enabled', () => {
            const integration: Map<any, any> = fromJS({
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
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )

            expect(
                component.find(FacebookIntegrationDetail).dive()
            ).toMatchSnapshot()
        })

        it('should render an integration with instagram ads enabled', () => {
            const integration: Map<any, any> = fromJS({
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
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        integration={integration}
                    />
                </Provider>
            )

            expect(
                component.find(FacebookIntegrationDetail).dive()
            ).toMatchSnapshot()
        })

        it(
            'should render an integration with instagram enabled and loading buttons because the integration ' +
                'is being submitted',
            () => {
                const integration: Map<any, any> = fromJS({
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
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            loading={fromJS({
                                updateIntegration: integration.get('id'),
                            })}
                            integration={integration}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )

        it('should render an integration without showing mentions cause the domain doesnt support it', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
            })
            const component = shallow(
                <Provider store={store}>
                    <FacebookIntegrationDetail
                        {...minProps}
                        loading={fromJS({
                            updateIntegration: integration.get('id'),
                        })}
                        integration={integration}
                        currentAccount={fromJS({domain: 'notacme'})}
                    />
                </Provider>
            )

            expect(
                component.find(FacebookIntegrationDetail).dive()
            ).toMatchSnapshot()
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
                "account not eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with an upgrade button)",
                [false, false],
            ],
        ])(
            'should render an integration for: %s',
            (_, [isIGAccountEligible, planHasInstagramDmFeature]) => {
                const integration: Map<any, any> = fromJS({
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
                            instagram_direct_message_allowed:
                                isIGAccountEligible,
                        },
                        name: 'My facebook page',
                    },
                })

                const currentAccount: Map<any, any> = fromJS({
                    domain: 'acme',
                })

                const currentPlan: Map<any, any> = fromJS({
                    name: planHasInstagramDmFeature ? 'non-legacy' : 'legacy',
                    features: {
                        instagram_dm: {enabled: planHasInstagramDmFeature},
                    },
                })

                const component = shallow<FacebookIntegrationDetail>(
                    <Provider store={store}>
                        <FacebookIntegrationDetail
                            {...minProps}
                            integration={integration}
                            currentAccount={currentAccount}
                            currentPlan={currentPlan}
                        />
                    </Provider>
                )

                expect(
                    component.find(FacebookIntegrationDetail).dive()
                ).toMatchSnapshot()
            }
        )
    })
})
