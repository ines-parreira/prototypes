import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Dropdown } from './Dropdown'

describe('<Dropdown />', () => {
    const options = ['Option 1', 'Option 2', 'Option 3']

    it('renders with placeholder when no value is selected', () => {
        render(<Dropdown options={options} />)
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('renders with the selected value', () => {
        render(<Dropdown options={options} value="Option 2" />)

        const option = screen.getAllByText('Option 2')
        expect(option).toHaveLength(2) // option in the list and in the selected state
    })

    it('shows options when clicked', async () => {
        render(<Dropdown options={options} />)
        const trigger = screen.getByRole('group')
        await userEvent.click(trigger)
        options.forEach((option) => {
            expect(screen.getByText(option)).toBeInTheDocument()
        })
    })

    it('calls onChange when an option is clicked', async () => {
        const onChange = jest.fn()
        render(<Dropdown options={options} onChange={onChange} />)
        const trigger = screen.getByRole('group')
        await userEvent.click(trigger)
        await userEvent.click(screen.getByText('Option 3'))
        expect(onChange).toHaveBeenCalledWith('Option 3')
    })

    it('closes the dropdown after selecting an option', async () => {
        render(<Dropdown options={options} />)
        const trigger = screen.getByRole('group')
        expect(screen.queryByRole('listbox')).not.toHaveClass('--open')

        await userEvent.click(trigger)
        expect(screen.getByText('Option 1')).toBeVisible()
        await userEvent.click(screen.getByText('Option 1'))

        expect(screen.queryByRole('listbox')).not.toHaveClass('--open')
    })
})
