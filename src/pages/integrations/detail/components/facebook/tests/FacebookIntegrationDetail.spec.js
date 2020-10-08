import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {FACEBOOK_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/facebook.ts'
import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../constants/integration.ts'
import {
    DANISH_LANGUAGE,
    SPANISH_LANGUAGE,
} from '../../../../../../constants/languages.ts'
import FacebookIntegrationDetail from '../FacebookIntegrationDetail'

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
    messenger_enabled: true,
    import_history_enabled: true,
    instagram_comments_enabled: false,
    instagram_ads_enabled: false,
}

describe('<FacebookIntegrationDetail/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('componentWillMount()', () => {
        it('should not set anything in the state because no integration was passed', () => {
            const component = shallow(
                <FacebookIntegrationDetail
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
            }

            const component = shallow(
                <FacebookIntegrationDetail
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
            }

            const component = shallow(
                <FacebookIntegrationDetail
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
                        posts_enabled: true,
                        messenger_enabled: true,
                        import_history_enabled: true,
                        instagram_comments_enabled: false,
                        instagram_ads_enabled: false,
                    },
                },
            })

            const newIntegration = oldIntegration
                .setIn(
                    ['meta', 'settings'],
                    fromJS({
                        posts_enabled: false,
                        messenger_enabled: true,
                        import_history_enabled: false,
                        instagram_comments_enabled: true,
                        instagram_ads_enabled: true,
                    })
                )
                .setIn(['meta', 'language'], DANISH_LANGUAGE)

            const component = shallow(
                <FacebookIntegrationDetail
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
                        posts_enabled: postsEnabled,
                        messenger_enabled: true,
                        import_history_enabled: true,
                        instagram_comments_enabled: false,
                        instagram_ads_enabled: false,
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
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
                    {...defaultProps}
                    integration={fromJS({})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it(
            'should render an integration with instagram disabled because the scope of the integration does not ' +
                'include instagram permissions',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: FACEBOOK_INTEGRATION_TYPE,
                    name: 'My facebook page',
                    meta: {
                        oauth: {
                            scope: 'business_management,manage_pages',
                        },
                        instagram: {
                            id: '178941234975',
                        },
                        name: 'My facebook page',
                    },
                })

                const component = shallow(
                    <FacebookIntegrationDetail
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
                        oauth: {
                            scope:
                                'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                        },
                        instagram: {
                            id: null,
                        },
                        name: 'My facebook page',
                    },
                })

                const component = shallow(
                    <FacebookIntegrationDetail
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
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                    },
                    instagram: {
                        id: '178941234975',
                    },
                    name: 'My facebook page',
                },
            })

            const component = shallow(
                <FacebookIntegrationDetail
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
                    oauth: {
                        scope:
                            'business_management,manage_pages,instagram_basic,instagram_manage_comments,ads_read,' +
                            'ads_management',
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
                        oauth: {
                            scope:
                                'business_management,manage_pages,instagram_basic,instagram_manage_comments',
                        },
                        instagram: {
                            id: '178941234975',
                        },
                    },
                })

                const component = shallow(
                    <FacebookIntegrationDetail
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
    })
})
