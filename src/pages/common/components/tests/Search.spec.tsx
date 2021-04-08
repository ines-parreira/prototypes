import React from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import ReactDOM from 'react-dom'
import {Input} from 'reactstrap'

import Search from '../Search'
const spy = jest.spyOn(ReactDOM, 'findDOMNode') as jest.SpyInstance<
    HTMLInputElement
>

describe('Search component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('handle change function', () => {
        const component = mount<Search>(<Search onChange={_noop} />)
        component.instance()._handleChange('text')
        expect(component.instance().state.search).toEqual('text')
        expect(component).toMatchSnapshot()
    })

    it('reset function', () => {
        const component = mount<Search>(<Search onChange={_noop} />)
        component.instance()._handleChange('text')
        expect(component.instance().state.search).toEqual('text')
        expect(component).toMatchSnapshot()
        component.instance()._reset()
        expect(component.instance().state.search).toEqual('')
        expect(component).toMatchSnapshot()
    })

    it('should blur when pressing escape', () => {
        const component = shallow<Search>(<Search onChange={_noop} />)
        const mockBlur = jest.fn()
        spy.mockReturnValue(({
            blur: mockBlur,
        } as unknown) as HTMLInputElement)

        component.instance().searchInputRef = {} as Input
        component.find(Input).simulate('keydown', {key: 'a'})
        component.find(Input).simulate('keydown', {key: 'Escape'})
        expect(mockBlur).toHaveBeenCalledTimes(1)
    })
})
