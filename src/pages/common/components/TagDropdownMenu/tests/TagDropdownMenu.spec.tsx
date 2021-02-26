import React from 'react'
import {DropdownMenu} from 'reactstrap'
import {shallow} from 'enzyme'

import TagDropdownMenu from '../TagDropdownMenu'

describe('TagDropdownMenu', () => {
    it('should overwrite width style', () => {
        const customStyle = {
            width: '500px',
            backgroundColor: '#123456',
        }
        const wrapper = shallow(<TagDropdownMenu style={customStyle} />)
        const menuStyle = wrapper
            .find(DropdownMenu)
            .prop('style') as typeof customStyle
        expect(menuStyle.width).not.toBe(customStyle.width)
        expect(menuStyle.backgroundColor).toBe(customStyle.backgroundColor)
    })

    it('should pass props', () => {
        // @ts-ignore
        const wrapper = shallow(<TagDropdownMenu foo="bar" />)
        expect(wrapper.find(DropdownMenu).prop('foo')).toBe('bar')
    })
})
