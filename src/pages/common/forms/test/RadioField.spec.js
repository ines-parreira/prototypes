import React from 'react'
import {mount, shallow} from 'enzyme'

import RadioField from '../RadioField'


describe('RadioField component', () => {
    it('should render passed options, with the passed value selected, and with description when the option has one, ' +
        'else without it', () => {
        const component = shallow(
            <RadioField
                options={[
                    {value: 1, label: 'foo', description: 'one of the options'},
                    {value: 2, label: 'bar', description: 'another option'},
                    {value: 3, label: 'baz'},
                ]}
                value={2}
                onChange={jest.fn()}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should call passed `onChange` function when changing the value of the field', () => {
        const onChangeSpy = jest.fn()
        const oldValue = 1
        const newValue = 2

        const component = mount(
            <RadioField
                options={[
                    {value: oldValue, label: 'foo', description: 'one of the options'},
                    {value: newValue, label: 'bar', description: 'another option'},
                    {value: 3, label: 'baz'},
                ]}
                value={oldValue}
                onChange={onChangeSpy}
            />
        )

        component.find('input').at(1).simulate('change')

        expect(onChangeSpy).toHaveBeenCalledWith(newValue)
    })
})
