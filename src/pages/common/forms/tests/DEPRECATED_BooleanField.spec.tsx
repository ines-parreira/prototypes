import React, {ComponentProps} from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'

import DEPRECATED_BooleanField from '../DEPRECATED_BooleanField'

describe('DEPRECATED_BooleanField', () => {
    const minProps: ComponentProps<typeof DEPRECATED_BooleanField> = {
        name: 'mybooleanfield',
        type: 'text',
        label: 'label',
        value: false,
        onChange: _noop,
        placeholder: 'placeholder',
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['type'])
        const component = mount(<DEPRECATED_BooleanField {...props} />)
        expect(
            component.find('DEPRECATED_BooleanField').props()
        ).toMatchSnapshot()
    })

    it('should render a basic boolean input', () => {
        const component = shallow(<DEPRECATED_BooleanField {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const component = shallow(
            <DEPRECATED_BooleanField {...minProps} required />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a help text', () => {
        const component = shallow(
            <DEPRECATED_BooleanField {...minProps} help="help text" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the input with an error', () => {
        const component = shallow(
            <DEPRECATED_BooleanField {...minProps} error="the value is wrong" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render inline', () => {
        const component = shallow(
            <DEPRECATED_BooleanField {...minProps} inline />
        )
        expect(component).toMatchSnapshot()
    })
})
