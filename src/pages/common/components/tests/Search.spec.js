import React from 'react'
import {mount} from 'enzyme'
import _noop from 'lodash/noop'

import Search from '../Search'

describe('Search component', () => {
    it('handle change function', () => {
        const component = mount(<Search onChange={_noop} />)
        component.instance()._handleChange('text')
        expect(component.instance().state.search).toEqual('text')
        expect(component).toMatchSnapshot()
    })

    it('reset function', () => {
        const component = mount(<Search onChange={_noop} />)
        component.instance()._handleChange('text')
        expect(component.instance().state.search).toEqual('text')
        expect(component).toMatchSnapshot()
        component.instance()._reset()
        expect(component.instance().state.search).toEqual('')
        expect(component).toMatchSnapshot()
    })
})
