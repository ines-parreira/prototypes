import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'
import {PhoneIntegration} from 'models/integration/types'
import PhoneDeviceDialerIntegrationSelect from '../PhoneDeviceDialerIntegrationSelect'

describe('PhoneDeviceDialerIntegrationSelect', () => {
    const options = [
        {id: 1, name: 'Integration 1'},
        {id: 2, name: 'Integration 2'},
    ] as PhoneIntegration[]
    const value = options[0]
    const onChange = jest.fn()

    const renderComponent = () =>
        render(
            <PhoneDeviceDialerIntegrationSelect
                value={value}
                onChange={onChange}
                options={options}
            />
        )

    it('renders the button with the selected integration name', () => {
        renderComponent()

        expect(
            screen.getByTestId('toggle-integration-dropdown')
        ).toHaveTextContent(/Integration 1/)
    })

    it('opens the dropdown when the button is clicked', () => {
        renderComponent()

        const button = screen.getByRole('button', {name: /Integration 1/})
        fireEvent.click(button)
        expect(screen.getAllByRole('option')).toHaveLength(options.length)
    })

    it('calls onChange when an option is selected', () => {
        renderComponent()

        const button = screen.getByRole('button', {name: /Integration 1/})
        fireEvent.click(button)
        const dropdownItem = screen.getByText(options[1].name)
        fireEvent.click(dropdownItem)

        expect(onChange).toHaveBeenCalledWith(options[1])
    })
})
