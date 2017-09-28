import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import SelectField from '../SelectField'

describe('SelectField', () => {
    const minProps = {
        onChange: _noop
    }

    const props = {
        value: 1,
        options: [{
            value: 1,
            text: 'first',
            label: 'First',
        }, {
            value: 2,
            text: 'second',
            label: 'Second',
        }],
        onChange: _noop,
        placeholder: 'placeholder',
        style: {
            background: 'red',
        }
    }

    it('should use default props', () => {
        const component = mount(<SelectField {...minProps}/>)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with default props', () => {
        const component = mount(<SelectField {...minProps}/>)
        expect(component.state()).toMatchSnapshot()
    })


    it('should render a select input with default props', () => {
        const component = shallow(<SelectField {...minProps}/>)
        expect(component).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const component = mount(<SelectField {...minProps} {...props} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with custom props', () => {
        const component = mount(<SelectField {...minProps} {...props} />)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a select input with custom props', () => {
        const component = shallow(<SelectField {...minProps} {...props} />)
        expect(component).toMatchSnapshot()
    })
})
