import React from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'
import {render, cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {ActionButtonContainer} from '../ActionButton'

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
            order_id: '12',
        },
        actionError: null,
        customerId: null,
        integrationId: 1,
    }

    afterEach(cleanup)

    it('should display a single option with no parameters', () => {
        const component = shallow(<ActionButtonContainer {...minProps} />)

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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display disabled button based on context', () => {
        const {getByRole} = render(
            <ActionButtonContainer
                {...minProps}
                actionError={'Some error message'}
                options={[
                    {
                        value: 'myLittleAction',
                        label: 'My little action',
                    },
                ]}
            />
        )

        expect(getByRole('button').hasAttribute('disabled')).toBeTruthy()
    })

    it('should display enabled button based on context', () => {
        const {getByRole} = render(
            <ActionButtonContainer
                {...minProps}
                actionError={null}
                options={[
                    {
                        value: 'myLittleAction',
                        label: 'My little action',
                    },
                ]}
            />
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
            <ActionButtonContainer
                {...minProps}
                customerId={customerId}
                options={options}
                modal={Modal}
            />
        )

        userEvent.click(getByText('Modal'))

        expect(minProps.executeAction).toHaveBeenCalledWith({
            actionName: options[0].value,
            integrationId: minProps.integrationId,
            customerId: customerId.toString(),
            payload: {
                ...minProps.payload,
                [options[0].parameters[0].name]:
                    options[0].parameters[0].defaultValue,
            },
        })
    })
})
