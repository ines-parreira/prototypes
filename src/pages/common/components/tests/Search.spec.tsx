import React from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'

import TextInput from 'pages/common/forms/input/TextInput'

import Search from '../Search'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

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
        component.instance().searchInputRef = {
            blur: mockBlur,
        } as unknown as HTMLInputElement
        component.find(TextInput).simulate('keydown', {key: 'a'})
        component.find(TextInput).simulate('keydown', {key: 'Escape'})

        expect(mockBlur).toHaveBeenCalledTimes(1)
    })
})
