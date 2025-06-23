import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PhoneNumberField } from './PhoneNumber'

describe('<PhoneNumberField />', () => {
    const options = ['(415)-111-111', '(415)-222-222', '(415)-333-333']

    it('renders the field presentation and dropdown', () => {
        render(<PhoneNumberField options={options} value={options[0]} />)
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(
            screen.getByText('Phone number used for the conversation'),
        ).toBeInTheDocument()
        expect(screen.getAllByText(options[0]).length).toEqual(2) // One in the dropdown, one in the field presentation
    })

    it('shows "Select" when no value is provided', () => {
        render(<PhoneNumberField options={options} />)
        expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('calls onChange when a dropdown option is selected', async () => {
        const onChange = jest.fn()
        render(<PhoneNumberField options={options} onChange={onChange} />)
        await userEvent.click(screen.getByText('Select'))
        await userEvent.click(screen.getByText(options[1]))
        expect(onChange).toHaveBeenCalledWith(options[1])
    })
})
