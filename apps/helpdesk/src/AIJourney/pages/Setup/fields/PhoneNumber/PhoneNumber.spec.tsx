import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
        expect(
            screen.getByText('Select your agent’s phone number'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Phone number used for the conversation with the customer',
            ),
        ).toBeInTheDocument()
    })

    it('shows "Select" when no value is provided', () => {
        render(<PhoneNumberField options={mockPhoneNumbersArray} />)
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('calls onChange when a dropdown option is selected', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        render(
            <PhoneNumberField
                options={mockPhoneNumbersArray}
                onChange={onChange}
            />,
        )
        await act(async () => {
            await user.click(screen.getByText('Select'))
            await user.click(screen.getByText('+1 555-987-6543'))
        })
        expect(onChange).toHaveBeenCalledWith(mockPhoneNumbers[2])
    })
})
