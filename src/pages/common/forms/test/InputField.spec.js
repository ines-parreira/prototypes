import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import InputField from '../InputField'

describe('InputField', () => {
    const minProps = {
        value: 'value',
        onChange: _noop,
    }

    it('should use default props', () => {
        const component = mount(<InputField {...minProps} />)
        expect(component.find('InputField').props()).toMatchSnapshot()
    })

    it('should render a basic text input', () => {
        const component = shallow(
            <InputField
                {...minProps}
                type="text"
                label="label"
                placeholder="placeholder"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a required text input', () => {
        const component = shallow(
            <InputField
                {...minProps}
                required
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render an inline text input', () => {
        const component = shallow(
            <InputField
                {...minProps}
                inline
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a help text', () => {
        const component = shallow(
            <InputField
                {...minProps}
                help="help text"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render an inline required text input', () => {
        const component = shallow(
            <InputField
                {...minProps}
                required
                inline
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a text input with a right addon', () => {
        const component = shallow(
            <InputField
                {...minProps}
                rightAddon="@rightaddon.io"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a text input with an onChange handler, and call this handler on change', () => {
        let valueStorage = 'value'

        const component = mount(
            <InputField
                {...minProps}
                value={valueStorage}
                onChange={(value) => {valueStorage = value}}
            />
        )
        expect(component).toMatchSnapshot()

        const newValue = 'newValue'
        component.find('input').simulate('change', {target: {value: newValue}})

        expect(valueStorage).toEqual(newValue)
    })

    it('should render a number input with an onChange handler, and call this handler on change', () => {
        const onChangeSpy = jest.fn()

        const component = mount(
            <InputField
                {...minProps}
                type="number"
                value="value"
                onChange={onChangeSpy}
            />
        )
        expect(component).toMatchSnapshot()

        const newValue = '12'
        component.find('input').simulate('change', {target: {value: newValue}})

        expect(onChangeSpy).toHaveBeenCalledWith(parseFloat(newValue))
    })

    it('should render a hidden text input', () => {
        const component = shallow(
            <InputField
                {...minProps}
                hidden
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the input with an error', () => {
        const component = shallow(
            <InputField
                {...minProps}
                error="the value is wrong"
            />
        )
        expect(component).toMatchSnapshot()
    })
})
