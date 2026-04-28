import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import PeopleSearchInput from '../PeopleSearchInput'

describe('<PeopleSearchInput/>', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <PeopleSearchInput value="foo" onChange={onChange} />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('onChange()', () => {
        it('should call prop `onChange` with new value', () => {
            render(<PeopleSearchInput value="foo" onChange={onChange} />)

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: 'bar' },
            })

            expect(onChange).toHaveBeenCalledWith('bar')
        })
    })
})
