import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { NewPhoneNumber } from 'models/phoneNumber/types'

import { Dropdown } from './Dropdown'

const mockPhoneNumbersArray: NewPhoneNumber[] = Object.values(mockPhoneNumbers)

describe('<Dropdown />', () => {
    it('renders with placeholder when no value is selected', () => {
        render(<Dropdown options={mockPhoneNumbersArray} />)
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('renders with the selected value', () => {
        render(
            <Dropdown
                options={mockPhoneNumbersArray}
                value={mockPhoneNumbersArray[2]}
            />,
        )

        const option = screen.getAllByText('555-111-2222')
        expect(option).toHaveLength(2) // option in the list and in the selected state
    })

    it('shows options when clicked', async () => {
        render(<Dropdown options={mockPhoneNumbersArray} />)
        const trigger = screen.getByRole('group')
        await userEvent.click(trigger)
        mockPhoneNumbersArray.forEach((option) => {
            expect(
                screen.getByText(
                    option.phone_number_friendly.replace(/^[^\s]+\s/, ''),
                ),
            ).toBeInTheDocument()
        })
    })

    it('calls onChange when an option is clicked', async () => {
        const onChange = jest.fn()
        render(<Dropdown options={mockPhoneNumbersArray} onChange={onChange} />)
        const trigger = screen.getByRole('group')
        await userEvent.click(trigger)
        await userEvent.click(screen.getByText('555-111-2222'))
        expect(onChange).toHaveBeenCalledWith(mockPhoneNumbersArray[2])
    })

    it('closes the dropdown after selecting an option', async () => {
        render(<Dropdown options={mockPhoneNumbersArray} />)
        const trigger = screen.getByRole('group')
        expect(screen.queryByRole('listbox')).not.toHaveClass('--open')

        await userEvent.click(trigger)
        expect(screen.getByText('555-111-2222')).toBeVisible()
        await userEvent.click(screen.getByText('555-111-2222'))

        expect(screen.queryByRole('listbox')).not.toHaveClass('--open')
    })
})
