import React, {ComponentProps, SyntheticEvent} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {SMOOCH_LANGUAGE_DEFAULT} from 'config/integrations/smooch'
import {
    SMOOCH_INTEGRATION_TYPE,
    SUCCESS_AUTHENTICATION_STATUS,
} from 'constants/integration'
import {DANISH_LANGUAGE, SPANISH_LANGUAGE} from 'constants/languages'
import {SmoochIntegrationDetail} from '../SmoochIntegrationDetail'

type Integration = ComponentProps<typeof SmoochIntegrationDetail>['integration']

const minProps: ComponentProps<typeof SmoochIntegrationDetail> = {
    integration: fromJS({}),
    loading: fromJS({
        integration: null,
        updateIntegration: null,
    }),
    location: {
        search: '',
        hash: fromJS({}),
        pathname: fromJS({}),
        state: fromJS({}),
    },
    history: fromJS({}),
    match: fromJS({}),
    activateIntegration: jest.fn(),
    deactivateIntegration: jest.fn(),
    deleteIntegration: jest.fn(),
    triggerCreateSuccess: jest.fn(),
    updateOrCreateIntegration: jest.fn(),
}

describe('<SmoochIntegrationDetail/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('componentDidMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail {...minProps} />
            )

            expect(component.instance().isInitialized).toEqual(false)
            expect(component.state('name')).toEqual('')
            expect(component.state('language')).toEqual(SMOOCH_LANGUAGE_DEFAULT)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            )

            expect(component.instance().isInitialized).toEqual(true)
            expect(component.state('name')).toEqual(integration.get('name'))
            expect(component.state('language')).toEqual(
                integration.getIn(['meta', 'language'])
            )
        })
    })

    describe('componentWillUpdate()', () => {
        it('should not initialize the state because the integration is empty', () => {
            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail {...minProps} />
            )

            component.instance().componentWillUpdate({
                ...minProps,
            })

            expect(component.instance().isInitialized).toEqual(false)
            expect(component.state('name')).toEqual('')
            expect(component.state('language')).toEqual(SMOOCH_LANGUAGE_DEFAULT)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail {...minProps} />
            )

            component.instance().componentWillUpdate({...minProps, integration})

            expect(component.instance().isInitialized).toEqual(true)
            expect(component.state('name')).toEqual(integration.get('name'))
            expect(component.state('language')).toEqual(
                integration.getIn(['meta', 'language'])
            )
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not do anything because the current and previous integrations are both empty', () => {
            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail {...minProps} />
            )

            component.instance().componentWillReceiveProps({
                ...minProps,
            })

            expect(minProps.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it('should not do anything because the current and previous integrations are both not empty', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            )

            component
                .instance()
                .componentWillReceiveProps({...minProps, integration})

            expect(minProps.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it('should not do anything because the current action is not "authentication"', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={fromJS({})}
                />
            )

            component
                .instance()
                .componentWillReceiveProps({...minProps, integration})

            expect(minProps.triggerCreateSuccess).not.toHaveBeenCalled()
        })

        it('should call `triggerCreateSuccess`', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const location: ComponentProps<
                typeof SmoochIntegrationDetail
            >['location'] = {
                ...minProps.location,
                search: '?action=authentication',
            }

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail {...minProps} location={location} />
            )

            component.instance().componentWillReceiveProps({
                ...minProps,
                integration,
                location,
            })

            expect(minProps.triggerCreateSuccess).toHaveBeenCalledWith(
                integration.toJS()
            )
        })
    })

    describe('_setName()', () => {
        it('should update the state with the name passed', () => {
            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        name: 'My smooch app',
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {
                            language: DANISH_LANGUAGE,
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        },
                        deactivated_datetime: null,
                    })}
                />
            )

            const newName = 'my new name'

            component.instance()._setName(newName)

            expect(component.state('name')).toEqual(newName)
        })
    })

    describe('_setLanguage()', () => {
        it('should update the state with the language passed', () => {
            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        name: 'My smooch app',
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {
                            language: DANISH_LANGUAGE,
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        },
                        deactivated_datetime: null,
                    })}
                />
            )

            component.instance()._setName(SPANISH_LANGUAGE)

            expect(component.state('name')).toEqual(SPANISH_LANGUAGE)
        })
    })

    describe('_handleSubmit()', () => {
        it('should call the action to update the integration when submitting the form', () => {
            const integration: Integration = fromJS({
                id: 1,
                name: 'My smooch app',
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: DANISH_LANGUAGE,
                    oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                },
                deactivated_datetime: null,
            })

            const component = shallow<SmoochIntegrationDetail>(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={integration}
                />
            )

            const newName = 'my new name'

            component
                .instance()
                .setState({name: newName, language: SPANISH_LANGUAGE})

            void component.instance()._handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as SyntheticEvent<HTMLButtonElement>)

            expect(minProps.updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: integration.get('id'),
                    name: newName,
                    meta: {
                        language: SPANISH_LANGUAGE,
                        oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                    },
                })
            )
        })
    })

    describe('render()', () => {
        it('should render an active integration', () => {
            const component = shallow(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        name: 'My smooch app',
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {
                            language: DANISH_LANGUAGE,
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        },
                        deactivated_datetime: null,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an inactive integration', () => {
            const component = shallow(
                <SmoochIntegrationDetail
                    {...minProps}
                    integration={fromJS({
                        id: 1,
                        name: 'My smooch app',
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {
                            language: DANISH_LANGUAGE,
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        },
                        deactivated_datetime: '2019-01-01 00:00:00',
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an integration which is currently being submitted', () => {
            const component = shallow(
                <SmoochIntegrationDetail
                    {...minProps}
                    loading={fromJS({
                        updateIntegration: 1,
                    })}
                    integration={fromJS({
                        id: 1,
                        name: 'My smooch app',
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {
                            language: DANISH_LANGUAGE,
                            oauth: {status: SUCCESS_AUTHENTICATION_STATUS},
                        },
                        deactivated_datetime: null,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
