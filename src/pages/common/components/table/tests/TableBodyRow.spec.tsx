import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import TableBodyRow from '../TableBodyRow'

describe('<TableBodyRow/>', () => {
    const mockOnClick = jest.fn()

    it('should render', () => {
        const {container} = render(
            <TableBodyRow className="foo">Foo</TableBodyRow>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when clicked', () => {
        const {container} = render(
            <TableBodyRow onClick={mockOnClick}>Foo</TableBodyRow>
        )

        if (container.firstChild) {
            fireEvent.click(container.firstChild)
        }

        expect(container.firstChild).toMatchSnapshot()
        expect(mockOnClick).toHaveBeenCalled()
    })
})
