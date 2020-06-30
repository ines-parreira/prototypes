//@flow
import React from 'react'
import {DropdownItem} from 'reactstrap'
import {shallow} from 'enzyme'

import RichDropdownOptions from '../RichDropdownOptions'

describe('<RichDropdownOptions/>', () => {
    const onClick = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render a dropdown with options', () => {
        const component = shallow(
            <RichDropdownOptions
                onClick={onClick}
                options={[
                    {
                        key: 'foo',
                        label: 'Foo',
                    },
                    {
                        description: 'foobar',
                        key: 'bar',
                        label: 'Bar',
                    },
                ]}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should call onClick when option is clicked', () => {
        const component = shallow(
            <RichDropdownOptions
                onClick={onClick}
                options={[
                    {
                        key: 'foo',
                        label: 'Foo',
                    },
                    {
                        description: 'foobar',
                        key: 'bar',
                        label: 'Bar',
                    },
                ]}
            />
        )

        component.find(DropdownItem).at(0).simulate('click')
        expect(onClick.mock.calls.length).toBe(1)
        expect(onClick).toHaveBeenCalledTimes(1)
        expect(onClick).toHaveBeenLastCalledWith('foo')
    })
})
