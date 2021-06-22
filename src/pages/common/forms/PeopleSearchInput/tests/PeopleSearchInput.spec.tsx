import React from 'react'
import {mount, render} from 'enzyme'

import PeopleSearchInput from '../PeopleSearchInput'

describe('<PeopleSearchInput/>', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <PeopleSearchInput value="foo" onChange={onChange} />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('onChange()', () => {
        it('should call prop `onChange` with new value', () => {
            const component = mount(
                <PeopleSearchInput value="foo" onChange={onChange} />
            )

            component.find('input').simulate('change', {target: {value: 'bar'}})

            expect(onChange).toHaveBeenCalledWith('bar')
        })
    })
})
