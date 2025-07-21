import React from 'react'

import { render, screen } from '@testing-library/react'
import { UncontrolledButtonDropdown } from 'reactstrap'

import RichDropdownOptions from 'pages/common/components/RichDropdown/RichDropdownOptions'
import { userEvent } from 'utils/testing/userEvent'

describe('<RichDropdownOptions/>', () => {
    const onClick = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render a dropdown with options', () => {
        const { container } = render(
            <UncontrolledButtonDropdown>
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
            </UncontrolledButtonDropdown>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when option is clicked', () => {
        render(
            <UncontrolledButtonDropdown>
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
            </UncontrolledButtonDropdown>,
        )

        userEvent.click(screen.getByRole('menuitem', { name: 'Foo' }))

        expect(onClick.mock.calls.length).toBe(1)
        expect(onClick).toHaveBeenCalledTimes(1)
        expect(onClick).toHaveBeenLastCalledWith('foo')
    })
})
