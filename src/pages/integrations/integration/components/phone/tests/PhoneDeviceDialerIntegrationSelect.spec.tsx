import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {PhoneIntegration} from 'models/integration/types'
import {assumeMock} from 'utils/testing'

import PhoneDeviceDialerIntegrationSelect from '../PhoneDeviceDialerIntegrationSelect'
import usePhoneNumbers from '../usePhoneNumbers'

jest.mock('pages/integrations/integration/components/phone/usePhoneNumbers')

const usePhoneNumbersMock = assumeMock(usePhoneNumbers)

describe('PhoneDeviceDialerIntegrationSelect', () => {
    const options = [
        {id: 1, name: 'Integration 1', meta: {}},
        {id: 2, name: 'Integration 2', meta: {}},
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

    beforeEach(() => {
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: (id: number) => ({
                phone_number_friendly: `phone_number_friendly_${id}`,
            }),
        } as any)
    })

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
