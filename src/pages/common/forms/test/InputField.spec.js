import React from 'react'
import {mount} from 'enzyme'

import InputField from '../InputField'

describe('InputField.spec.js component', () => {
    it('should render a basic text input', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                onChange={() => {}}
                placeholder="placeholder"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a required text input', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                onChange={() => {}}
                placeholder="placeholder"
                required
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render an inline text input', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                placeholder="placeholder"
                inline
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render an inline required text input', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                placeholder="placeholder"
                required
                inline
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a text input with a right addon', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                placeholder="placeholder"
                rightAddon="@rightaddon.io"
                inline
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a text input with an onChange handler, and call this handler on change', () => {
        let valueStorage = 'value'

        const component = mount(
            <InputField
                type="text"
                label="label"
                value={valueStorage}
                placeholder="placeholder"
                onChange={(value) => {valueStorage = value}}
            />
        )
        expect(component).toMatchSnapshot()

        const newValue = 'newValue'
        component.find('input').simulate('change', {target: {value: newValue}})

        expect(valueStorage).toEqual(newValue)
    })

    it('should render a hidden text input', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                placeholder="placeholder"
                hidden
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a text input with an error', () => {
        const component = mount(
            <InputField
                type="text"
                label="label"
                value="value"
                placeholder="placeholder"
                error="the value is wrong"
            />
        )
        expect(component).toMatchSnapshot()
    })
})
