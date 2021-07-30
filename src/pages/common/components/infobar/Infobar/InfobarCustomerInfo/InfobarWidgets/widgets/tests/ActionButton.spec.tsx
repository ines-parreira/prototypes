import React, {Component, ComponentProps, ReactNode} from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'
import {render, cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'

import {CustomerContext} from '../../../InfobarCustomerInfo'
import {
    ActionButtonContainer,
    ActionButtonContext,
    withActionButtonContext,
} from '../ActionButton'

type Props = {
    integration: Map<any, any>
    integrationId: number
    children: ReactNode
}

class ActionButtonContextProvider extends Component<Props> {
    static childContextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        integrationId: PropTypes.number.isRequired,
    }

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

describe('ActionButton component', () => {
    const getPendingActionCallback = () => fromJS({}) as Map<any, any>

    const minProps = {
        executeAction: jest.fn(),
        getPendingActionCallback,
        key: 'foo',
        popover: 'This action is little, but it is powerful.',
        title: (
            <div>
                <i className="material-icons mr-2">refresh</i>
                Execute my little action
            </div>
        ),
        children: (
            <div>
                <i className="material-icons mr-2">refresh</i> Little action
            </div>
        ),
        options: [{value: 'myLittleAction', label: 'My little action'}],
        payload: {
            little_id: 12,
        } as ComponentProps<typeof ActionButtonContainer>['payload'],
    }

    const defaultContext = {
        integration: fromJS({}),
        integrationId: 1,
    }

    // TODO(context-migration): Should be removed.
    const ActionButtonWithContext = (
        props: Omit<ComponentProps<typeof ActionButtonContainer>, 'options'>
    ) => (
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
        const component = shallow(<ActionButtonContainer {...minProps} />, {
            context: defaultContext,
        })

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a text parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a number parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a checkbox parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a single option with a select parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                            } as any,
                        ],
                    },
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options without parameters', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
                    {
                        value: 'myLittleAction',
                        label: 'My little action',
                    },
                    {
                        value: 'myBigAction',
                        label: 'My big action',
                    },
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with a common parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display multiple options with different parameter', () => {
        const component = shallow(
            <ActionButtonContainer
                {...minProps}
                options={[
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
                ]}
            />,
            {
                context: defaultContext,
            }
        )

        expect(component).toMatchSnapshot()
    })

    it('should display disabled button based on context', () => {
        const {getByRole} = render(
            <ActionButtonContext.Provider
                value={{actionError: 'Some error message'}}
            >
                <ActionButtonWithContextAdapter
                    {...minProps}
                    options={[
                        {
                            value: 'myLittleAction',
                            label: 'My little action',
                        },
                    ]}
                />
            </ActionButtonContext.Provider>
        )

        expect(getByRole('button').hasAttribute('disabled')).toBeTruthy()
    })

    it('should display enabled button based on context', () => {
        const {getByRole} = render(
            <ActionButtonContext.Provider value={{actionError: null}}>
                <ActionButtonWithContextAdapter
                    {...minProps}
                    options={[
                        {
                            value: 'myLittleAction',
                            label: 'My little action',
                        },
                    ]}
                />
            </ActionButtonContext.Provider>
        )

        expect(getByRole('button').hasAttribute('disabled')).toBeFalsy()
    })

    it('should call executeAction when confirming action', () => {
        const options = [
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
        ]
        const customerId = 43
        const Modal = ({onSubmit}: any) => <div onClick={onSubmit}>Modal</div>

        const {getByText} = render(
            <CustomerContext.Provider value={{customerId: 43}}>
                <ActionButtonContext.Provider value={{actionError: null}}>
                    <ActionButtonWithContextAdapter
                        {...minProps}
                        options={options}
                        modal={Modal}
                    />
                </ActionButtonContext.Provider>
            </CustomerContext.Provider>
        )

        userEvent.click(getByText('Modal'))

        expect(minProps.executeAction).toHaveBeenCalledWith(
            options[0].value,
            defaultContext.integrationId,
            customerId.toString(),
            {
                ...minProps.payload,
                [options[0].parameters[0].name]:
                    options[0].parameters[0].defaultValue,
            }
        )
    })
})
