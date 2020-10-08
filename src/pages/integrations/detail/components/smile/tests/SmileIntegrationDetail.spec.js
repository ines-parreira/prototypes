import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {
    PENDING_AUTHENTICATION_STATUS,
    SMILE_INTEGRATION_TYPE,
    SUCCESS_AUTHENTICATION_STATUS,
} from '../../../../../../constants/integration.ts'

import {SmileIntegrationDetailComponent} from '../SmileIntegrationDetail'

describe('<SmileIntegrationDetail/>', () => {
    const actions = {
        fetchIntegration: jest.fn(),
        triggerCreateSuccess: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }

    const defaultProps = {
        actions,
        location: {query: {}},
        loading: fromJS({}),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('componentDidMount()', () => {
        it("should set the integration's name in the state", () => {
            const integration = fromJS({
                id: 1,
                meta: {
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                    sync_state: {is_initialized: false},
                },
                name: 'foo',
            })

            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={integration}
                />
            )

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not do anything because there is no integration', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({})}
                />
            )

            expect(component.state()).toMatchSnapshot()
            expect(actions.fetchIntegration).not.toHaveBeenCalled()
            expect(actions.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it('should not do anything because the previous integration was not empty', () => {
            const integration = fromJS({
                id: 1,
                meta: {
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                    sync_state: {is_initialized: false},
                },
                name: 'foo',
            })

            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={integration}
                />
            )

            component.instance().componentWillReceiveProps({
                ...defaultProps,
                integration: integration.set('name', 'bar'),
            })

            expect(component.state()).toMatchSnapshot()
            expect(actions.fetchIntegration).not.toHaveBeenCalled()
            expect(actions.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it(
            'should set the name of the integration in the state because there was no integration before and there is ' +
                'one now',
            () => {
                const integration = fromJS({
                    id: 1,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                    },
                    name: 'foo',
                })

                const component = shallow(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />
                )

                component.instance().componentWillReceiveProps({
                    ...defaultProps,
                    integration,
                })

                expect(component.state()).toMatchSnapshot()
                expect(actions.fetchIntegration).not.toHaveBeenCalled()
                expect(actions.triggerCreateSuccess).not.toHaveBeenCalled()
            }
        )

        it(
            'should set the name of the integration the state and set a timeout to fetch the integration because ' +
                'the action in the URL is set to `authentication` and the integration is not yet authenticated',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: SMILE_INTEGRATION_TYPE,
                    meta: {
                        oauth: {status: PENDING_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                    },
                    name: 'foo',
                })

                const component = shallow(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />
                )

                component.instance().componentWillReceiveProps({
                    ...defaultProps,
                    integration,
                    location: {query: {action: 'authentication'}},
                })

                expect(component.state()).toMatchSnapshot()
                expect(actions.fetchIntegration).toHaveBeenCalledWith(
                    integration.get('id'),
                    integration.get('type'),
                    true
                )
                expect(actions.triggerCreateSuccess).not.toHaveBeenCalled()
            }
        )

        it(
            'should set the name of the integration the state and trigger a success notification because the action ' +
                'in the URL is set to `authentication` and the integration is already authenticated',
            () => {
                const integration = fromJS({
                    id: 1,
                    type: SMILE_INTEGRATION_TYPE,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                    },
                    name: 'foo',
                })

                const component = shallow(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />
                )

                component.instance().componentWillReceiveProps({
                    ...defaultProps,
                    integration,
                    location: {query: {action: 'authentication'}},
                })

                expect(component.state()).toMatchSnapshot()
                expect(actions.fetchIntegration).not.toHaveBeenCalled()
                expect(actions.triggerCreateSuccess).toHaveBeenCalledWith(
                    integration.toJS()
                )
            }
        )
    })

    describe('_handleUpdate()', () => {
        it(
            'should call `updateOrCreateIntegration` with the integration passed in the props updated with the name' +
                'from the state',
            () => {
                const integration = fromJS({
                    id: 1,
                    meta: {
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        sync_state: {is_initialized: false},
                    },
                    name: 'foo',
                })

                const component = shallow(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={integration}
                    />
                )

                const newName = 'bar'
                const preventDefault = jest.fn()

                component.setState({name: newName})
                component.instance()._handleUpdate({preventDefault})

                expect(preventDefault).toHaveBeenCalled()
                expect(actions.updateOrCreateIntegration).toHaveBeenCalledWith(
                    integration.set('name', newName)
                )
            }
        )
    })

    describe('render()', () => {
        it('should render a loader because the integration is loading', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                    loading={fromJS({integration: true})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an alert because the import is in progress', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a small paragraph because the import is over', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: true},
                        },
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render buttons loading and disabled because a submit is in progress', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
                        },
                    })}
                    loading={fromJS({updateIntegration: true})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render not render deactivate / reactivate buttons because authentication is required', () => {
            const component = shallow(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: {status: PENDING_AUTHENTICATION_STATUS},
                            sync_state: {is_initialized: false},
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
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({
                            id: 1,
                            meta: {
                                oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                                sync_state: {is_initialized: false},
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
