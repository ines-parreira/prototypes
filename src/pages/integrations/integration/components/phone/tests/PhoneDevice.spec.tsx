import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'
import PhoneDevice from '../PhoneDevice'

jest.mock(
    'pages/common/forms/PhoneNumberInput/PhoneNumberInput',
    () =>
        ({
            onChange,
            value,
        }: {
            onChange: (value: string) => void
            value: string
        }) =>
            (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    data-testid="mock-phone-input"
                />
            )
)

jest.mock(
    'pages/integrations/integration/components/phone/DialPad',
    () =>
        ({
            onChange,
            value,
        }: {
            onChange: (value: string) => void
            value: string
        }) =>
            (
                <div data-testid="mock-dialpad">
                    <div
                        onClick={() => onChange(value + '1')}
                        data-testid="mock-dialpad-digit"
                    />
                </div>
            )
)

const renderComponent = () => {
    return render(
        <PhoneDevice
            isOpen={true}
            setIsOpen={() => {}}
            target={{current: null} as React.RefObject<null>}
        />
    )
}

describe('PhoneDevice', () => {
    it('renders initial state correctly: phone number input, dialpad, integration selector and cta', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(screen.getByTestId('mock-dialpad')).toBeInTheDocument()
        expect(screen.getByText('Select integration')).toBeInTheDocument()
        expect(screen.getByText('Call')).toBeInTheDocument()
    })

    it('updates the input value when handleChange is called', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})
        expect(inputElement.value).toBe('1234567890')

        fireEvent.click(screen.getByTestId('mock-dialpad-digit'))
        expect(inputElement.value).toBe('12345678901')
    })
})
