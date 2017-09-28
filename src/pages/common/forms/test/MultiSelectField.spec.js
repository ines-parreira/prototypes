import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import MultiSelectField from '../MultiSelectField'

describe('MultiSelectField', () => {
    const minProps = {
        onChange: _noop
    }

    const props = {
        values: [1,3],
        options: [{
            value: 1,
            text: 'first',
            label: 'First',
        }, {
            value: 2,
            text: 'second',
            label: 'Second',
        }, {
            value: 3,
            text: 'third',
            label: 'Third',
        }],
        onChange: _noop,
        plural: 'tags',
        singular: 'tag',
        allowCustomValues: true,
        showNoResult: true,

    }

    it('should use default props', () => {
        const component = mount(<MultiSelectField {...minProps}/>)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with default props', () => {
        const component = mount(<MultiSelectField {...minProps}/>)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a select input with default props', () => {
        const component = shallow(<MultiSelectField {...minProps}/>)
        expect(component).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const component = mount(<MultiSelectField {...minProps} {...props} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with custom props', () => {
        const component = mount(<MultiSelectField {...minProps} {...props} />)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a multi select input with custom props', () => {
        const component = shallow(<MultiSelectField {...minProps} {...props} />)
        expect(component).toMatchSnapshot()
    })
})
