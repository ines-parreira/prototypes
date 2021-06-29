// @flow
import React, {type Node as ReactNode} from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import {render, cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'

import {CustomerContext} from '../../../InfobarCustomerInfo.tsx'
import {
    ActionButtonContainer,
    ActionButtonContext,
    withActionButtonContext,
} from '../ActionButton.tsx'

type Props = {
    integration: Map<*, *>,
    integrationId: number,
    children: ReactNode,
}

class ActionButtonContextProvider extends React.Component<Props> {
    getChildContext() {
        return {
            integration: this.props.integration,
            integrationId: this.props.integrationId,
        }
    }

    render() {
        return this.props.children
    }
}

ActionButtonContextProvider.childContextTypes = {
    integration: ImmutablePropTypes.map.isRequired,
    integrationId: PropTypes.number.isRequired,
}

describe('ActionButton component', () => {
    const commonAttributes: {
        key: string,
        popover: string,
        title: ReactNode,
        child: ReactNode,
        tooltip?: string,
    } = {
        key: 'foo',
        popover: 'This action is little, but it is powerful.',
        title: (
            <div>
                <i className="material-icons mr-2">refresh</i>
                Execute my little action
            </div>
        ),
        child: (
            <div>
                <i className="material-icons mr-2">refresh</i> Little action
            </div>
        ),
    }

    const defaultContext = {
        integration: fromJS({}),
        integrationId: 1,
    }

    // TODO(context-migration): Should be removed.
    const ActionButtonWithContext = (props) => (
        <ActionButtonContextProvider {...defaultContext}>
            <ActionButtonContainer options={[]} {...props} />
        </ActionButtonContextProvider>
    )

    // TODO(context-migration): Should be removed.
    const ActionButtonWithContextAdapter = withActionButtonContext(
        ActionButtonWithContext
    )

    afterEach(cleanup)

    it('should display a single option with no parameters', () => {
        const action = {
            options: [{value: 'myLittleAction', label: 'My little action'}],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a text parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'text',
                            defaultValue: 'hello',
                            placeholder: 'Just a param',
                            required: true,
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a number parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'number',
                            defaultValue: 7,
                            placeholder: 'Just a param',
                            required: true,
                            step: 0.1,
                            min: 2,
                            max: 9,
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a checkbox parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'checkbox',
                            defaultValue: true,
                            label: 'Execute the action for real',
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a select parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'select',
                            defaultValue: true,
                            label: 'Execute the action for real',
                            options: [
                                {label: 'Foo', value: 'foo'},
                                {label: 'Bar', value: 'bar'},
                            ],
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options without parameters', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                },
                {
                    value: 'myBigAction',
                    label: 'My big action',
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with a common parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'text',
                            defaultValue: 'hello',
                            placeholder: 'Just a param',
                            required: true,
                        },
                    ],
                },
                {
                    value: 'myBigAction',
                    label: 'My big action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'text',
                            defaultValue: 'hello',
                            placeholder: 'Just a param',
                            required: true,
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with different parameter', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'text',
                            defaultValue: 'hello',
                            placeholder: 'Just a param',
                            required: true,
                        },
                    ],
                },
                {
                    value: 'myBigAction',
                    label: 'My big action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'checkbox',
                            defaultValue: true,
                            label: 'Execute the action for real',
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }

        const payload = {
            little_id: 12,
        }

        const component = shallow(
            <ActionButtonContainer
                key={action.key}
                options={action.options}
                payload={payload}
                popover={action.popover}
                tooltip={action.tooltip}
                title={action.title}
                getPendingActionCallback={() => null}
            >
                {action.child}
            </ActionButtonContainer>,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display disabled button based on context', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                },
            ],
            ...commonAttributes,
        }

        const {getByRole} = render(
            <ActionButtonContext.Provider
                value={{actionError: 'Some error message'}}
            >
                <ActionButtonWithContextAdapter
                    key={action.key}
                    options={action.options}
                    popover={action.popover}
                    tooltip={action.tooltip}
                    title={action.title}
                >
                    {action.child}
                </ActionButtonWithContextAdapter>
            </ActionButtonContext.Provider>
        )

        expect(getByRole('button').hasAttribute('disabled')).toBeTruthy()
    })

    it('should display enabled button based on context', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                },
            ],
            ...commonAttributes,
        }

        const {getByRole} = render(
            <ActionButtonContext.Provider value={{actionError: null}}>
                <ActionButtonWithContextAdapter
                    key={action.key}
                    options={action.options}
                    popover={action.popover}
                    tooltip={action.tooltip}
                    title={action.title}
                >
                    {action.child}
                </ActionButtonWithContextAdapter>
            </ActionButtonContext.Provider>
        )

        expect(getByRole('button').hasAttribute('disabled')).toBeFalsy()
    })

    it('should call executeAction when confirming action', () => {
        const action = {
            options: [
                {
                    value: 'myLittleAction',
                    label: 'My little action',
                    parameters: [
                        {
                            name: 'param',
                            type: 'text',
                            defaultValue: 'hello',
                            placeholder: 'Just a param',
                            required: true,
                        },
                    ],
                },
            ],
            ...commonAttributes,
        }
        const customerId = 43
        const executeAction = jest.fn()
        const Modal = ({onSubmit}: any) => <div onClick={onSubmit}>Modal</div>
        const payload = {
            little_id: 12,
        }

        const {getByText} = render(
            <CustomerContext.Provider value={{customerId: 43}}>
                <ActionButtonContext.Provider value={{actionError: null}}>
                    <ActionButtonWithContextAdapter
                        key={action.key}
                        options={action.options}
                        popover={action.popover}
                        tooltip={action.tooltip}
                        title={action.title}
                        payload={payload}
                        executeAction={executeAction}
                        modal={Modal}
                    >
                        {action.child}
                    </ActionButtonWithContextAdapter>
                </ActionButtonContext.Provider>
            </CustomerContext.Provider>
        )

        userEvent.click(getByText('Modal'))

        expect(executeAction).toHaveBeenCalledWith(
            action.options[0].value,
            defaultContext.integrationId,
            customerId.toString(),
            {
                ...payload,
                [action.options[0].parameters[0].name]:
                    action.options[0].parameters[0].defaultValue,
            }
        )
    })
})
