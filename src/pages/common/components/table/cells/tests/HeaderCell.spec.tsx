import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import HeaderCell from '../HeaderCell'

describe('<HeaderCell/>', () => {
    const mockOnClick = jest.fn()

    it('should render', () => {
        const {container} = render(<HeaderCell className="foo">Foo</HeaderCell>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render in small size', () => {
        const {container} = render(
            <HeaderCell className="foo" size="small">
                Foo
            </HeaderCell>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render in smallest size', () => {
        const {container} = render(
            <HeaderCell className="foo" size="smallest">
                Foo
            </HeaderCell>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when clicked', () => {
        render(<HeaderCell onClick={mockOnClick}>Foo</HeaderCell>)

        fireEvent.click(screen.getByRole('columnheader'))

        expect(mockOnClick).toHaveBeenCalled()
    })
})
