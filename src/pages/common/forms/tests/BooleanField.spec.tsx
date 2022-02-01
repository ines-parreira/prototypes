import React, {ComponentProps} from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'

import BooleanField from '../BooleanField'

describe('BooleanField', () => {
    const minProps: ComponentProps<typeof BooleanField> = {
        name: 'mybooleanfield',
        type: 'text',
        label: 'label',
        value: false,
        onChange: _noop,
        placeholder: 'placeholder',
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['type'])
        const component = mount(<BooleanField {...props} />)
        expect(component.find('BooleanField').props()).toMatchSnapshot()
    })

    it('should render a basic boolean input', () => {
        const component = shallow(<BooleanField {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const component = shallow(<BooleanField {...minProps} required />)
        expect(component).toMatchSnapshot()
    })

    it('should render a help text', () => {
        const component = shallow(
            <BooleanField {...minProps} help="help text" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the input with an error', () => {
        const component = shallow(
            <BooleanField {...minProps} error="the value is wrong" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render inline', () => {
        const component = shallow(<BooleanField {...minProps} inline />)
        expect(component).toMatchSnapshot()
    })
})
