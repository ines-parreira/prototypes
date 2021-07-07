import React from 'react'
import {mount, shallow} from 'enzyme'

import RadioField from '../RadioField.tsx'

describe('<RadioField/>', () => {
    describe('_onChange()', () => {
        it('should call `_onChange` when changing the value of the field because the field is enabled', () => {
            const onChangeSpy = jest.fn()
            const oldValue = 1
            const newValue = 2

            const component = mount(
                <RadioField
                    options={[
                        {
                            value: oldValue,
                            label: 'foo',
                            description: 'one of the options',
                        },
                        {
                            value: newValue,
                            label: 'bar',
                            description: 'another option',
                        },
                        {value: 3, label: 'baz'},
                    ]}
                    value={oldValue}
                    onChange={() => {}}
                />
            )

            component.instance()._onChange = onChangeSpy

            component.find('input').at(1).simulate('change')

            expect(onChangeSpy).toHaveBeenCalledWith(newValue)
        })

        it('should call `_onChange` when clicking on the label of the field because the field is enabled', () => {
            const onChangeSpy = jest.fn()
            const oldValue = 1
            const newValue = 2

            const component = mount(
                <RadioField
                    options={[
                        {
                            value: oldValue,
                            label: 'foo',
                            description: 'one of the options',
                        },
                        {
                            value: newValue,
                            label: 'bar',
                            description: 'another option',
                        },
                        {value: 3, label: 'baz'},
                    ]}
                    value={oldValue}
                    onChange={() => {}}
                />
            )

            component.instance()._onChange = onChangeSpy

            component.find('.control-label').at(2).simulate('click')

            expect(onChangeSpy).toHaveBeenCalledWith(newValue)
        })

        it('should not call `_onChange` when clicking on the label of the field because the field is disabled', () => {
            const onChangeSpy = jest.fn()
            const oldValue = 1
            const newValue = 2

            const component = mount(
                <RadioField
                    options={[
                        {
                            value: oldValue,
                            label: 'foo',
                            description: 'one of the options',
                        },
                        {
                            value: newValue,
                            label: 'bar',
                            description: 'another option',
                        },
                        {value: 3, label: 'baz'},
                    ]}
                    value={oldValue}
                    onChange={() => {}}
                    disabled
                />
            )

            component.instance()._onChange = onChangeSpy

            component.find('.control-label').at(2).simulate('click')

            expect(onChangeSpy).not.toHaveBeenCalled()
        })

        it('should call passed `onChange` function when called', () => {
            const onChangeSpy = jest.fn()
            const oldValue = 1
            const newValue = 2

            const component = mount(
                <RadioField
                    options={[
                        {
                            value: oldValue,
                            label: 'foo',
                            description: 'one of the options',
                        },
                        {
                            value: newValue,
                            label: 'bar',
                            description: 'another option',
                        },
                        {value: 3, label: 'baz'},
                    ]}
                    value={oldValue}
                    onChange={onChangeSpy}
                />
            )

            component.instance()._onChange(newValue)

            expect(onChangeSpy).toHaveBeenCalledWith(newValue)
        })
    })

    describe('render()', () => {
        it('should render an enabled Radio field', () => {
            const component = shallow(
                <RadioField
                    options={[
                        {
                            value: 1,
                            label: 'foo',
                            description: 'one of the options',
                        },
                        {value: 2, label: 'bar', description: 'another option'},
                        {value: 3, label: 'baz'},
                    ]}
                    value={2}
                    onChange={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    it('should render a disabled Radio field', () => {
        const component = shallow(
            <RadioField
                options={[
                    {value: 1, label: 'foo', description: 'one of the options'},
                    {value: 2, label: 'bar', description: 'another option'},
                    {value: 3, label: 'baz'},
                ]}
                value={2}
                onChange={jest.fn()}
                disabled
            />
        )

        expect(component).toMatchSnapshot()
    })
})
