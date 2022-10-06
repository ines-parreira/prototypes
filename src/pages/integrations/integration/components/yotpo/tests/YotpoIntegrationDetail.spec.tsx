import React, {ComponentProps, MouseEvent} from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'
import {History, Location} from 'history'
import {match} from 'react-router-dom'

import {
    PENDING_AUTHENTICATION_STATUS,
    SUCCESS_AUTHENTICATION_STATUS,
    YOTPO_INTEGRATION_TYPE,
} from 'constants/integration'

import {YotpoIntegrationDetailComponent} from '../YotpoIntegrationDetail'

type Integration = ComponentProps<
    typeof YotpoIntegrationDetailComponent
>['integration']

const minProps: ComponentProps<typeof YotpoIntegrationDetailComponent> = {
    integration: fromJS({}),
    loading: fromJS({
        integration: null,
        updateIntegration: null,
    }),
    actions: {
        deleteIntegration: jest.fn(),
        fetchIntegration: jest.fn(),
        triggerCreateSuccess: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    },
    redirectUri: '',
    location: {} as Location,
    history: {} as History,
    match: {} as match,
}

describe('<YotpoIntegrationDetailComponent/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('componentDidMount()', () => {
        it("should set the integration's name in the state", () => {
            const integration: Integration = fromJS({
                id: 1,
                meta: {
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                    sync_state: {is_initialized: false},
                    enable_yotpo_tickets: true,
                },
                name: 'test',
            })

            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={integration}
                />
            )

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not do anything because there is no integration', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent {...minProps} />
            )

            expect(component.state()).toMatchSnapshot()
            expect(minProps.actions.fetchIntegration).not.toHaveBeenCalled()
            expect(minProps.actions.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it(
            'should set the name of the integration in the state because there was no integration before and there is ' +
                'one now',
            () => {
                const integration: Integration = fromJS({
                    name: 'test',
                    id: 1,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                        enable_yotpo_tickets: true,
                    },
                })

                const component = shallow<YotpoIntegrationDetailComponent>(
                    <YotpoIntegrationDetailComponent
                        {...minProps}
                        integration={integration}
                    />
                )

                component.instance().componentWillReceiveProps({
                    ...minProps,
                    integration,
                })

                expect(component.state()).toMatchSnapshot()
                expect(minProps.actions.fetchIntegration).not.toHaveBeenCalled()
                expect(
                    minProps.actions.triggerCreateSuccess
                ).not.toHaveBeenCalled()
            }
        )
        it('should not do anything because the previous integration was not empty', () => {
            const integration: Integration = fromJS({
                id: 1,
                meta: {
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                    sync_state: {is_initialized: false},
                    enable_yotpo_tickets: true,
                },
                name: 'foo',
            })

            const component = shallow<YotpoIntegrationDetailComponent>(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={integration}
                />
            )

            component.instance().componentWillReceiveProps({
                ...minProps,
                integration: integration.set('name', 'bar'),
            })

            expect(component.state()).toMatchSnapshot()
            expect(minProps.actions.fetchIntegration).not.toHaveBeenCalled()
            expect(minProps.actions.triggerCreateSuccess).not.toHaveBeenCalled()
        })
        it(
            'should set the name of the integration the state and set a timeout to fetch the integration because ' +
                'the action in the URL is set to `authentication` and the integration is not yet authenticated',
            () => {
                jest.useFakeTimers()

                const integration: Integration = fromJS({
                    id: 1,
                    type: YOTPO_INTEGRATION_TYPE,
                    meta: {
                        oauth: {status: PENDING_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                        enable_yotpo_tickets: true,
                    },
                    name: 'foo',
                })

                const component = shallow<YotpoIntegrationDetailComponent>(
                    <YotpoIntegrationDetailComponent {...minProps} />
                )

                component.instance().componentWillReceiveProps({
                    ...minProps,
                    integration,
                    location: {
                        ...minProps.location,
                        search: '?action=authentication',
                    },
                })

                expect(component.state()).toMatchSnapshot()

                jest.runAllTimers()
                expect(minProps.actions.fetchIntegration).toHaveBeenCalledWith(
                    integration.get('id'),
                    integration.get('type'),
                    true
                )

                expect(
                    minProps.actions.triggerCreateSuccess
                ).not.toHaveBeenCalled()
            }
        )

        it(
            'should set the name of the integration the state and trigger a success notification because the action ' +
                'in the URL is set to `authentication` and the integration is already authenticated',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    type: YOTPO_INTEGRATION_TYPE,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                        enable_yotpo_tickets: true,
                    },
                    name: 'foo',
                })

                const component = shallow<YotpoIntegrationDetailComponent>(
                    <YotpoIntegrationDetailComponent {...minProps} />
                )

                component.instance().componentWillReceiveProps({
                    ...minProps,
                    integration,
                    location: {
                        ...minProps.location,
                        search: '?action=authentication',
                    },
                })

                expect(component.state()).toMatchSnapshot()
                expect(minProps.actions.fetchIntegration).not.toHaveBeenCalled()
                expect(
                    minProps.actions.triggerCreateSuccess
                ).toHaveBeenCalledWith(integration.toJS())
            }
        )
    })

    describe('_handleUpdate()', () => {
        it(
            'should call `updateOrCreateIntegration` with the integration passed in the props updated with the name' +
                'from the state',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                        enable_yotpo_tickets: true,
                    },
                    name: 'foo',
                })

                const component = shallow<YotpoIntegrationDetailComponent>(
                    <YotpoIntegrationDetailComponent
                        {...minProps}
                        integration={integration}
                    />
                )

                const newName = 'bar'
                const preventDefault = jest.fn()

                component.setState({
                    integrationName: newName,
                    enable_yotpo_tickets: false,
                })
                component.instance()._handleUpdate({
                    preventDefault,
                } as unknown as MouseEvent)

                expect(preventDefault).toHaveBeenCalled()
                expect(
                    minProps.actions.updateOrCreateIntegration
                ).toHaveBeenCalledWith(
                    fromJS({
                        id: integration.get('id'),
                        name: newName,
                        meta: (integration.get('meta') as Map<any, any>).set(
                            'enable_yotpo_tickets',
                            false
                        ),
                    })
                )
            }
        )
    })
    describe('render()', () => {
        it('should render a loader because the integration is loading', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                            enable_yotpo_tickets: true,
                        },
                    })}
                    loading={fromJS({integration: true})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an alert because the import is in progress', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                            enable_yotpo_tickets: true,
                        },
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a small paragraph because the import is over', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: true},
                            enable_yotpo_tickets: true,
                        },
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render buttons loading and disabled because a submit is in progress', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                            enable_yotpo_tickets: true,
                        },
                    })}
                    loading={fromJS({updateIntegration: true})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render not render deactivate / reactivate buttons because authentication is required', () => {
            const component = shallow(
                <YotpoIntegrationDetailComponent
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: PENDING_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                            enable_yotpo_tickets: true,
                        },
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it(
            'should not render anything about the import and render the re-activate button instead of the deactivate ' +
                'button because the integration is deactivated',
            () => {
                const component = shallow(
                    <YotpoIntegrationDetailComponent
                        {...minProps}
                        integration={fromJS({
                            id: 1,
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                sync_state: {is_initialized: false},
                                enable_yotpo_tickets: true,
                            },
                            deactivated_datetime: '2018-01-01 10:12',
                        })}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )
    })
})
