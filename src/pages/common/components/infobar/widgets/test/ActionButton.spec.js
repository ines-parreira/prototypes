import React from 'react'
import {fromJS} from 'immutable'
import ActionButton from '../ActionButton'
import {shallow} from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


describe('ActionButton component', () => {
    let store

    const commonAttributes = {
        key: 'foo',
        tooltip: 'This action is little, but it is powerful.',
        title: (
            <div>
                <i className="material-icons mr-2">
                    refresh
                </i>
                Execute my little action
            </div>
        ),
        child: (
            <div>
                <i className="material-icons mr-2">
                    refresh
                </i>
                Little action
            </div>
        )
    }

    const defaultContext = {
        integration: fromJS({}),
        integrationId: 1,
        customerId: 1
    }

    beforeEach(() => {
        // set execute action callbacks
        store = mockStore({
            infobar: fromJS({
                pendingActionsCallbacks: []
            })
        })
    })

    it('should display a single option with no parameters', () => {
        const action = {
            options: [{value: 'myLittleAction', label: 'My little action'}],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a text parameter', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
                parameters: [{
                    name: 'param',
                    type: 'text',
                    defaultValue: 'hello',
                    placeholder: 'Just a param',
                    required: true
                }]
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a number parameter', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
                parameters: [{
                    name: 'param',
                    type: 'number',
                    defaultValue: 7,
                    placeholder: 'Just a param',
                    required: true,
                    step: 0.1,
                    min: 2,
                    max: 9
                }]
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a checkbox parameter', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
                parameters: [{
                    name: 'param',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'Execute the action for real'
                }]
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options without parameters', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
            }, {
                value: 'myBigAction',
                label: 'My big action',
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with a common parameter', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
                parameters: [{
                    name: 'param',
                    type: 'text',
                    defaultValue: 'hello',
                    placeholder: 'Just a param',
                    required: true
                }]
            }, {
                value: 'myBigAction',
                label: 'My big action',
                parameters: [{
                    name: 'param',
                    type: 'text',
                    defaultValue: 'hello',
                    placeholder: 'Just a param',
                    required: true
                }]
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with different parameter', () => {
        const action = {
            options: [{
                value: 'myLittleAction',
                label: 'My little action',
                parameters: [{
                    name: 'param',
                    type: 'text',
                    defaultValue: 'hello',
                    placeholder: 'Just a param',
                    required: true
                }]
            }, {
                value: 'myBigAction',
                label: 'My big action',
                parameters: [{
                    name: 'param',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'Execute the action for real'
                }]
            }],
            ...commonAttributes
        }

        const payload = {
            little_id: 12
        }

        const component = shallow(
            <ActionButton
                store={store}
                key={action.key}
                options={action.options}
                payload={payload}
                tooltip={action.tooltip}
                title={action.title}
            >
                {action.child}
            </ActionButton>
        , {
            context: defaultContext
        }).dive()

        expect(component).toMatchSnapshot()
    })
})
