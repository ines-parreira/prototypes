import {mount, render} from 'enzyme'
import _noop from 'lodash/noop'
import React, {ReactElement} from 'react'

import Tag from '../Tag'
import {Option} from '../types'

describe('multi select options field tag', () => {
    const option: Option = {
        value: 'foo',
        label: 'Foo',
        displayLabel: <span>FooLabel</span>,
    }

    const defaultOptions = {
        option,
        color: '#f00',
        onRemove: _noop,
    }

    it('should display displayLabel first and label as a fallback', () => {
        const wrapper = mount(<Tag {...defaultOptions} />)
        expect(render(wrapper.find('span').last() as any).html()).toEqual(
            render(option.displayLabel as ReactElement).html()
        )
        wrapper.setProps({
            option: {
                ...option,
                displayLabel: undefined,
            },
        })
        expect(wrapper.find('span').last().text()).toContain(option.label)
    })
})
