import React from 'react'
import {shallow} from 'enzyme'

import RichDropdownOptionGroups from '../RichDropdownOptionGroups'

describe('<RichDropdownOptionGroups/>', () => {
    const options = [
        {
            key: 'foo',
            label: 'Foo',
        },
        {
            description: 'foobar',
            key: 'bar',
            label: 'Bar',
        },
    ]

    it('should render a dropdown with nested options', () => {
        const component = shallow(
            <RichDropdownOptionGroups
                onClick={jest.fn()}
                options={[
                    {
                        key: 'foo',
                        label: 'FOO',
                        options,
                    },
                    {
                        key: 'bar',
                        label: 'BAR',
                        options,
                    },
                ]}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
