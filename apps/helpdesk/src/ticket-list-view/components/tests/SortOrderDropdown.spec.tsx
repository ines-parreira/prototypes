import { fireEvent, render, screen } from '@testing-library/react'

import SortOrderDropdown from '../SortOrderDropdown'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useId: jest.fn().mockImplementation(() => 'mocked'),
}))

describe('<SortingDropdown />', () => {
    it('should display a dropdown with its current value', () => {
        render(
            <SortOrderDropdown
                onChange={jest.fn()}
                value="created_datetime:asc"
            />,
        )

        fireEvent.click(screen.getByText('swap_vert'))
        expect(
            screen.getByRole('option', {
                name: /↑ Created/,
            }).textContent,
        ).toContain('done')
    })

    it('should update the selected value of the dropdown', () => {
        const onChange = jest.fn()
        render(
            <SortOrderDropdown
                onChange={onChange}
                value="created_datetime:asc"
            />,
        )

        fireEvent.click(screen.getByText('swap_vert'))
        fireEvent.click(screen.getByText('↓ Created'))

        expect(onChange).toHaveBeenCalledWith('created_datetime:desc')
        expect(screen.queryByText('↓ Created')).not.toBeInTheDocument()
    })
})
