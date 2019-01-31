// @flow
import {mount} from 'enzyme'
import _noop from 'lodash/noop'
import React from 'react'
import {DropdownItem} from 'reactstrap'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import type {Option} from '../types'

describe('MultiSelectField Menu', () => {
    const options: Option[] = [{
        value: 'foo',
        label: 'Foo'
    }, {
        value: 'bar',
        label: 'Bar',
        displayLabel: (
            <span>BarSpan</span>
        )
    }]

    const defaultProps = {
        options,
        activeIndex: 0,
        onActivate: _noop,
        onSelect: _noop
    }

    it('should render displayLabel first and label as a fallback', () => {
        const component = mount(
            <Menu
                {...defaultProps}
            />
        )
        const items = component.find(MenuItem)
        expect(items.at(0).text()).toBe('Foo')
        expect(items.at(1).text()).toBe('BarSpan')
    })

    it('should display loading spinner if loading set to true', () => {
        const component = mount(
            <Menu
                {...defaultProps}
                isLoading
            />
        )
        const item = component.find(DropdownItem)
        expect(item.find('.material-icons').text()).toBe('refresh')
        expect(item.text()).toContain('Loading...')
    })

    it('should display "No result" if not loading and no options', () => {
        const component = mount(
            <Menu
                {...defaultProps}
                options={[]}
            />
        )
        expect(component.find(DropdownItem).text()).toBe('No result')
    })
})
