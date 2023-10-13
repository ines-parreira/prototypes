import React from 'react'
import {render} from '@testing-library/react'

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
        const {container} = render(
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

        expect(container.firstChild).toMatchSnapshot()
    })
})
