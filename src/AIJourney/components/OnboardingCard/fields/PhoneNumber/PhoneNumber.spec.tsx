import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { NewPhoneNumber } from 'models/phoneNumber/types'

import { PhoneNumberField } from './PhoneNumber'

const mockPhoneNumbersArray: NewPhoneNumber[] = Object.values(mockPhoneNumbers)

describe('<PhoneNumberField />', () => {
    it('renders the field presentation and dropdown', () => {
        render(
            <PhoneNumberField
                options={mockPhoneNumbersArray}
                value={mockPhoneNumbers[0]}
            />,
        )
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(
            screen.getByText('Phone number used for the conversation'),
        ).toBeInTheDocument()
    })

    it('shows "Select" when no value is provided', () => {
        render(<PhoneNumberField options={mockPhoneNumbersArray} />)
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('calls onChange when a dropdown option is selected', async () => {
        const onChange = jest.fn()
        render(
            <PhoneNumberField
                options={mockPhoneNumbersArray}
                onChange={onChange}
            />,
        )
        await userEvent.click(screen.getByText('Select'))
        await userEvent.click(screen.getByText('555-987-6543'))
        expect(onChange).toHaveBeenCalledWith(mockPhoneNumbers[2])
    })
})
