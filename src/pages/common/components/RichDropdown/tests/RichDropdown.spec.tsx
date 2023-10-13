import React from 'react'
import {render} from '@testing-library/react'

import RichDropdown from '../RichDropdown'

describe('<RichDropdown/>', () => {
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
    const nestedOptions = [
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
    ]

    it.each([[options], [nestedOptions]])(
        'should render a rich dropdown',
        (currentOptions) => {
            const {container} = render(
                <RichDropdown
                    onClick={jest.fn()}
                    options={currentOptions}
                    value="foo"
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
